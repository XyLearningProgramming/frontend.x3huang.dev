<script setup lang="ts">
/**
 * RulerToc — Minimal ruler navigation on the left edge of the page.
 *
 * Architecture:
 *   - Sections are defined in a static registry (SECTION_ORDER / SECTION_LABELS).
 *   - A lightweight scan() checks which IDs actually exist in the DOM.
 *   - NO HTMLElement references are stored in reactive state — elements are
 *     looked up by ID at read-time (scroll tracking, navigation clicks).
 *   - A single debounced scan handles all DOM changes (route, chat, transitions).
 *   - All event listeners are registered in onMounted, cleaned up in onUnmounted.
 *
 * Visibility:
 *   - Index page in discovery mode: shows section markers.
 *   - Blog pages: hidden (they have their own sidebar TOC).
 *   - Sub-pages / focus mode: hidden.
 *   - Mobile (<1024px): hidden via CSS.
 */

import { usePageTransition } from '~/composables/usePageTransition'
import { useScrollSections, type SectionId } from '~/composables/useScrollSections'
import { useCanvasCamera } from '~/composables/useCanvasCamera'

const route = useRoute()
const { isTransitioning } = usePageTransition()
const { scrollTo: scrollToSection } = useScrollSections()
const { isFocused } = useCanvasCamera()

// ── Section registry ──────────────────────────────────────────────────
interface TocItem {
  id: string
  label: string
}

const SECTION_LABELS: Record<string, string> = {
  chat: 'Chat',
  hero: 'Home',
  posts: 'Posts',
  space: 'Space',
  tools: 'Tools',
}

/** DOM order of sections on the index page */
const SECTION_ORDER = ['chat', 'hero', 'posts', 'space', 'tools'] as const

// ── Reactive state ────────────────────────────────────────────────────
const items = shallowRef<TocItem[]>([])
const activeIdx = ref(0)
const scrollProgress = ref(0)
const hoveredIdx = ref<number | null>(null)
const labelsOpen = ref(false)
const navRef = ref<HTMLElement | null>(null)

// ── Visibility ────────────────────────────────────────────────────────
const isIndexPage = computed(() => route.path === '/' || route.path === '')
const visible = computed(() =>
  isIndexPage.value && !isFocused.value && items.value.length >= 2,
)

// ── DOM scanning (lightweight: only checks which section IDs exist) ──
let scanTimer: ReturnType<typeof setTimeout> | null = null

function scan() {
  if (!import.meta.client) return
  // Don't scan during transitions — the DOM is in flux
  if (isTransitioning.value) return

  if (!isIndexPage.value) {
    items.value = []
    return
  }

  const found: TocItem[] = []
  for (const id of SECTION_ORDER) {
    if (document.getElementById(id)) {
      found.push({ id, label: SECTION_LABELS[id] || id })
    }
  }

  // Only update if the set of IDs actually changed (prevents needless re-renders)
  const prev = items.value
  const changed =
    prev.length !== found.length ||
    prev.some((p, i) => p.id !== found[i]?.id)
  if (changed) {
    items.value = found
  }
}

function debouncedScan(delay = 200) {
  if (scanTimer) clearTimeout(scanTimer)
  scanTimer = setTimeout(scan, delay)
}

// ── Scroll tracking ───────────────────────────────────────────────────
/** Reads element positions from the live DOM each frame — never stale. */
function updateScroll() {
  if (!import.meta.client || items.value.length === 0) return

  const vh = window.innerHeight
  const scrollY = window.scrollY
  const topThreshold = scrollY + vh * 0.3
  const bottomThreshold = scrollY + vh * 0.1

  let foundIdx = 0
  let progress = 0

  for (let i = 0; i < items.value.length; i++) {
    const el = document.getElementById(items.value[i].id)
    if (!el) continue

    const rect = el.getBoundingClientRect()
    const top = rect.top + scrollY

    // Section bottom = next section's top, or document end
    let sectionBottom: number
    if (i + 1 < items.value.length) {
      const nextEl = document.getElementById(items.value[i + 1].id)
      sectionBottom = nextEl
        ? nextEl.getBoundingClientRect().top + scrollY
        : document.documentElement.scrollHeight
    } else {
      sectionBottom = document.documentElement.scrollHeight
    }

    // Section is active: scrolled past its top AND not fully past its bottom
    if (topThreshold >= top && bottomThreshold < sectionBottom) {
      foundIdx = i
      const sectionHeight = sectionBottom - top
      const scrolledInto = topThreshold - top
      progress =
        sectionHeight > 0
          ? Math.min(1, Math.max(0, scrolledInto / sectionHeight))
          : 0
    }
  }

  activeIdx.value = foundIdx
  scrollProgress.value = progress
}

