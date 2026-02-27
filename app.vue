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
  // #region agent log
  // Scroll jump detector — fires when scrollY changes by > 200px in one frame
  let _lastScrollY = window.scrollY
  let _scrollMonitorActive = false
  function _startScrollMonitor() {
    if (_scrollMonitorActive) return
    _scrollMonitorActive = true
    let _monitorRafId = 0
    function _monitorFrame() {
      const currentY = window.scrollY
      if (Math.abs(currentY - _lastScrollY) > 200) {
        fetch('http://127.0.0.1:7245/ingest/13458263-39fc-48cf-b5d3-d5ee70770898',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.vue:scroll-jump-detector',message:'SCROLL JUMP detected',data:{from:_lastScrollY,to:currentY,delta:currentY-_lastScrollY},timestamp:Date.now(),hypothesisId:'ALL'})}).catch(()=>{});
      }
      _lastScrollY = currentY
      _monitorRafId = requestAnimationFrame(_monitorFrame)
    }
    _monitorRafId = requestAnimationFrame(_monitorFrame)
    // Stop after 10 seconds
    setTimeout(() => { cancelAnimationFrame(_monitorRafId); _scrollMonitorActive = false }, 10000)
  }
  _startScrollMonitor()
  // Log browser scroll restoration setting
  fetch('http://127.0.0.1:7245/ingest/13458263-39fc-48cf-b5d3-d5ee70770898',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.vue:init',message:'Browser scroll restoration setting',data:{scrollRestoration:history.scrollRestoration,scrollY:window.scrollY},timestamp:Date.now(),hypothesisId:'H4'})}).catch(()=>{});
  // #endregion

  const router = useRouter()

  // Clean up any previously registered guards (prevents HMR from
  // accumulating duplicate beforeEach/afterEach handlers whose stale
  // module refs cause them to bypass the isTransitioning check and
  // prematurely fade out the overlay).
  const _w = window as any
  if (_w.__cleanupTransitionGuards) {
    _w.__cleanupTransitionGuards()
  }

  let _browserOverlayActive = false

  const _removeBefore = router.beforeEach((to, from) => {
    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/13458263-39fc-48cf-b5d3-d5ee70770898',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.vue:beforeEach',message:'router beforeEach fired',data:{toPath:to.path,fromPath:from.path,toHash:to.hash,scrollY:window.scrollY,isTransitioning:isTransitioning.value},timestamp:Date.now(),hypothesisId:'H2,H4'})}).catch(()=>{});
    // #endregion
    // #region agent log
    _startScrollMonitor() // restart monitor on navigation
    // #endregion
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

  const _removeAfter = router.afterEach(async (to) => {
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

  // Store cleanup so next HMR cycle can remove these guards
  _w.__cleanupTransitionGuards = () => {
    _removeBefore()
    _removeAfter()
  }
}
</script>
