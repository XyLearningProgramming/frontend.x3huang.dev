import { ref, readonly, computed } from 'vue'
import { useCanvasCamera } from '~/composables/useCanvasCamera'

/**
 * useFocusPanel — Universal focus panel lifecycle manager.
 *
 * Centralises hash routing, panel stack management, scroll position
 * save/restore, and camera control for every panel type that appears
 * in the DaliCanvas focus column (post, about, contact, gallery,
 * and future tool panels).
 *
 * ### Panel stack
 * `open()` pushes entries onto a stack. `back()` pops one level.
 * `close()` clears the entire stack and returns to discovery.
 *
 * Example flow:
 *   discovery → open('post', blogPost) → back() → discovery
 *
 * ### Hash routing
 * Each `open()` pushes a browser history entry (`#about`, `#post/posts/…`).
 * `popstate` calls `back()`. Direct URL entry on mount calls `syncFromUrl()`.
 *
 * ### Scroll preservation
 * Discovery scroll position is captured on the first `open()` and restored
 * on the final `close()` (return to discovery).
 */

export type PanelType = 'post' | 'posts' | 'about' | 'contact' | 'gallery' | 'tool'

export interface PanelEntry {
  type: PanelType
  payload: any
  hash: string
  /** Scroll position within the focus column for this entry (for nested nav) */
  focusScrollY: number
}

// ─── Shared singleton state ───────────────────────────────────────────
const panelStack = ref<PanelEntry[]>([])
const savedDiscoveryScrollY = ref(0)
const _isInitialized = ref(false)

/**
 * The currently active panel (top of stack), or null when in discovery mode.
 */
const activePanel = computed<PanelType | null>(() => {
  const stack = panelStack.value
  return stack.length > 0 ? stack[stack.length - 1].type : null
})

/**
 * The payload of the currently active panel.
 */
const panelPayload = computed<any>(() => {
  const stack = panelStack.value
  return stack.length > 0 ? stack[stack.length - 1].payload : null
})

/**
 * The full panel history (read-only).
 */
const panelHistory = computed(() => panelStack.value)

