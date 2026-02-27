import { ref, readonly, watch, onMounted, onUnmounted } from 'vue'

/**
 * useColorFlow — scroll-driven background color interpolation.
 *
 * Defines a palette of color stops tied to page sections. As the user scrolls,
 * the background color smoothly interpolates between adjacent stops using
 * GSAP ScrollTrigger in scrub mode (automatically reversible).
 *
 * ### Configuration
 * The palette is defined once in `DEFAULT_PALETTE` and the CSS tokens live in
 * `assets/css/main.css` under `--color-flow-*`.
 *
 * ### How it works
 * 1. Each section gets a "zone" between its start and the next section's start.
 * 2. A single ScrollTrigger with `scrub: true` drives a proxy object whose
 *    `progress` value (0 → 1 over the full page) feeds into a color interpolation.
 * 3. The interpolated color is written to `currentColor` (reactive) and also
 *    set as `--color-flow-bg` on a target element for CSS consumption.
 * 4. A contrasting text color `--color-flow-text` is also computed for readability.
 */

export interface ColorStop {
  /** CSS selector or element ID (without #) for the section */
  sectionId: string
  /** Hex color for this stop */
  color: string
}

/** Default palette — warm parchment → twilight slate.
 *  Chat is NOT in the palette — it sits above hero with its own opaque
 *  background (#FEFBF2) and a blend gradient bridges the two colors. */
const DEFAULT_PALETTE: ColorStop[] = [
  { sectionId: 'hero', color: '#F5E6B8' },    // warm parchment yellow
  { sectionId: 'posts', color: '#D4A85A' },    // soft amber gold
  { sectionId: 'space', color: '#4BA89E' },    // brighter teal (cards pop better)
  { sectionId: 'tools', color: '#7B5E9A' },    // lighter plum (readable)
  { sectionId: 'footer', color: '#4A5A7A' },   // twilight slate (card borders visible)
]

// ─── Shared singleton state ───────────────────────────────────────────
const currentColor = ref(DEFAULT_PALETTE[0].color)
const currentTextColor = ref('#1A1A2E')
const currentMutedColor = ref('#6B6B7B')
const progress = ref(0)

let _initialized = false
let _ready = false // true after trigger is created + initial color is computed
let _triggers: any[] = []
let _gsap: any = null
let _ScrollTrigger: any = null
let _targetEl: HTMLElement | null = null
let _activePalette: ColorStop[] = DEFAULT_PALETTE

/**
 * Read-only access to the shared color flow state.
 * Use this in components that don't own the scroll
 * to inherit the last-known color from the main page.
 */
export function useColorFlowState() {
  /**
   * Lock the color flow to a specific palette section.
   * Useful for sub-pages that should feel like a continuation of a section
   * (e.g. the posts listing panel should match the "posts" section color).
   */
  function setSection(sectionId: string) {
    const stop = DEFAULT_PALETTE.find(s => s.sectionId === sectionId)
    if (!stop) return
    currentColor.value = stop.color
    currentTextColor.value = contrastText(stop.color)
    currentMutedColor.value = contrastMuted(stop.color)
  }

  return {
    currentColor: readonly(currentColor),
    currentTextColor: readonly(currentTextColor),
    currentMutedColor: readonly(currentMutedColor),
    progress: readonly(progress),
    /** Lock color flow to a specific palette section by sectionId */
    setSection,
    /** Utility: compute contrasting text for an arbitrary hex bg */
    contrastTextFor: contrastText,
    /** Utility: compute muted text for an arbitrary hex bg */
    contrastMutedFor: contrastMuted,
    /** Utility: interpolate between two hex colors */
    lerp: lerpColor,
  }
}

/**
 * Hex → RGB tuple
 */
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ]
}

/**
 * RGB tuple → hex string
 */
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/**
 * Relative luminance (WCAG formula).
 */
