import { ref, readonly, onMounted, onUnmounted } from 'vue'

export type FocusTarget = 'none' | 'post' | 'chatty' | 'tool' | 'about' | 'contact' | 'gallery'

/**
 * Shared global state for the canvas camera.
 * This ensures all components that call useCanvasCamera() share the same state.
 */
const focusX = ref(0)
const isFocused = ref(false)
const focusTarget = ref<FocusTarget>('none')
const activeSectionId = ref('')
const isAnimating = ref(false)

let gsapInstance: any = null
let listenersAttached = false

async function ensureGsap() {
  if (gsapInstance) return gsapInstance
  const { gsap } = await import('gsap')
  gsapInstance = gsap
  return gsap
}

/**
 * useCanvasCamera — manages the 2D camera for the Dalí canvas.
 *
 * Vertical scroll is handled natively by the browser + Lenis.
 * Horizontal pan is managed via CSS custom properties animated by GSAP.
 *
 * Call panToFocus() to slide the viewport right (reveal focused content).
 * Call panToDiscovery() to slide back.
 */
export const useCanvasCamera = () => {
  /**
   * Pan the camera right to reveal the focus column.
   * Returns a Promise that resolves when the animation completes.
   */
  function panToFocus(target: FocusTarget = 'post'): Promise<void> {
    if (isAnimating.value || isFocused.value) return Promise.resolve()
    isAnimating.value = true
    focusTarget.value = target

    return new Promise(async (resolve) => {
      const gsap = await ensureGsap()

      if (import.meta.client) {
        document.body.style.overflow = 'hidden'
      }

      gsap.to(focusX, {
        value: -100,
        duration: 0.7,
        ease: 'power3.inOut',
        onComplete: () => {
          isFocused.value = true
          isAnimating.value = false
          if (import.meta.client) {
            document.body.style.overflow = ''
          }
          resolve()
        },
      })
    })
  }

  /**
   * Pan the camera back to discovery mode.
   * Returns a Promise that resolves when the animation completes.
   */
  function panToDiscovery(): Promise<void> {
    if (isAnimating.value || !isFocused.value) return Promise.resolve()
    isAnimating.value = true

    return new Promise(async (resolve) => {
      const gsap = await ensureGsap()

      if (import.meta.client) {
        document.body.style.overflow = 'hidden'
      }

      gsap.to(focusX, {
        value: 0,
        duration: 0.6,
        ease: 'power3.inOut',
        onComplete: () => {
          isFocused.value = false
          focusTarget.value = 'none'
          isAnimating.value = false
          if (import.meta.client) {
            document.body.style.overflow = ''
          }
          resolve()
        },
      })
    })
  }

  /**
   * Toggle between discovery and focus.
   */
  function toggle(target: FocusTarget = 'post') {
    if (isFocused.value) {
      panToDiscovery()
    } else {
      panToFocus(target)
    }
  }

  // NOTE: Escape key handling is done by useFocusPanel, NOT here.
  // Calling panToDiscovery() directly would bypass the panel stack,
  // hash routing, and scroll restoration.

  return {
    focusX: readonly(focusX),
    isFocused: readonly(isFocused),
    focusTarget: readonly(focusTarget),
    activeSectionId,
    isAnimating: readonly(isAnimating),
    panToFocus,
    panToDiscovery,
    toggle,
  }
}
