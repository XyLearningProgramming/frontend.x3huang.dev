<template>
  <main id="main" class="min-h-screen font-[family-name:var(--font-neo-body)]">
    <NuxtPage />

    <!-- Page transition overlay — animated by usePageTransition -->
    <div ref="transitionOverlayRef" class="page-transition-overlay" />
  </main>
</template>

<script setup lang="ts">
import { usePageTransition } from '~/composables/usePageTransition'
import { waitForColorFlowReady } from '~/composables/useColorFlow'

const { overlayEl, isTransitioning, scrollHashTarget } = usePageTransition()
const transitionOverlayRef = ref(null)
onMounted(() => { overlayEl.value = transitionOverlayRef.value })

// ── Browser back/forward overlay transition ─────────────────────────
// When navigating via browser buttons (popstate), `transitionTo()` doesn't
// fire — the router navigates directly. Without an overlay the user sees
// a flash of the CSS fallback color (#F5E6B8 yellow) before color-flow
// initializes. This guard shows a dark overlay for ALL cross-page
// navigations not already handled by `transitionTo()`, then fades it
// out once the new page and its color-flow are ready.
if (import.meta.client) {
  const router = useRouter()
  let _browserOverlayActive = false

  router.beforeEach((to, from) => {
    // Always keep body dark during transitions
    document.body.style.backgroundColor = '#161622'

    // Only intercept actual page changes (not hash-only)
    if (to.path === from.path) return

    // Skip if a programmatic transition (transitionTo) is already handling it
    if (isTransitioning.value) return

    // Immediately show a dark overlay — no animation, just display it
    const el = overlayEl.value
    if (el) {
      el.style.display = 'block'
      el.style.pointerEvents = 'auto'
      el.style.opacity = '1'
      el.style.backgroundColor = '#161622'
      _browserOverlayActive = true
    }
  })

  router.afterEach(async (to) => {
    if (!_browserOverlayActive) return
    _browserOverlayActive = false

    // Wait for the new page to mount
    await nextTick()
    await nextTick()

    // Only wait for color flow on the index page (which has the DaliCanvas
    // with scroll-driven color). Sub-pages use a static dark background,
    // so they're ready immediately.
    const isIndexPage = to.path === '/' || to.path === ''
    const hashTarget = isIndexPage && to.hash ? to.hash.slice(1) : null

    // Scroll to hash while overlay is opaque (prevents visible jump)
    if (hashTarget) {
      await scrollHashTarget(hashTarget)
    }

    if (isIndexPage) await waitForColorFlowReady(1500)

    // A few extra frames for the DOM to settle
    await new Promise<void>((resolve) => {
      let count = 0
      function step() {
        if (++count >= (isIndexPage ? 5 : 3)) resolve()
        else requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    })

    // For index page with hash: refresh ScrollTrigger + re-scroll so sections
    // further down the page (#tools, #space) land correctly.
    if (hashTarget) {
      try {
        const { ScrollTrigger } = await import('gsap/ScrollTrigger')
        ScrollTrigger.refresh()
      } catch { /* ScrollTrigger may not be loaded */ }

      await scrollHashTarget(hashTarget)

      // Final verification — if the element drifted after ScrollTrigger
      // refresh, force the native scroll to match.
      const verifyEl = document.getElementById(hashTarget)
      if (verifyEl) {
        const rect = verifyEl.getBoundingClientRect()
        if (Math.abs(rect.top) > 2) {
          window.scrollTo({
            top: rect.top + window.scrollY,
            behavior: 'instant' as ScrollBehavior,
          })
          await new Promise(r => requestAnimationFrame(r))
        }
      }
    }

    // Fade out the overlay to reveal the new page
    const el = overlayEl.value
    if (el) {
      try {
        const { gsap } = await import('gsap')
        await new Promise<void>((resolve) => {
          gsap.to(el, {
            opacity: 0,
            duration: 0.4,
            ease: 'power2.inOut',
            onComplete: resolve,
          })
        })
      } catch {
        // Fallback: just hide immediately
        el.style.opacity = '0'
      }
      el.style.display = 'none'
      el.style.pointerEvents = 'none'
    }

    // Sync Lenis to the current native scroll position so it doesn't
    // animate from a stale offset when it resumes.
    try {
      const lenis = useNuxtApp().$lenis as any
      if (lenis) lenis.scrollTo(window.scrollY, { immediate: true })
    } catch { /* lenis may not be available */ }
  })
}
</script>
