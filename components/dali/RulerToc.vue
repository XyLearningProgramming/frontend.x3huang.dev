<script setup lang="ts">
/**
 * RulerToc — Compact vertical pill navigation on the left edge of the page.
 *
 * Architecture:
 *   - Sections are defined in a static registry (SECTION_ORDER / SECTION_LABELS).
 *   - A lightweight scan() checks which IDs actually exist in the DOM.
 *   - NO HTMLElement references are stored in reactive state — elements are
 *     looked up by ID at read-time (scroll tracking, navigation clicks).
 *   - A single debounced scan handles all DOM changes (route, transitions).
 *   - Chat section visibility is driven by the reactive chatHasMessages signal.
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

// Injected from index.vue — reactively tracks whether chat messages exist.
const chatHasMessages = inject<Ref<boolean>>('chatHasMessages', ref(false))

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
const hoveredIdx = ref<number | null>(null)
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
    }
  }

  activeIdx.value = foundIdx
}

// ── Active marker position (px offset within the nav) ─────────────────
const ITEM_HEIGHT = 28 // px per item — matches CSS
const markerTop = computed(() => {
  return activeIdx.value * ITEM_HEIGHT
})

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

// ── Lifecycle ─────────────────────────────────────────────────────────
let raf = 0

function loop() {
  updateScroll()
  raf = requestAnimationFrame(loop)
}

onMounted(() => {
  // Initial scan (slight delay lets async sections mount)
  setTimeout(scan, 150)

  // Start scroll tracking loop
  raf = requestAnimationFrame(loop)
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
  if (scanTimer) clearTimeout(scanTimer)
})

// Re-scan when route changes (SPA navigation)
watch(() => route.path, () => debouncedScan(300))

// Re-scan after a page transition completes (new DOM)
watch(isTransitioning, (transitioning) => {
  if (!transitioning) debouncedScan(400)
})

// Re-scan when focus mode changes (index-only sections may appear/disappear)
watch(isFocused, () => debouncedScan(300))

// Re-scan when chat history appears/disappears (reactive — no MutationObserver needed)
watch(chatHasMessages, () => debouncedScan(300))
</script>

<template>
  <Teleport to="body">
    <nav
      ref="navRef"
      class="toc-pill"
      :class="{ 'toc-pill--visible': visible }"
      aria-label="Page navigation"
    >
      <!-- Active marker — red bar that slides between items -->
      <div
        class="toc-marker"
        :style="{ transform: `translateY(${markerTop}px)` }"
      />

      <!-- Section items -->
      <button
        v-for="(item, idx) in items"
        :key="item.id"
        class="toc-item"
        :class="{
          'toc-item--active': idx === activeIdx,
          'toc-item--hovered': hoveredIdx === idx,
          'toc-item--dimmed':
            hoveredIdx !== null && hoveredIdx !== idx && idx !== activeIdx,
        }"
        :title="item.label"
        @click="handleClick(idx)"
        @mouseenter="hoveredIdx = idx"
        @mouseleave="hoveredIdx = null"
      >
        <span class="toc-item__num">{{ String(idx + 1).padStart(2, '0') }}</span>
        <span class="toc-item__text">{{ item.label }}</span>
      </button>
    </nav>
  </Teleport>
</template>

<style scoped>
/* ═══════════════════════════════════════════════════════════════
   Pill TOC — left-edge vertical navigation
   Dalí "Midnight Carnival" art style:
   - always-visible labels, compact monospace type
   - red accent marker, translucent dark backdrop
   ═══════════════════════════════════════════════════════════════ */

.toc-pill {
  position: fixed;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 80;
  display: flex;
  flex-direction: column;
  padding: 6px 0;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.4s ease;

  /* Frosted glass backdrop */
  background: rgba(11, 11, 15, 0.55);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(237, 28, 36, 0.15);
  border-radius: 8px;
}

.toc-pill--visible {
  opacity: 1;
  pointer-events: auto;
}

/* ── Active marker (sliding red bar) ─────────────────────────── */

.toc-marker {
  position: absolute;
  left: 0;
  top: 6px; /* matches pill padding-top */
  width: 3px;
  height: 28px; /* matches ITEM_HEIGHT */
  background: var(--color-dali-red, #ed1c24);
  border-radius: 0 2px 2px 0;
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  z-index: 2;
}

/* ── Item button ─────────────────────────────────────────────── */

.toc-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 14px 0 12px;
  cursor: pointer;
  background: none;
  border: none;
  text-align: left;
  white-space: nowrap;
  transition:
    opacity 0.2s ease,
    transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toc-item:hover {
  transform: translateX(2px);
}

.toc-item--dimmed {
  opacity: 0.35;
}

/* ── Number ──────────────────────────────────────────────────── */

.toc-item__num {
  font-family: var(--font-dali-mono, monospace);
  font-size: 9px;
  min-width: 16px;
  flex-shrink: 0;
  color: rgba(240, 237, 229, 0.3);
  transition: color 0.2s ease;
}

.toc-item--active .toc-item__num {
  color: var(--color-dali-red, #ed1c24);
}

.toc-item--hovered .toc-item__num {
  color: rgba(240, 237, 229, 0.7);
}

/* ── Text ────────────────────────────────────────────────────── */

.toc-item__text {
  font-family: var(--font-dali-mono, monospace);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(240, 237, 229, 0.45);
  line-height: 1;
  transition: color 0.2s ease, font-weight 0.2s ease;
}

.toc-item--active .toc-item__text {
  color: var(--color-dali-white, #F0EDE5);
  font-weight: 700;
}

.toc-item--hovered .toc-item__text {
  color: rgba(240, 237, 229, 0.85);
}

/* ── Hide on mobile ──────────────────────────────────────────── */
@media (max-width: 1023px) {
  .toc-pill {
    display: none !important;
  }
}
</style>
