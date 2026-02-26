import { ref, readonly } from 'vue'
import { refreshColorFlow, waitForColorFlowReady } from '~/composables/useColorFlow'

/**
 * usePageTransition — Gradual color-fade overlay for cross-page navigation.
 *
 * When navigating between the main page and a sub-page, a full-screen
 * overlay fades in carrying a color that morphs between the origin
 * section's palette color and the dark sub-page background. Pages swap
 * while the overlay is fully opaque, eliminating any visual flicker.
 *
 * ### Usage
 * ```ts
 * const { transitionTo } = usePageTransition()
 * // Forward: main → sub-page
 * transitionTo('/tools/jwt', { sectionId: 'tools' })
 * // Back: sub-page → main
 * transitionTo('/#tools', { sectionId: 'tools', isBack: true })
 * ```
 */

// ─── Constants ──────────────────────────────────────────────────────────
/** Section ID → palette color (mirrors DEFAULT_PALETTE in useColorFlow) */
const SECTION_COLORS: Record<string, string> = {
  hero: '#F5E6B8',
  posts: '#D4A85A',
  space: '#4BA89E',
  tools: '#7B5E9A',
  footer: '#4A5A7A',
}

const DARK_COLOR = '#161622'

// ─── Singleton state ────────────────────────────────────────────────────
const overlayEl = ref<HTMLElement | null>(null)
const isTransitioning = ref(false)

/** Wait for N animation frames (lets the DOM truly settle). */
function waitFrames(n: number): Promise<void> {
  return new Promise((resolve) => {
    let count = 0
    function step() {
      if (++count >= n) resolve()
      else requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  })
}

/** Try to get the Lenis instance from the Nuxt plugin */
function getLenis(): any | undefined {
  try {
    return useNuxtApp().$lenis
  } catch {
    return undefined
  }
}

/** Read the current color-flow background (falls back to section color). */
function getCurrentBgColor(): string | null {
  if (!import.meta.client) return null
  const root = document.documentElement
  const val = getComputedStyle(root).getPropertyValue('--color-flow-bg')?.trim()
  if (val) return val
  const bodyVal = getComputedStyle(document.body).backgroundColor?.trim()
  return bodyVal || null
}

/** Scroll to a hash target immediately; waits a few frames for DOM presence. */
async function scrollHashTarget(hashTarget: string): Promise<boolean> {
  if (!import.meta.client || !hashTarget) return false

  // Wait for the element to exist (retry across a few RAFs)
  let targetEl: HTMLElement | null = null
  for (let i = 0; i < 6; i++) {
    targetEl = document.getElementById(hashTarget)
    if (targetEl) break
    await waitFrames(1)
  }
  if (!targetEl) return false

  const lenis = getLenis()
  if (lenis) {
    lenis.scrollTo(targetEl, { immediate: true })
  } else {
    targetEl.scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: 'start' })
  }

  await waitFrames(1)
  return true
}

