import { ref, readonly } from 'vue'
import { isPageTransitioning } from '~/composables/usePageTransition'

/**
 * useScrollSections — Reusable scroll-section manager with hash routing.
 *
 * Tracks which `<section id>` elements are in the DOM, determines the
 * currently active section via IntersectionObserver, syncs `window.location.hash`
 * bidirectionally, and provides `scrollTo(id)` powered by Lenis.
 *
 * ### Section tags
 * Only four tags: `chat` (conditional), `posts`, `space`, `tools`.
 * The top of the page (hero) has NO tag — it's represented by an empty hash `/`.
 * Footer is excluded from hash sync.
 *
 * ### Coexistence with useFocusPanel
 * Focus-panel hashes (`#about`, `#post/...`, `#contact`, `#gallery`, `#tool/...`)
 * are handled by useFocusPanel. This composable ignores them entirely.
 */

// ─── Constants ─────────────────────────────────────────────────────────
/** Ordered list of section IDs that participate in hash routing */
const SECTION_IDS = ['chat', 'posts', 'space', 'tools'] as const
export type SectionId = (typeof SECTION_IDS)[number]

/** Hashes that belong to useFocusPanel — we never touch these */
const FOCUS_PANEL_PREFIXES = ['about', 'contact', 'gallery', 'post/', 'tool/']

function isFocusPanelHash(hash: string): boolean {
  return FOCUS_PANEL_PREFIXES.some(p => hash === p || hash.startsWith(p))
}

// ─── Shared singleton state ────────────────────────────────────────────
const activeSection = ref<SectionId | null>(null)
let _initialized = false
let _observer: IntersectionObserver | null = null
let _hashSyncEnabled = true // suppress hash updates during programmatic scroll

/** Get the Lenis smooth-scroll instance from the Nuxt plugin */
function getLenis(): any | undefined {
  try {
    return useNuxtApp().$lenis
  } catch {
    return undefined
  }
}

