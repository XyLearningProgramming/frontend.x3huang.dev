<script setup lang="ts">
/**
 * RulerToc — Transparent ruler on the left edge of every page.
 *
 * Detects context automatically:
 *  1. Canvas focus mode with a post open: scans blog headings in .dali-focus
 *  2. Canvas focus mode with other panels (about, contact, gallery, blogs listing): no TOC
 *  3. Discovery mode: scans <section id> landmarks (excluding footer)
 *
 * Uses MutationObserver to catch late-rendered <ClientOnly> content.
 * Reads useFocusPanel's activePanel to determine what's shown in focus.
 */

import { useCanvasCamera } from '~/composables/useCanvasCamera'
import { useFocusPanel } from '~/composables/useFocusPanel'

const route = useRoute()
const { isFocused, focusTarget } = useCanvasCamera()
const { activePanel } = useFocusPanel()

// ——— Detected sections ———
interface TocItem {
  id: string
  label: string
  el: HTMLElement
}

const items = ref<TocItem[]>([])
const activeIdx = ref(0)
const scrollProgress = ref(0)
const hoveredIdx = ref<number | null>(null)

// Whether the labels panel is currently open (state machine, not raw proximity)
const labelsOpen = ref(false)
const navRef = ref<HTMLElement | null>(null)

// IDs to exclude from section-based TOC (non-content sections)
const EXCLUDED_SECTIONS = new Set(['footer'])

