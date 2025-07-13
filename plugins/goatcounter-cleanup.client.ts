export default defineNuxtPlugin((nuxtApp) => {
  // Clear GoatCounter cache on route changes
  nuxtApp.$router.beforeEach((to, from) => {
    // Only clear when actually changing paths (not query params or hash)
    if (from && to.path !== from.path) {
      try {
        const { clearRequestCache } = useGoatCounter()
        clearRequestCache()
      } catch (error) {
        // Silently handle any errors
      }
    }
  })
})