import Lenis from 'lenis'

export default defineNuxtPlugin((nuxtApp) => {
  const lenis = new Lenis({
    autoRaf: true,
  })

  // Reset Lenis scroll on cross-page navigation.
  // Without this, Lenis retains the previous page's scroll position
  // because it intercepts native scrollTo calls that Vue Router makes.
  nuxtApp.$router.afterEach((to, from) => {
    // Skip same-page navigation — useScrollSections handles hash changes
    if (to.path === from.path) return
    // Skip if navigating to a hash — useScrollSections._resolveHashOnLoad
    // handles both the Lenis reset and the scroll-to-section at mount time
    if (to.hash) return
    // Skip if Lenis is stopped (usePageTransition stops it during
    // programmatic transitions to prevent scroll-to-top from flashing
    // through the overlay on the first navigation).
    if (lenis.isStopped) return
    // Cross-page, no hash: reset to top
    lenis.scrollTo(0, { immediate: true })
  })

  return {
    provide: {
      lenis,
    },
  }
})