// Clean up extracted text: normalize whitespace and strip leading anchor chars
function cleanLabel(raw: string): string {
  return raw.replace(/\s+/g, ' ').replace(/^#\s*/, '').trim()
}

// ——— Determine current mode ———
type TocMode = 'discovery' | 'focus-post' | 'focus-other' | 'inline-post'

function getMode(): TocMode {
  // When the focus panel has a post open (about/contact/gallery), no TOC
  if (isFocused.value) {
    return 'focus-other'
  }

  // Check if an inline blog reader is open (rendered in the discovery column)
  if (import.meta.client && document.getElementById('reader')) {
    return 'inline-post'
  }

  return 'discovery'
}

// ——— DOM scanning ———
function scan() {
  if (!import.meta.client) return

  const mode = getMode()
  const found: TocItem[] = []

  if (mode === 'focus-other') {
    // No meaningful TOC for about/contact/gallery focus panels
    items.value = []
    return
  }

  if (mode === 'discovery') {
    // Strategy: <section id> landmarks on index page — skip excluded IDs
    const sections = document.querySelectorAll('section[id]')
    sections.forEach((el) => {
      const id = el.id
      if (EXCLUDED_SECTIONS.has(id)) return

      const heading = el.querySelector('h1, h2, h3')
      let label = cleanLabel(heading?.textContent || '')
      if (!label) label = id.charAt(0).toUpperCase() + id.slice(1)
      found.push({ id, label, el: el as HTMLElement })
    })
  }

  if (mode === 'inline-post') {
    // Strategy: headings in the inline blog reader section
    const container = document.getElementById('reader') || document

    const headings = container.querySelectorAll(
      '.blog-content h2[id], .blog-content h3[id], article h2[id], article h3[id]',
    )
    headings.forEach((el) => {
      const id = (el as HTMLElement).id
      const label = cleanLabel(el.textContent || '') || id
      found.push({ id, label, el: el as HTMLElement })
    })

    // Prepend a "Top" item for the post title
    if (found.length > 0) {
      const pageTitle = container.querySelector('article h1, h1')
      if (pageTitle) {
        const topLabel = cleanLabel(pageTitle.textContent || '') || 'Top'
        found.unshift({
          id: '__top',
          label: topLabel,
          el: pageTitle as HTMLElement,
        })
      }
    }
  }

  items.value = found
}

// Retry scan with MutationObserver (catches <ClientOnly> rendered content)
let observer: MutationObserver | null = null
let scanRetries = 0

function startObserving() {
  if (!import.meta.client) return
  observer?.disconnect()
  scanRetries = 0

  observer = new MutationObserver(() => {
    scanRetries++
    scan()
    if (items.value.length >= 2 || scanRetries > 30) {
      observer?.disconnect()
    }
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })

  // Auto-stop after 8 seconds regardless
  setTimeout(() => observer?.disconnect(), 8000)
}

function resetAndRescan(delay = 300) {
  observer?.disconnect()
  items.value = []
  activeIdx.value = 0
  scrollProgress.value = 0
  setTimeout(() => {
    scan()
    startObserving()
  }, delay)
}

// ——— Scroll tracking ———
function updateScroll() {
  if (!import.meta.client || items.value.length === 0) return

  // Inline posts and discovery mode use native window scroll
  const mode = getMode()
  const focusEl: HTMLElement | null = null // No separate scroll container for inline posts

  const vh = window.innerHeight
  let foundIdx = 0
  let progress = 0

  // Use getBoundingClientRect() uniformly for all modes.
  // For focus-post: positions are relative to the scrollable .dali-focus container.
  // For discovery: positions are absolute document coordinates.
  const containerRect = focusEl?.getBoundingClientRect()
  const scrollY = focusEl ? focusEl.scrollTop : window.scrollY

  for (let i = 0; i < items.value.length; i++) {
    const el = items.value[i].el
    const elRect = el.getBoundingClientRect()

    const top = focusEl && containerRect
      ? elRect.top - containerRect.top + focusEl.scrollTop
      : elRect.top + window.scrollY

    let nextTop: number
    if (i + 1 < items.value.length) {
      const nextRect = items.value[i + 1].el.getBoundingClientRect()
      nextTop = focusEl && containerRect
        ? nextRect.top - containerRect.top + focusEl.scrollTop
        : nextRect.top + window.scrollY
    } else {
      nextTop = focusEl ? focusEl.scrollHeight : document.documentElement.scrollHeight
    }

    if (scrollY + vh * 0.3 >= top) {
      foundIdx = i
      const sectionHeight = nextTop - top
      const scrolledInto = (scrollY + vh * 0.3) - top
      progress = sectionHeight > 0 ? Math.min(1, Math.max(0, scrolledInto / sectionHeight)) : 0
    }
  }

  activeIdx.value = foundIdx
  scrollProgress.value = progress
}

// ——— Marker position ———
const markerPercent = computed(() => {
  const count = items.value.length
  if (count === 0) return 0
  const segSize = 100 / count
  return activeIdx.value * segSize + scrollProgress.value * segSize
})

// ——— Proximity tracking (state machine) ———
// Open when mouse approaches ruler track; close when mouse moves far beyond the panel
const OPEN_THRESHOLD = 36      // px from left to trigger open (≈ ruler track width + margin)
const CLOSE_THRESHOLD = 260    // px from left to close (ruler 16 + labels 220 + margin 24)

function onMouseMove(e: MouseEvent) {
  const x = e.clientX
  const y = e.clientY

  if (!labelsOpen.value) {
    // Closed → open when mouse is near the ruler track
    if (x <= OPEN_THRESHOLD) labelsOpen.value = true
  } else {
    // Open → close when mouse moves past the panel's right edge
    if (x > CLOSE_THRESHOLD) {
      labelsOpen.value = false
      return
    }
    // Also close if mouse is vertically outside the ruler area (with some grace)
    if (navRef.value) {
      const rect = navRef.value.getBoundingClientRect()
      if (y < rect.top - 30 || y > rect.bottom + 30) {
        labelsOpen.value = false
      }
    }
  }
}

const labelsVisible = computed(() => labelsOpen.value)

// ——— Navigation ———
function scrollTo(idx: number) {
  const item = items.value[idx]
  if (!item) return

  if (item.id === '__top') {
    // For inline posts, scroll to the reader section top
    const readerEl = document.getElementById('reader')
    if (readerEl) {
      readerEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  } else {
    item.el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// ——— Lifecycle ———
let raf = 0

function loop() {
  updateScroll()
  raf = requestAnimationFrame(loop)
}

onMounted(() => {
  setTimeout(scan, 200)
  startObserving()
  raf = requestAnimationFrame(loop)
  window.addEventListener('mousemove', onMouseMove, { passive: true })
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
  observer?.disconnect()
  window.removeEventListener('mousemove', onMouseMove)
})

// Re-scan on route change (full navigation)
watch(() => route.fullPath, () => {
  resetAndRescan(300)
})

// Re-scan when focus panel state changes (hash-based transitions)
watch([isFocused, activePanel], () => {
  // Give the focus panel content time to render
  resetAndRescan(isFocused.value ? 800 : 200)
})

// Re-scan on hash changes (inline blog posts use hash routing)
if (import.meta.client) {
  window.addEventListener('hashchange', () => {
    resetAndRescan(500)
  })
}

const visible = computed(() => items.value.length >= 2)

// Adaptive height: scale ruler based on item count (min 30vh, max 60vh)
const rulerHeight = computed(() => {
  const count = items.value.length
  if (count <= 4) return '35vh'
  if (count <= 8) return '45vh'
  return '60vh'
})
</script>

<template>
  <nav
    ref="navRef"
    v-show="visible"
    class="ruler-toc"
    :style="{ height: rulerHeight }"
    aria-label="Page navigation"
  >
    <!-- Ruler track -->
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
        @click="scrollTo(idx)"
        @mouseenter="hoveredIdx = idx"
        @mouseleave="hoveredIdx = null"
      >
        <!-- Tick at top edge -->
        <div class="ruler-tick" :class="{ 'ruler-tick--active': idx === activeIdx }" />
        <!-- Minor ticks -->
        <div class="ruler-minor" style="top: 33%;" />
        <div class="ruler-minor" style="top: 66%;" />
      </div>

      <!-- Red dot -->
      <div
        class="ruler-dot"
        :style="{ top: `${markerPercent}%` }"
      >
        <div class="ruler-dot__circle" />
      </div>
    </div>

    <!-- Labels column: all labels always rendered, opacity controlled by proximity -->
    <div
      class="ruler-labels"
      :style="{ opacity: labelsVisible ? 1 : 0, pointerEvents: labelsVisible ? 'auto' : 'none' }"
    >
      <button
        v-for="(item, idx) in items"
        :key="item.id"
        class="ruler-label"
        :class="{
          'ruler-label--active': idx === activeIdx,
          'ruler-label--hovered': hoveredIdx === idx,
          'ruler-label--dimmed': hoveredIdx !== null && hoveredIdx !== idx && idx !== activeIdx,
        }"
        :style="{ height: `${100 / items.length}%` }"
        :title="item.label"
        @click="scrollTo(idx)"
        @mouseenter="hoveredIdx = idx"
        @mouseleave="hoveredIdx = null"
      >
        <span class="ruler-label__num">{{ String(idx + 1).padStart(2, '0') }}</span>
        <span class="ruler-label__text">{{ item.label }}</span>
      </button>
    </div>
  </nav>
</template>

<style scoped>
.ruler-toc {
  position: fixed;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 80;
  /* height set dynamically via :style */
  display: flex;
  pointer-events: auto;
}

/* ——— Ruler track (always visible, thin) ——— */
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

.ruler-minor {
  position: absolute;
  right: 0;
  width: 5px;
  height: 1px;
  background: var(--color-dali-muted, #999);
  opacity: 0.1;
}

/* ——— Red dot ——— */
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
  border: 1px solid var(--color-dali-void, #0B0B0F);
}

/* ——— Labels column — neobrutalism: solid bg, hard border, no blur ——— */
.ruler-labels {
  display: flex;
  flex-direction: column;
  width: 220px;
  transition: opacity 0.25s ease;
  padding-left: 6px;
  background: var(--color-dali-cream, #FDF6E3);
  border: 2px solid var(--color-dali-void, #0B0B0F);
  border-left: none;
  box-shadow: var(--shadow-dali-sm, 2px 2px 0px 0px #ED1C24);
  padding-top: 4px;
  padding-bottom: 4px;
}

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

/* Active: red accent border */
.ruler-label--active {
  border-left-color: var(--color-dali-red, #ed1c24);
}

/* Hovered: scales up, white text */
.ruler-label--hovered {
  transform: translateX(4px) scale(1.08);
  border-left-color: var(--color-dali-red, #ed1c24);
}

/* Dimmed: when something else is hovered */
.ruler-label--dimmed {
  opacity: 0.35;
}

/* Number */
.ruler-label__num {
  font-family: var(--font-dali-mono, monospace);
  font-size: 8px;
  min-width: 14px;
  flex-shrink: 0;
  color: var(--color-dali-void, #0B0B0F);
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
  color: var(--color-dali-void, #0B0B0F);
  opacity: 0.6;
  line-height: 1.3;
  transition: color 0.2s ease, font-size 0.2s ease, font-weight 0.2s ease, opacity 0.2s ease;
}

.ruler-label--active .ruler-label__text {
  color: var(--color-dali-red, #ed1c24);
  font-weight: 700;
  opacity: 1;
}

.ruler-label--hovered .ruler-label__text {
  color: var(--color-dali-void, #0B0B0F);
  font-weight: 700;
  font-size: 11px;
  opacity: 1;
}

/* ——— Hide on mobile ——— */
@media (max-width: 1023px) {
  .ruler-toc {
    display: none;
  }
}
</style>