function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map(c => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * Compute a readable text color for a given background.
 * Returns a light or dark color with smooth interpolation in the mid-range.
 */
function contrastText(bgHex: string): string {
  const lum = luminance(bgHex)
  // Light bg → dark text, dark bg → light text
  // Smooth transition: lum < 0.2 → light, lum > 0.4 → dark, blend in between
  const darkText = '#1A1A2E'  // dali-smoke
  const lightText = '#F0EDE5' // dali-white
  if (lum > 0.4) return darkText
  if (lum < 0.15) return lightText
  // Blend
  const t = (lum - 0.15) / 0.25 // 0 = light text, 1 = dark text
  return lerpColor(lightText, darkText, t)
}

/**
 * Compute a muted/secondary text color for a given background.
 */
function contrastMuted(bgHex: string): string {
  const lum = luminance(bgHex)
  const darkMuted = '#6B6B7B'  // dali-muted
  const lightMuted = '#B0A99A' // lighter muted for dark backgrounds
  if (lum > 0.4) return darkMuted
  if (lum < 0.15) return lightMuted
  const t = (lum - 0.15) / 0.25
  return lerpColor(lightMuted, darkMuted, t)
}

/**
 * Linearly interpolate between two hex colors by t ∈ [0, 1].
 */
function lerpColor(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a)
  const [r2, g2, b2] = hexToRgb(b)
  return rgbToHex(
    r1 + (r2 - r1) * t,
    g1 + (g2 - g1) * t,
    b1 + (b2 - b1) * t,
  )
}

/**
 * Given a global progress value (0 → 1) and N color stops,
 * return the interpolated color.
 */
function interpolatePalette(stops: ColorStop[], t: number): string {
  const clamped = Math.max(0, Math.min(1, t))
  const segments = stops.length - 1
  if (segments <= 0) return stops[0]?.color ?? '#000000'

  const scaled = clamped * segments
  const idx = Math.min(Math.floor(scaled), segments - 1)
  const local = scaled - idx

  return lerpColor(stops[idx].color, stops[idx + 1].color, local)
}

/**
 * Apply all color flow CSS custom properties to the target element.
 */
function applyColors(el: HTMLElement, bg: string, text: string, muted: string) {
  el.style.setProperty('--color-flow-bg', bg)
  el.style.setProperty('--color-flow-text', text)
  el.style.setProperty('--color-flow-muted', muted)
  el.style.backgroundColor = bg
}

// ─── Module-level init / destroy ─────────────────────────────────────

async function _ensureGsap() {
  if (_gsap && _ScrollTrigger) return
  const gsapModule = await import('gsap')
  const stModule = await import('gsap/ScrollTrigger')
  _gsap = gsapModule.gsap
  _ScrollTrigger = stModule.ScrollTrigger
  _gsap.registerPlugin(_ScrollTrigger)
}