// ── Marker position (percentage along the ruler) ──────────────────────
const markerPercent = computed(() => {
  const count = items.value.length
  if (count === 0) return 0
  const segSize = 100 / count
  return activeIdx.value * segSize + scrollProgress.value * segSize
})

// ── Proximity state machine (labels panel open/close) ─────────────────
const OPEN_THRESHOLD = 36
const CLOSE_THRESHOLD = 260

function onMouseMove(e: MouseEvent) {
  if (!labelsOpen.value) {
    if (e.clientX <= OPEN_THRESHOLD) labelsOpen.value = true
  } else {
    if (e.clientX > CLOSE_THRESHOLD) {
      labelsOpen.value = false
      return
    }
    if (navRef.value) {
      const rect = navRef.value.getBoundingClientRect()
      if (e.clientY < rect.top - 30 || e.clientY > rect.bottom + 30) {
        labelsOpen.value = false
      }
    }
  }
}

// ── Navigation ────────────────────────────────────────────────────────
function handleClick(idx: number) {
  const item = items.value[idx]
  if (!item) return

  if (item.id === 'hero') {
    scrollToSection('main')
  } else {
    scrollToSection(item.id as SectionId)
  }
}

// ── Adaptive height ───────────────────────────────────────────────────
const rulerHeight = computed(() => {
  const count = items.value.length
  if (count <= 4) return '35vh'
  if (count <= 8) return '45vh'
  return '60vh'
})

// ── Lifecycle ─────────────────────────────────────────────────────────
let raf = 0
let observer: MutationObserver | null = null

function loop() {
  updateScroll()
  raf = requestAnimationFrame(loop)
}

onMounted(() => {
  // Initial scan (slight delay lets async sections mount)
  setTimeout(scan, 150)

  // Start scroll tracking loop
  raf = requestAnimationFrame(loop)

  // Mouse proximity for labels
  window.addEventListener('mousemove', onMouseMove, { passive: true })

  // MutationObserver catches the chat section appearing/disappearing
  observer = new MutationObserver(() => debouncedScan(150))
  observer.observe(document.body, { childList: true, subtree: true })

  // Auto-stop heavy DOM watching after 10s (chat toggle is the main use case)
  setTimeout(() => observer?.disconnect(), 10_000)
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
  if (scanTimer) clearTimeout(scanTimer)
  observer?.disconnect()
  window.removeEventListener('mousemove', onMouseMove)
})

// Re-scan when route changes (SPA navigation)
watch(() => route.path, () => debouncedScan(300))

// Re-scan after a page transition completes (new DOM)
watch(isTransitioning, (transitioning) => {
  if (!transitioning) debouncedScan(400)
})

// Re-scan when focus mode changes (index-only sections may appear/disappear)
watch(isFocused, () => debouncedScan(300))
</script>

<template>
  <Teleport to="body">
    <nav
      ref="navRef"
      class="ruler-toc"
      :class="{ 'ruler-toc--visible': visible }"
      :style="{ height: rulerHeight }"
      aria-label="Page navigation"
    >
      <!-- Ruler track (thin vertical bar, always present when visible) -->
      <div class="ruler-track">
        <div
          v-for="(item, idx) in items"
          :key="item.id"
          class="ruler-seg"
          :class="{
            'ruler-seg--active': idx === activeIdx,
            'ruler-seg--hovered': hoveredIdx === idx,
          }"
          :style="{ height: `${100 / items.length}%` }"
          @click="handleClick(idx)"
          @mouseenter="hoveredIdx = idx"
          @mouseleave="hoveredIdx = null"
        >
          <!-- Major tick at top edge -->
          <div
            class="ruler-tick"
            :class="{ 'ruler-tick--active': idx === activeIdx }"
          />
          <!-- Minor ticks for ruler texture -->
          <div class="ruler-minor" style="top: 33%;" />
          <div class="ruler-minor" style="top: 66%;" />
        </div>

        <!-- Red dot — position tracks scroll progress -->
        <div class="ruler-dot" :style="{ top: `${markerPercent}%` }">
          <div class="ruler-dot__circle" />
        </div>
      </div>

      <!-- Labels column (revealed on hover/proximity) -->
      <div
        class="ruler-labels"
        :class="{ 'ruler-labels--open': labelsOpen }"
      >
        <button
          v-for="(item, idx) in items"
          :key="item.id"
          class="ruler-label"
          :class="{
            'ruler-label--active': idx === activeIdx,
            'ruler-label--hovered': hoveredIdx === idx,
            'ruler-label--dimmed':
              hoveredIdx !== null && hoveredIdx !== idx && idx !== activeIdx,
          }"
          :style="{ height: `${100 / items.length}%` }"
          :title="item.label"
          @click="handleClick(idx)"
          @mouseenter="hoveredIdx = idx"
          @mouseleave="hoveredIdx = null"
        >
          <span class="ruler-label__num">
            {{ String(idx + 1).padStart(2, '0') }}
          </span>
          <span class="ruler-label__text">{{ item.label }}</span>
        </button>
      </div>
    </nav>
  </Teleport>
