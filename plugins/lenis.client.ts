import Lenis from 'lenis'

export default defineNuxtPlugin((nuxtApp) => {
  const lenis = new Lenis({
    autoRaf: true,
  })

  // Reset Lenis scroll on cross-page navigation.
  // Without this, Lenis retains the previous page's scroll position
  // because it intercepts native scrollTo calls that Vue Router makes.
  nuxtApp.$router.afterEach((to, from) => {
    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/13458263-39fc-48cf-b5d3-d5ee70770898',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lenis.client.ts:afterEach',message:'Lenis afterEach fired',data:{toPath:to.path,fromPath:from.path,toHash:to.hash,isStopped:lenis.isStopped,scrollY:window.scrollY},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
    // #endregion
    // Skip same-page navigation — useScrollSections handles hash changes
    if (to.path === from.path) return
    // Skip if navigating to a hash — useScrollSections._resolveHashOnLoad
    // handles both the Lenis reset and the scroll-to-section at mount time
    if (to.hash) return
    // Skip if Lenis is stopped (usePageTransition stops it during
    // programmatic transitions to prevent scroll-to-top from flashing
    // through the overlay on the first navigation).
    if (lenis.isStopped) return
    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/13458263-39fc-48cf-b5d3-d5ee70770898',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lenis.client.ts:afterEach-scrollTo0',message:'Lenis afterEach EXECUTING scrollTo(0)',data:{toPath:to.path,scrollY:window.scrollY},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
    // #endregion
    // Cross-page, no hash: reset to top
    lenis.scrollTo(0, { immediate: true })
  })

  return {
    provide: {
      lenis,
    },
  }
})
