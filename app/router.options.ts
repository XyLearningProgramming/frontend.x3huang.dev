import type { RouterConfig } from '@nuxt/schema'

/**
 * Disable Vue Router's built-in scroll behavior.
 *
 * We handle ALL scroll management ourselves via:
 *   - Lenis (smooth scrolling plugin)
 *   - useScrollSections (hash → section scroll + IntersectionObserver)
 *   - usePageTransition (Phase 2.5 scroll restoration during transitions)
 *
 * Without this override, Vue Router's default scroll behavior races with
 * Lenis when navigating to hash routes (e.g. `/#tools`, `/#space`),
 * resulting in wrong final scroll positions — especially for sections
 * further down the page.
 */
export default <RouterConfig>{
    scrollBehavior() {
        // Return false/undefined — we handle scrolling ourselves
        return false
    },
}