export function useFocusPanel() {
  const { panToFocus, panToDiscovery, isFocused } = useCanvasCamera()

  // ─── Open a panel ──────────────────────────────────────────────────
  /**
   * Open a focus panel. Pushes onto the stack, updates the hash, and
   * pans the camera to focus if not already there.
   *
   * @param type    Panel type identifier
   * @param payload Optional data (e.g. BlogPost object, GalleryImage)
   * @param hash    URL hash fragment (without #). Defaults to `type`.
   */
  async function open(type: PanelType, payload?: any, hash?: string) {
    // Auto-generate hash for posts: post/posts/20201002_mecanim
    const resolvedHash = hash ?? (type === 'post' && payload?.path ? `post${payload.path}` : type)

    // Save discovery scroll position on first open
    if (panelStack.value.length === 0 && import.meta.client) {
      savedDiscoveryScrollY.value = window.scrollY
    }

    // If there's already a panel open, save its focus scroll position
    if (panelStack.value.length > 0 && import.meta.client) {
      const focusEl = document.querySelector('.dali-focus') as HTMLElement | null
      const top = panelStack.value[panelStack.value.length - 1]
      if (focusEl) {
        top.focusScrollY = focusEl.scrollTop
      }
    }

    // Push new entry
    panelStack.value = [
      ...panelStack.value,
      { type, payload, hash: resolvedHash, focusScrollY: 0 },
    ]

    // Update browser hash
    if (import.meta.client) {
      window.history.pushState({ ...history.state, focusPanel: true }, '', `#${resolvedHash}`)
    }

    // Pan camera to focus (no-op if already focused)
    if (!isFocused.value) {
      await panToFocus(type as any)
    }

    // Scroll focus column to top for the new panel
    if (import.meta.client) {
      await nextTick()
      requestAnimationFrame(() => {
        const focusEl = document.querySelector('.dali-focus') as HTMLElement | null
        if (focusEl) focusEl.scrollTop = 0
        // Also reset the mobile overlay scroll if present
        const mobilePanel = document.querySelector('.dali-focus-surface[data-mobile-panel]') as HTMLElement | null
        if (mobilePanel) mobilePanel.scrollTop = 0
      })
    }
  }

  // ─── Go back one level ─────────────────────────────────────────────
  /**
   * Pop the top panel from the stack. If the stack becomes empty,
   * returns to discovery mode and restores scroll position.
   */
  async function back() {
    if (panelStack.value.length === 0) return

    // Pop the top entry
    const newStack = panelStack.value.slice(0, -1)
    panelStack.value = newStack

    if (newStack.length === 0) {
      // Return to discovery
      await _returnToDiscovery()
    } else {
      // Restore the previous panel's hash and scroll position
      const prev = newStack[newStack.length - 1]
      if (import.meta.client) {
        window.history.replaceState({ ...history.state, focusPanel: true }, '', `#${prev.hash}`)
        // Restore focus column scroll position
        await nextTick()
        const focusEl = document.querySelector('.dali-focus') as HTMLElement | null
        if (focusEl) focusEl.scrollTop = prev.focusScrollY
      }
    }
  }

  // ─── Close all panels ──────────────────────────────────────────────
  /**
   * Clear the entire stack and return to discovery mode.
   * Restores the saved discovery scroll position.
   */
  async function close() {
    panelStack.value = []
    await _returnToDiscovery()
  }

  // ─── Internal: return to discovery ─────────────────────────────────
  async function _returnToDiscovery() {
    // Clear hash
    if (import.meta.client) {
      window.history.replaceState(history.state, '', window.location.pathname)
    }

    // Wait for the camera animation to fully complete before restoring scroll
    await panToDiscovery()

    // Restore discovery scroll position after the animation finishes
    if (import.meta.client) {
      await nextTick()
      // Use requestAnimationFrame to ensure the layout has settled
      requestAnimationFrame(() => {
        window.scrollTo({ top: savedDiscoveryScrollY.value, behavior: 'instant' as ScrollBehavior })
      })
    }
  }

  // ─── Hash routing ──────────────────────────────────────────────────
  /**
   * Parse a hash string and open the corresponding panel.
   * Called from popstate handler or on mount for direct URL entry.
   *
   * @param hash The hash without the leading #
   * @param resolver An async function that resolves a post path to a BlogPost object
   */
  async function handleHash(hash: string, resolver?: (path: string) => Promise<any>) {
    if (!hash) {
      close()
      return
    }

    if (hash === 'about') {
      // Redirect to standalone about page
      if (import.meta.client) navigateTo('/about')
      return
    } else if (hash === 'contact') {
      // Contact page hidden — redirect to space section
      if (import.meta.client) navigateTo('/#space')
      return
    } else if (hash === 'gallery') {
      // Gallery is inline in the space section with a lightbox overlay
      if (import.meta.client) navigateTo('/#space')
      return
    } else if (hash.startsWith('post/')) {
      // Blog post deep links now redirect to standalone blog page
      if (import.meta.client) {
        const path = '/' + hash.slice(5) // Remove 'post/' prefix, add leading /
        navigateTo(path)
      }
    } else if (hash.startsWith('tool/')) {
      await open('tool', { id: hash.slice(5) }, hash)
    }
  }

  /**
   * Called on mount to handle direct URL entry (e.g. `/#post/posts/20201002_mecanim`).
   */
  async function syncFromUrl(resolver?: (path: string) => Promise<any>) {
    if (!import.meta.client) return
    const hash = window.location.hash.slice(1)
    if (hash) {
      // Save current scroll as discovery position (should be 0 on fresh load)
      savedDiscoveryScrollY.value = window.scrollY
      await handleHash(hash, resolver)
    }
  }

  // ─── Popstate handler ──────────────────────────────────────────────
  function onPopState() {
    if (!import.meta.client) return
    const hash = window.location.hash.slice(1)
    if (!hash) {
      // User pressed back past all panels
      close()
    } else {
      // User pressed back to a previous panel — just pop our stack
      back()
    }
  }

  // ─── Keyboard: Escape to go back ──────────────────────────────────
  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && isFocused.value) {
      e.preventDefault()
      if (panelStack.value.length > 1) {
        back()
      } else {
        close()
      }
    }
  }

  // ─── Lifecycle setup (call once) ───────────────────────────────────
  function init(resolver?: (path: string) => Promise<any>) {
    if (!import.meta.client || _isInitialized.value) return

    _isInitialized.value = true
    window.addEventListener('popstate', onPopState)
    window.addEventListener('keydown', onKeydown)

    // Handle direct URL entry
    syncFromUrl(resolver)
  }

  function destroy() {
    if (!import.meta.client) return
    _isInitialized.value = false
    window.removeEventListener('popstate', onPopState)
    window.removeEventListener('keydown', onKeydown)
    panelStack.value = []
  }

  return {
    // State (read-only)
    activePanel,
    panelPayload,
    panelHistory,
    isFocused: readonly(isFocused),

    // Methods
    open,
    back,
    close,

    // Hash routing
    handleHash,
    syncFromUrl,

    // Lifecycle
    init,
    destroy,
    onPopState,

    // Scroll preservation (exposed for edge cases)
    savedDiscoveryScrollY: readonly(savedDiscoveryScrollY),
  }
}
