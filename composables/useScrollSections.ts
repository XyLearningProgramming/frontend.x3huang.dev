import { ref, readonly } from 'vue'

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
    window.history.replaceState(null, '', `#${id}`)
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

  // ─── Hash → scroll (page load / hashchange) ───────────────────────
  function _resolveHashOnLoad() {
    if (!import.meta.client) return
    const hash = window.location.hash.slice(1)

    // No hash: if a chat section exists above the hero, the browser starts at
    // scroll 0 = chat. Snap to the hero so the landing page is always "Home".
    if (!hash) {
      const chatEl = document.getElementById('chat')
      if (chatEl) {
        const heroEl = document.getElementById('hero')
        if (heroEl) {
          // Instant jump (no smooth scroll) so there's no flash of chat
          heroEl.scrollIntoView({ behavior: 'instant', block: 'start' })
        }
      }
      return
    }

    // Ignore focus-panel hashes
    if (isFocusPanelHash(hash)) return

    // Check if it's a known section
    if ((SECTION_IDS as readonly string[]).includes(hash)) {
      // Scroll to the section. Use immediate to avoid the entrance animation
      // competing with a long smooth scroll.
      const el = document.getElementById(hash)
      if (el) {
        scrollTo(hash as SectionId, { duration: 0.01, immediate: true })
      }
      // If element doesn't exist (e.g. #chat with no messages), clear hash
      else {
        _clearHash()
      }
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

    // Resolve hash on load (after a small delay to let DOM settle)
    setTimeout(_resolveHashOnLoad, 100)
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