</template>

<style scoped>
/* ═══════════════════════════════════════════════════════════════
   Ruler TOC — left-edge navigation
   Dalí "Midnight Carnival" art style:
   - hard edges, no blur, monospace type
   - red accent dot, cream labels panel with void border
   ═══════════════════════════════════════════════════════════════ */

.ruler-toc {
  position: fixed;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 80;
  display: flex;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.ruler-toc--visible {
  opacity: 1;
  pointer-events: auto;
}

/* ── Ruler track (thin vertical bar) ─────────────────────────── */

.ruler-track {
  position: relative;
  width: 16px;
  height: 100%;
  flex-shrink: 0;
}

.ruler-seg {
  position: relative;
  width: 100%;
  cursor: pointer;
  transition: background 0.15s ease;
}

.ruler-seg:hover {
  background: rgba(237, 28, 36, 0.06);
}

/* Major tick */
.ruler-tick {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background: var(--color-dali-muted, #999);
  opacity: 0.18;
  transition: all 0.2s ease;
}

.ruler-tick--active {
  opacity: 0.6;
  height: 2px;
  background: var(--color-dali-red, #ed1c24);
}

/* Minor ticks (ruler texture) */
.ruler-minor {
  position: absolute;
  right: 0;
  width: 5px;
  height: 1px;
  background: var(--color-dali-muted, #999);
  opacity: 0.1;
}

/* ── Red dot (scroll position indicator) ─────────────────────── */

.ruler-dot {
  position: absolute;
  left: 0;
  transform: translateY(-50%);
  pointer-events: none;
  z-index: 2;
  transition: top 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.ruler-dot__circle {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-dali-red, #ed1c24);
  margin-left: 4px;
  border: 1px solid var(--color-dali-void, #0b0b0f);
}

/* ── Labels column ───────────────────────────────────────────── */
/* Neobrutalism: solid bg, hard border, no blur, Dalí red shadow */

.ruler-labels {
  display: flex;
  flex-direction: column;
  width: 220px;
  padding: 4px 0 4px 6px;
  background: var(--color-dali-cream, #fdf6e3);
  border: 2px solid var(--color-dali-void, #0b0b0f);
  border-left: none;
  box-shadow: var(--shadow-dali-sm, 2px 2px 0px 0px #ed1c24);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease;
}

.ruler-labels--open {
  opacity: 1;
  pointer-events: auto;
}

/* ── Label button ────────────────────────────────────────────── */

.ruler-label {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 10px 2px 6px;
  cursor: pointer;
  background: none;
  border: none;
  border-left: 2px solid transparent;
  text-align: left;
  white-space: normal;
  overflow: hidden;
  transition:
    border-color 0.2s ease,
    transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 0.2s ease;
}

.ruler-label--active {
  border-left-color: var(--color-dali-red, #ed1c24);
}

.ruler-label--hovered {
  transform: translateX(4px) scale(1.08);
  border-left-color: var(--color-dali-red, #ed1c24);
}

.ruler-label--dimmed {
  opacity: 0.35;
}

/* Number */
.ruler-label__num {
  font-family: var(--font-dali-mono, monospace);
  font-size: 8px;
  min-width: 14px;
  flex-shrink: 0;
  color: var(--color-dali-void, #0b0b0f);
  opacity: 0.35;
  transition: color 0.2s ease, opacity 0.2s ease;
}

.ruler-label--active .ruler-label__num {
  color: var(--color-dali-red, #ed1c24);
  opacity: 0.9;
}

.ruler-label--hovered .ruler-label__num {
  color: var(--color-dali-red, #ed1c24);
  opacity: 1;
}

/* Text */
.ruler-label__text {
  font-family: var(--font-dali-mono, monospace);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--color-dali-void, #0b0b0f);
  opacity: 0.6;
  line-height: 1.3;
  transition:
    color 0.2s ease,
    font-size 0.2s ease,
    font-weight 0.2s ease,
    opacity 0.2s ease;
}

.ruler-label--active .ruler-label__text {
  color: var(--color-dali-red, #ed1c24);
  font-weight: 700;
  opacity: 1;
}

.ruler-label--hovered .ruler-label__text {
  color: var(--color-dali-void, #0b0b0f);
  font-weight: 700;
  font-size: 11px;
  opacity: 1;
}

/* ── Hide on mobile ──────────────────────────────────────────── */
@media (max-width: 1023px) {
  .ruler-toc {
    display: none !important;
  }
}
</style>