async function _init() {
  if (_initialized || !import.meta.client) return
  _initialized = true

  await _ensureGsap()

  // Build section positions — missing DOM elements are automatically filtered out
  const sections = _activePalette
    .map(stop => ({
      ...stop,
      el: document.getElementById(stop.sectionId),
    }))
    .filter(s => s.el)

  if (sections.length < 2) {
    _ready = true
    return
  }

  // We create one master ScrollTrigger that spans the entire scrollable area.
  // Its progress (0→1) drives the color interpolation.
  // Only the sections currently in the DOM participate.
  const activePalette = sections.map(s => ({ sectionId: s.sectionId, color: s.color }))
  const firstEl = sections[0].el!
  const lastEl = sections[sections.length - 1].el!

  const trigger = _ScrollTrigger.create({
    trigger: firstEl,
    start: 'top top',
    endTrigger: lastEl,
    end: 'bottom bottom',
    scrub: 0.3, // smooth scrub
    onUpdate: (self: any) => {
      progress.value = self.progress
      const bg = interpolatePalette(activePalette, self.progress)
      const text = contrastText(bg)
      const muted = contrastMuted(bg)

      currentColor.value = bg
      currentTextColor.value = text
      currentMutedColor.value = muted

      // Apply to DOM
      if (_targetEl) {
        applyColors(_targetEl, bg, text, muted)
      }
    },
  })

  _triggers.push(trigger)

  // ── Compute initial color from current scroll position ──────────────
  // Instead of always defaulting to palette[0] (parchment yellow), calculate
  // the correct color for the current scroll position. This prevents a flash
  // of wrong color when SPA-navigating back to the page at a non-zero scroll.
  //
  // ScrollTrigger config: start = firstEl "top top", end = lastEl "bottom bottom"
  // Progress 0 = firstEl.top is at viewport top
  // Progress 1 = lastEl.bottom is at viewport bottom
  const scrollY = window.scrollY
  const triggerStart = firstEl.getBoundingClientRect().top + scrollY
  const triggerEnd = lastEl.getBoundingClientRect().bottom + scrollY
  const range = (triggerEnd - window.innerHeight) - triggerStart

  let initialProgress = 0
  if (range > 0) {
    initialProgress = Math.max(0, Math.min(1, (scrollY - triggerStart) / range))
  }

  progress.value = initialProgress
  const initialBg = interpolatePalette(activePalette, initialProgress)
  const initialText = contrastText(initialBg)
  const initialMuted = contrastMuted(initialBg)
  currentColor.value = initialBg
  currentTextColor.value = initialText
  currentMutedColor.value = initialMuted

  if (_targetEl) {
    applyColors(_targetEl, initialBg, initialText, initialMuted)
  }

  _ready = true
}

function _destroy() {
  _triggers.forEach(t => t.kill())
  _triggers = []
  _initialized = false
  _ready = false
}

/**
 * Rebuild color-flow triggers from scratch.
 * Call this when the DOM structure changes (e.g. chat section appearing/disappearing)
 * so the color-flow picks up new or removed sections.
 */
export async function refreshColorFlow() {
  _destroy()
  await _init()
}

/**
 * Whether color flow is fully initialized with the correct color.
 */
export function isColorFlowReady(): boolean {
  return _ready
}

/**
 * Wait until color flow is fully initialized.
 * Used by page transition logic to keep the overlay opaque until
 * the page behind it has the correct background color.
 */
export async function waitForColorFlowReady(timeoutMs = 2000): Promise<void> {
  if (_ready) return
  const start = Date.now()
  while (!_ready && Date.now() - start < timeoutMs) {
    await new Promise(resolve => requestAnimationFrame(resolve))
  }
}

export const useColorFlow = (palette: ColorStop[] = DEFAULT_PALETTE) => {
  _activePalette = palette

  /** The element that receives `--color-flow-bg` */
  const targetRef = ref<HTMLElement | null>(null)

  // Keep module-level target in sync with the ref.
  // When the target element appears AFTER color flow has already initialized
  // (e.g. SPA navigation back to index), immediately apply the current colors
  // to the DOM element so it doesn't flash the CSS fallback color.
  watch(targetRef, (el) => {
    _targetEl = el
    if (_ready && el) {
      applyColors(el, currentColor.value, currentTextColor.value, currentMutedColor.value)
    }
  })

  onMounted(() => {
    _targetEl = targetRef.value
    // Small delay to ensure DOM sections are rendered
    requestAnimationFrame(() => {
      _init()
    })
  })

  onUnmounted(() => {
    _destroy()
  })

  return {
    /** Ref to bind to the container element that should receive the background color */
    targetRef,
    /** Current interpolated hex color (reactive) */
    currentColor: readonly(currentColor),
    /** Current contrasting text color (reactive) */
    currentTextColor: readonly(currentTextColor),
    /** Current muted text color (reactive) */
    currentMutedColor: readonly(currentMutedColor),
    /** Scroll progress 0→1 across the full page (reactive) */
    progress: readonly(progress),
    /** The palette being used */
    palette,
    /** Re-initialize (e.g. after dynamic content changes) */
    refresh: refreshColorFlow,
  }
}