export function usePageTransition() {
  /**
   * Navigate to a URL with a gradual color-fade overlay transition.
   *
   * @param url    Target route (e.g. `/tools/jwt` or `/#posts`)
   * @param opts.sectionId  The section this transition is associated with
   * @param opts.isBack     True when navigating back to the main page
   */
  async function transitionTo(
    url: string,
    opts: { sectionId?: string; isBack?: boolean } = {},
  ) {
    // Bail out gracefully if we can't run the animation
    if (isTransitioning.value || !import.meta.client) {
      navigateTo(url)
      return
    }

    const el = overlayEl.value
    if (!el) {
      navigateTo(url)
      return
    }

    const { gsap } = await import('gsap')

    isTransitioning.value = true

    const sectionColor = SECTION_COLORS[opts.sectionId || ''] || SECTION_COLORS.hero
    const isBack = opts.isBack ?? false

    // Make sure overlay is visible immediately
    el.style.display = 'block'
    el.style.pointerEvents = 'auto'

    // ── Phase 1: Overlay fades in ───────────────────────────────────
    // Forward (index → sub): fade overlay from transparent while morphing
    //   section color → dark. Page elements gradually disappear.
    // Back (sub → index): solid dark fade-in (matches the current dark page)
    //   → clean curtain that hides the page swap

    if (isBack) {
      // Back: page is already dark, so body can go dark immediately
      if (import.meta.client) {
        document.body.style.backgroundColor = DARK_COLOR
      }
      gsap.set(el, { opacity: 0, backgroundColor: DARK_COLOR })
      await new Promise<void>((resolve) => {
        gsap.to(el, {
          opacity: 1,
          duration: 0.35,
          ease: 'power2.inOut',
          onComplete: resolve,
        })
      })
    } else {
      // Forward: fade the overlay in from transparent while simultaneously
      // morphing its color from the current section background to dark.
      // This makes page elements "disappear" gradually (matching the back
      // transition feel) instead of snapping an opaque color block on top.
      //
      // IMPORTANT: Do NOT set body background to dark here — the overlay
      // starts at opacity 0, so the body color change would be visible
      // through the transparent overlay (causing a flash on the first visit
      // when the body is still its light color-flow color).
      const startColor = getCurrentBgColor() || sectionColor
      gsap.set(el, { opacity: 0, backgroundColor: startColor })
      await new Promise<void>((resolve) => {
        gsap.to(el, {
          opacity: 1,
          backgroundColor: DARK_COLOR,
          duration: 0.55,
          ease: 'power2.inOut',
          onComplete: resolve,
        })
      })
      // Now that the overlay is fully opaque, safely set the body dark
      // so there's no parchment flash during navigation behind the overlay.
      if (import.meta.client) {
        document.body.style.backgroundColor = DARK_COLOR
      }
    }

    // Give the overlay one frame to paint before navigation
    await waitFrames(1)

    // ── Phase 2: Navigate while overlay is fully opaque ─────────────
    await navigateTo(url)
    await nextTick()
    await nextTick()

    // Wait a few frames for the new page DOM to settle
    // (GSAP ScrollTrigger, async data, Lenis recalculation)
    await waitFrames(3)

    // ── Phase 2.5: Scroll restoration for back-to-section nav ───────
    // If navigating back to a URL with a hash (e.g. /#posts), explicitly
    // scroll while the overlay is still opaque so the user never sees the
    // wrong position.
    const hashTarget = url.includes('#') ? url.split('#')[1] : null

    if (hashTarget) {
      await scrollHashTarget(hashTarget)
    }

    // ── Phase 2.75: Ensure color flow is initialized ────────────────
    // For back navigation to the index page, the DaliCanvas color flow
    // needs to compute the correct background color before we reveal
    // the page. This prevents the CSS fallback (yellow parchment) from
    // flashing through.
    if (isBack) {
      // Give color flow time to initialize (it runs in DaliCanvas onMounted)
      await waitForColorFlowReady(1500)
      // Force a fresh rebuild so it picks up the current scroll position
      try { await refreshColorFlow() } catch { /* color flow may not be active on this page */ }
      await waitFrames(2) // let the DOM update with new colors
    }

    // ── Phase 2.8: Refresh GSAP ScrollTrigger + re-scroll ───────────
    // After color flow rebuilds, GSAP ScrollTrigger positions may be stale
    // (sections further down the page like #tools/#space can have wrong
    // trigger bounds). Refresh all triggers so in-view sections correctly
    // animate to their visible state, then re-scroll to the target to
    // ensure pixel-perfect position after layout recalculations.
    if (hashTarget) {
      try {
        const { ScrollTrigger } = await import('gsap/ScrollTrigger')
        ScrollTrigger.refresh()
      } catch { /* ScrollTrigger may not be loaded */ }
      await waitFrames(2)

      await scrollHashTarget(hashTarget)
    }

    // ── Phase 3: Overlay fades out to reveal the new page ───────────
    await new Promise<void>((resolve) => {
      gsap.to(el, {
        opacity: 0,
        duration: isBack ? 0.5 : 0.4,
        ease: 'power2.inOut',
        onComplete: resolve,
      })
    })

    // ── Cleanup ─────────────────────────────────────────────────────
    el.style.display = 'none'
    el.style.pointerEvents = 'none'
    isTransitioning.value = false
  }

  return {
    /** Bind this to the overlay <div> in app.vue */
    overlayEl,
    /** Whether a transition is currently in progress */
    isTransitioning: readonly(isTransitioning),
    /** Navigate with a color-fade transition */
    transitionTo,
    /** Shared helper for hash-based immediate scrolling */
    scrollHashTarget,
  }
}