export function useScrollSections() {
  // ─── Section presence ──────────────────────────────────────────────
  /**
   * Check which section IDs are currently in the DOM.
   */
  function getSectionsInDom(): SectionId[] {
    if (!import.meta.client) return []
    return SECTION_IDS.filter(id => !!document.getElementById(id)) as SectionId[]
  }

  // ─── scrollTo ──────────────────────────────────────────────────────
  /**
   * Scroll to a section by ID. Uses Lenis `scrollTo()` for smooth scrolling.
   *
   * - `scrollTo()` or `scrollTo('main')` → scrolls to the hero section, clears hash.
   *   When a chat section sits above the hero, this ensures "Home" always
   *   lands on the hero rather than the chat.
   * - `scrollTo('chat')` when chat section doesn't exist → falls back to hero
   * - `scrollTo('posts')` etc. → scrolls to that section, sets hash
   */
  function scrollTo(
    id?: SectionId | 'main',
    options?: { duration?: number; offset?: number; immediate?: boolean; onComplete?: () => void },
  ) {
    if (!import.meta.client) return

    // Resolve target
    const targetId = (!id || id === 'main') ? null : id
    let target: HTMLElement | null = null

    if (targetId) {
      target = document.getElementById(targetId)
      // Fallback: if section doesn't exist (e.g. chat with no messages), go to hero
      if (!target) {
        target = null
      }
    }

    // "main" / no-id → target the #hero element so we always land on the hero,
    // even when a chat section is rendered above it (at scroll position 0).
    if (!target && !targetId) {
      target = document.getElementById('hero') ?? null
    }

    // Suppress hash sync during programmatic scroll — we'll set hash ourselves
    _hashSyncEnabled = false

    const lenis = getLenis()
    const duration = options?.duration ?? 1.2
    const offset = options?.offset ?? 0

    const onComplete = () => {
      // Set the hash after scroll completes
      if (targetId && document.getElementById(targetId)) {
        _setHash(targetId)
      } else {
        _clearHash()
      }
      // Re-enable hash sync after a small delay (avoid the scroll observer
      // immediately overwriting our hash from the programmatic scroll)
      setTimeout(() => { _hashSyncEnabled = true }, 100)
      options?.onComplete?.()
    }

    if (lenis) {
      if (target) {
        lenis.scrollTo(target, { duration, offset, onComplete })
      } else {
        lenis.scrollTo(0, { duration, onComplete })
      }
    } else {
      // Fallback if Lenis isn't available
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
      // Approximate the onComplete timing
      setTimeout(onComplete, duration * 1000)
    }
  }

  // ─── Hash management ───────────────────────────────────────────────
  function _setHash(id: string) {
    if (!import.meta.client) return
    const current = window.location.hash.slice(1)
    if (current === id) return
    // Preserve existing query params (e.g. ?posts=6) when updating the hash
    window.history.replaceState(null, '', window.location.pathname + window.location.search + `#${id}`)
  }

  function _clearHash() {
    if (!import.meta.client) return
    if (!window.location.hash) return
    window.history.replaceState(null, '', window.location.pathname + window.location.search)
  }

  // ─── IntersectionObserver for active section tracking ──────────────
  function _setupObserver() {
    if (!import.meta.client) return
    _teardownObserver()

    _observer = new IntersectionObserver(
      (entries) => {
        if (!_hashSyncEnabled) return
        _updateActiveSectionFromScroll()
      },
      {
        rootMargin: '0px 0px -30% 0px',
        threshold: 0,
      },
    )

    // Observe all section elements (including the hero as a "null" divider)
    for (const id of [...SECTION_IDS, 'hero']) {
      const el = document.getElementById(id)
      if (el) _observer.observe(el)
    }
  }

  /**
   * Determine which section we're currently *inside*.
   *
   * A section is "active" if:
   *   - its top is above 35% of the viewport (we've scrolled into it)
   *   - its bottom is still below 10% of the viewport (we haven't fully scrolled past it)
   *
   * The hero section (id="hero") acts as a "null section" — when the hero is
   * the active element, the hash is cleared (main page).
   *
   * DOM order with chat: #chat → #hero → #posts → #space → #tools
   * DOM order without:           #hero → #posts → #space → #tools
   */
  function _updateActiveSectionFromScroll() {
    if (!import.meta.client || !_hashSyncEnabled) return

    const vh = window.innerHeight
    const topThreshold = vh * 0.35   // section top must be above this
    const bottomThreshold = vh * 0.10 // section bottom must be below this

    // Walk ALL trackable sections in DOM order (including hero as divider).
    // The last one we're "inside" wins.
    const trackingIds = [...SECTION_IDS, 'hero'] as const
    let bestId: SectionId | 'hero' | null = null

    for (const id of trackingIds) {
      const el = document.getElementById(id)
      if (!el) continue
      const rect = el.getBoundingClientRect()

      // We're "inside" this section if we've scrolled past its top
      // but haven't fully scrolled past its bottom.
      if (rect.top <= topThreshold && rect.bottom > bottomThreshold) {
        bestId = id as SectionId | 'hero'
      }
    }

    // hero = main page (no hash)
    const resolvedId: SectionId | null = (bestId === 'hero' || bestId === null) ? null : bestId

    if (resolvedId !== activeSection.value) {
      activeSection.value = resolvedId
      if (resolvedId) {
        _setHash(resolvedId)
      } else {
        _clearHash()
      }
    }
  }

  function _teardownObserver() {
    _observer?.disconnect()
    _observer = null
  }

  // ─── Scroll listener (supplements IntersectionObserver) ────────────
  let _scrollRaf = 0

  function _onScroll() {
    cancelAnimationFrame(_scrollRaf)
    _scrollRaf = requestAnimationFrame(_updateActiveSectionFromScroll)
  }

  // ─── Hash → scroll (page load / SPA cross-page nav) ────────────────
  /**
   * Single authority for hash-based scrolling. Called synchronously from
   * init() (which runs in onMounted), so the DOM is ready and we can
   * scroll before the browser paints — zero visual flash.
   *
   * Also handles stale Lenis state from a previous page by resetting
   * Lenis to 0 before scrolling to the target section.
   */
  function _resolveHashOnLoad() {
    if (!import.meta.client) return

    // If a page transition (usePageTransition) is in progress, skip all scroll
    // logic here — transitionTo() handles scroll restoration itself (Phases 2.5
    // and 2.8). Running both would race: _resolveHashOnLoad resets Lenis to 0
    // before scrolling to the target, and for sections far down the page (like
    // #tools) the scroll may fail because layout hasn't settled yet. The
    // subsequent reenableHashSync → _updateActiveSectionFromScroll could then
    // detect the wrong section and trigger a smooth scroll that overrides the
    // transition's own scroll-to-hash.
    if (isPageTransitioning()) {
      // Still set up observer / hash sync — just don't scroll.
      // Keep hash sync suppressed briefly so the observer doesn't clobber the
      // hash that usePageTransition will set.
      _hashSyncEnabled = false
      setTimeout(() => {
        _hashSyncEnabled = true
      }, 2000) // generous delay: let the transition finish first
      return
    }

    // Suppress observer-driven hash rewrites while we snap to the initial hash.
    _hashSyncEnabled = false
    const reenableHashSync = () => {
      setTimeout(() => {
        _hashSyncEnabled = true
        _updateActiveSectionFromScroll()
      }, 120)
    }
    let hash = window.location.hash.slice(1)

    // Infer hash from query params: ?posts=N implies #posts.
    // This handles the case where the URL was saved/shared without a hash
    // (e.g. /?posts=6) — the user expects to land on the posts section.
    if (!hash) {
      const params = new URLSearchParams(window.location.search)
      if (params.has('posts')) {
        hash = 'posts'
        _setHash('posts')
      }
    }

    // No hash: if a chat section exists above the hero, the browser starts at
    // scroll 0 = chat. Snap to the hero so the landing page is always "Home".
    if (!hash) {
      const chatEl = document.getElementById('chat')
      if (chatEl) {
        const heroEl = document.getElementById('hero')
        if (heroEl) {
          const lenis = getLenis()
          if (lenis) {
            lenis.scrollTo(heroEl, { immediate: true })
          } else {
            heroEl.scrollIntoView({ behavior: 'instant', block: 'start' })
          }
        }
      }
      reenableHashSync()
      return
    }

    // Ignore focus-panel hashes — useFocusPanel handles these
    if (isFocusPanelHash(hash)) {
      reenableHashSync()
      return
    }

    // Check if it's a known section
    if ((SECTION_IDS as readonly string[]).includes(hash)) {
      const scrollToHash = () => {
        const el = document.getElementById(hash)
        if (el) {
          const lenis = getLenis()
          // Small negative offset so the section heading has breathing room
          const offset = -40
          if (lenis) {
            // Reset stale Lenis state (may be left over from a previous page),
            // then immediately scroll to the target. Both calls are synchronous
            // with immediate:true, so only the final position is painted.
            lenis.scrollTo(0, { immediate: true })
            lenis.scrollTo(el, { immediate: true, offset })
          } else {
            const top = el.getBoundingClientRect().top + window.scrollY + offset
            window.scrollTo({ top, behavior: 'instant' })
          }
          reenableHashSync()
          return true
        }
        return false
      }

      // Try immediately — DOM should be ready since we're called from onMounted
      if (!scrollToHash()) {
        // Edge case: element not yet in DOM (e.g. async component). Retry once
        // after the next animation frame.
        requestAnimationFrame(() => {
          if (!scrollToHash()) {
            _clearHash()
          }
          reenableHashSync()
        })
      } else {
        // Already scrolled; allow observer-driven updates after a short delay
        reenableHashSync()
      }
    } else {
      reenableHashSync()
    }
  }

  function _onHashChange() {
    if (!import.meta.client) return
    const hash = window.location.hash.slice(1)
    if (isFocusPanelHash(hash)) return

    if (!hash) {
      // Hash cleared externally → we're at top
      activeSection.value = null
      return
    }

    if ((SECTION_IDS as readonly string[]).includes(hash)) {
      scrollTo(hash as SectionId)
    }
  }

  // ─── Lifecycle ─────────────────────────────────────────────────────
  function init() {
    if (!import.meta.client || _initialized) return
    _initialized = true

    _setupObserver()
    window.addEventListener('scroll', _onScroll, { passive: true })
    window.addEventListener('hashchange', _onHashChange)

    // Resolve hash immediately — DOM is ready at onMounted time.
    // No setTimeout needed; this runs before the browser paints.
    _resolveHashOnLoad()
  }

  function destroy() {
    if (!import.meta.client) return
    _initialized = false
    _teardownObserver()
    cancelAnimationFrame(_scrollRaf)
    window.removeEventListener('scroll', _onScroll)
    window.removeEventListener('hashchange', _onHashChange)
  }

  /**
   * Re-observe sections (call after DOM changes, e.g. chat appearing/disappearing).
   */
  function refresh() {
    if (!import.meta.client || !_initialized) return
    _setupObserver()
  }

  return {
    /** Currently active section (null = at top / hero) */
    activeSection: readonly(activeSection),
    /** All known section IDs */
    sectionIds: SECTION_IDS,
    /** Scroll to a section by ID, or to top */
    scrollTo,
    /** Re-observe sections after DOM changes */
    refresh,
    /** Initialize (call once in onMounted) */
    init,
    /** Cleanup (call in onUnmounted) */
    destroy,
  }
}
