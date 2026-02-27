import { ref, readonly, type Ref } from 'vue'
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
// Persist refs on window so they survive HMR module re-evaluation.
// Without this, HMR creates new refs and stale router guards (from the
// previous module instance) check the old ref — missing the transition
// flag and prematurely fading out the overlay.
const _g = (typeof window !== 'undefined' ? window : globalThis) as any
const overlayEl: Ref<HTMLElement | null> = _g.__pt_overlayEl ?? (_g.__pt_overlayEl = ref<HTMLElement | null>(null))
const isTransitioning: Ref<boolean> = _g.__pt_isTransitioning ?? (_g.__pt_isTransitioning = ref(false))

/** Check whether a page transition is currently in progress (usable outside the composable). */
export function isPageTransitioning(): boolean {
  return isTransitioning.value
}

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

  // Native scroll first — works synchronously regardless of Lenis state.
  // Lenis rapid start/stop cycles during transitions can silently miss
  // the scrollTo for sections far down the page (e.g. #tools).
  const targetTop = targetEl.getBoundingClientRect().top + window.scrollY
  window.scrollTo({ top: targetTop, behavior: 'instant' as ScrollBehavior })

  // Sync Lenis internal state so it doesn't fight the native position
  // when it's restarted after the transition completes.
  const lenis = getLenis()
  if (lenis) {
    const wasStopped = lenis.isStopped
    if (wasStopped) lenis.start()
    lenis.scrollTo(targetTop, { immediate: true })
    await waitFrames(1) // let Lenis process the scroll before stopping
    if (wasStopped) lenis.stop()
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

    // Read the current background color BEFORE showing the overlay.
    // getComputedStyle() forces a synchronous layout flush; doing it while
    // the overlay is visibility:hidden avoids flashing the overlay at its
    // CSS default state during that flush.
    const startColor = !isBack
      ? (getCurrentBgColor() || sectionColor)
      : DARK_COLOR

    // Freeze Lenis during the transition so it can't scroll-to-top
    // (its afterEach hook does lenis.scrollTo(0) on cross-page nav).
    const lenis = getLenis()
    if (lenis) lenis.stop()

    // Ensure the overlay is invisible BEFORE making it visible in layout.
    // Setting opacity: 0 inline first prevents any single-frame flash.
    el.style.opacity = '0'
    el.style.visibility = 'visible'
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
      // We resolve the promise EARLY — when the tween is ~85% done (overlay
      // nearly opaque) — so navigation starts concurrently with the tail of
      // the animation. This eliminates the dead gap between "animation done"
      // and "navigateTo" where the browser could de-composite the layer and
      // flash the underlying content.
      gsap.set(el, { opacity: 0, backgroundColor: startColor })
      let phase1Tween: ReturnType<typeof gsap.to> | null = null
      await new Promise<void>((resolve) => {
        let resolved = false
        phase1Tween = gsap.to(el, {
          opacity: 1,
          backgroundColor: DARK_COLOR,
          duration: 0.55,
          ease: 'power2.inOut',
          onUpdate() {
            // At 85% progress with power2.inOut easing the rendered
            // opacity is ~0.96 — content is essentially invisible.
            if (!resolved && phase1Tween!.progress() >= 0.85) {
              resolved = true
              resolve()
            }
          },
          onComplete() {
            if (!resolved) { resolved = true; resolve() }
          },
        })
      })
      // Overlay is nearly/fully opaque now — set the body dark.
      if (import.meta.client) {
        document.body.style.backgroundColor = DARK_COLOR
      }

      // Kill the Phase 1 tween so it can't overwrite our forced opacity=1
      // on subsequent frames, then snap the overlay to fully opaque + dark.
      // This prevents the ~0.5% transparency that lets the browser's
      // scroll-position clamping (tall index → short sub-page) flash through.
      if (phase1Tween) {
        (phase1Tween as any).kill()
      }
      gsap.set(el, { opacity: 1, backgroundColor: DARK_COLOR })
    }

    // Back: wait for the overlay to be fully painted before navigating.
    // Forward: we already resolved early, so just one extra frame for safety.
    await waitFrames(isBack ? 2 : 1)

    // For forward navigation, pre-scroll to 0 while overlay is opaque.
    // Without this, the browser clamps scroll when the tall index DOM is
    // swapped for the shorter sub-page, causing a 1-frame compositor
    // glitch visible even through a fully opaque overlay.
    if (!isBack) {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
      const l = getLenis()
      if (l) {
        const wasStopped = l.isStopped
        if (wasStopped) l.start()
        l.scrollTo(0, { immediate: true })
        if (wasStopped) l.stop()
      }
    }

    // ── Phase 2: Navigate while overlay is fully opaque ─────────────
    await navigateTo(url)
    await nextTick()
    await nextTick()

    // Wait a few frames for the new page DOM to settle
    // (GSAP ScrollTrigger, async data, Lenis recalculation)
    await waitFrames(3)

    // ── Phase 2.5: Scroll positioning while overlay is opaque ─────────
    // Lenis is frozen during the transition (to prevent its afterEach from
    // scrolling to 0 and causing a flash). We must do the scroll ourselves.
    const hashTarget = url.includes('#') ? url.split('#')[1] : null

    if (hashTarget) {
      // Back-to-section: scroll to the target section
      await scrollHashTarget(hashTarget)
    } else if (!isBack) {
      // Forward to sub-page: scroll to top (replaces the Lenis afterEach
      // scroll-to-0 that we skipped by freezing Lenis).
      const l = getLenis()
      if (l) {
        const wasStopped = l.isStopped
        if (wasStopped) l.start()
        l.scrollTo(0, { immediate: true })
        if (wasStopped) l.stop()
      } else {
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
      }
      await waitFrames(1)
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

    // ── Phase 2.9: Final scroll verification ─────────────────────────
    // Belt-and-suspenders check right before the overlay fades: if the
    // target element drifted (layout shift from ScrollTrigger refresh,
    // color-flow rebuild, etc.), force the native scroll to match.
    if (hashTarget) {
      const verifyEl = document.getElementById(hashTarget)
      if (verifyEl) {
        const rect = verifyEl.getBoundingClientRect()
        if (Math.abs(rect.top) > 2) {
          window.scrollTo({
            top: rect.top + window.scrollY,
            behavior: 'instant' as ScrollBehavior,
          })
          await waitFrames(1)
        }
      }
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
    el.style.visibility = 'hidden'
    el.style.pointerEvents = 'none'
    isTransitioning.value = false

    // Restart Lenis — sync it to the current native scroll position first
    // so it doesn't animate from a stale internal offset to the actual one.
    const lenisAfter = getLenis()
    if (lenisAfter) {
      lenisAfter.start()
      lenisAfter.scrollTo(window.scrollY, { immediate: true })
    }
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
