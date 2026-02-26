<script setup lang="ts">
/**
 * DaliCanvas — The 2D canvas wrapper for the surrealist scroll experience.
 *
 * The canvas is a wide container (200vw) with two columns:
 *   Left column (x=0):     Discovery — the vertical scroll gallery
 *   Right column (x=100vw): Focus — clean reading/interaction surfaces
 *
 * The camera (useCanvasCamera) controls horizontal panning via translateX.
 * Vertical scrolling is native (Lenis enhanced).
 *
 * Background color is driven by useColorFlow — a scroll-scrubbed interpolation
 * across a configurable palette (light yellow → dark blue by default).
 *
 * On mobile (< 1024px), the focus column renders as a fixed overlay
 * (Teleported to <body>) with swipe-right-to-dismiss, instead of the
 * inline second column that pans via translateX on desktop.
 */
import { useCanvasCamera } from '~/composables/useCanvasCamera'
import { useColorFlow } from '~/composables/useColorFlow'

const emit = defineEmits<{
  close: []
}>()

const camera = useCanvasCamera()
const { focusX, isFocused } = camera

// Color flow — the targetRef receives --color-flow-bg + inline backgroundColor
const { targetRef: colorFlowRef, currentColor } = useColorFlow()

const isMobile = ref(false)

function checkMobile() {
  if (import.meta.client) {
    isMobile.value = window.innerWidth < 1024
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile, { passive: true })
})

onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener('resize', checkMobile)
    document.body.style.overflow = ''
    if (hintTimeout) clearTimeout(hintTimeout)
  }
})

const canvasTransform = computed(() => {
  // On mobile, never pan — overlay handles focus mode
  if (isMobile.value) return 'translateX(0)'
  return `translateX(${focusX.value}vw)`
})

// ==================== Mobile overlay logic (absorbed from NeoSlidePanel) ====================
const panelRef = ref<HTMLElement | null>(null)
const touchStartX = ref(0)
const touchDeltaX = ref(0)
const isDragging = ref(false)
const showHint = ref(false)

let hintTimeout: ReturnType<typeof setTimeout> | null = null

// Show the mobile overlay when focused on mobile
const mobileOverlayOpen = computed(() => isMobile.value && isFocused.value)

watch(mobileOverlayOpen, (isOpen) => {
  if (isOpen) {
    showHint.value = true
    if (hintTimeout) clearTimeout(hintTimeout)
    hintTimeout = setTimeout(() => {
      showHint.value = false
    }, 2500)
    if (import.meta.client) {
      document.body.style.overflow = 'hidden'
    }
  } else {
    showHint.value = false
    if (hintTimeout) clearTimeout(hintTimeout)
    if (import.meta.client) {
      document.body.style.overflow = ''
    }
  }
})

function onClose() {
  emit('close')
}

// Touch swipe-to-dismiss
function onTouchStart(e: TouchEvent) {
  touchStartX.value = e.touches[0].clientX
  touchDeltaX.value = 0
  isDragging.value = true
}

function onTouchMove(e: TouchEvent) {
  if (!isDragging.value) return
  const delta = e.touches[0].clientX - touchStartX.value
  // Only allow swiping to the right (positive delta = swiping right to dismiss)
  touchDeltaX.value = Math.max(0, delta)
}

function onTouchEnd() {
  isDragging.value = false
  // If swiped more than 30% of viewport, dismiss
  if (touchDeltaX.value > window.innerWidth * 0.3) {
    onClose()
  }
  touchDeltaX.value = 0
}

const panelStyle = computed(() => {
  const base: Record<string, string> = {
    // Mobile overlay is teleported outside the viewport.
    // Use the solid dark void color for consistent readability.
    backgroundColor: 'var(--color-dali-void, #0B0B0F)',
  }
  if (isDragging.value && touchDeltaX.value > 0) {
    base.transform = `translateX(${touchDeltaX.value}px)`
    base.transition = 'none'
  }
  return base
})
</script>

<template>
  <div ref="colorFlowRef" class="dali-canvas-viewport">
    <!-- Film grain overlay -->
    <div class="dali-grain" />

    <div
      class="dali-canvas"
      :style="{ transform: canvasTransform }"
    >
      <!-- Discovery Column (left) -->
      <div class="dali-discovery">
        <slot name="discovery" />
      </div>

      <!-- Focus Column (right) — desktop: inline second column -->
      <div
        v-if="!isMobile"
        class="dali-focus dali-focus-surface"
        :class="{ 'dali-focus--active': isFocused }"
      >
        <slot name="focus" />
      </div>
    </div>

    <!-- Focus Column — mobile: fixed overlay with swipe-to-dismiss -->
    <Teleport to="body">
      <Transition name="slide-panel">
        <div
          v-if="mobileOverlayOpen"
          class="fixed inset-0 z-[100] flex"
        >
          <!-- Backdrop -->
          <div
            class="absolute inset-0 bg-black/70 backdrop-blur-sm"
            @click="onClose"
          />

          <!-- Panel -->
          <div
            ref="panelRef"
            class="relative ml-auto w-full h-full dali-focus-surface overflow-y-auto overflow-x-hidden"
            data-mobile-panel
            :style="panelStyle"
            @touchstart.passive="onTouchStart"
            @touchmove.passive="onTouchMove"
            @touchend.passive="onTouchEnd"
          >
            <!-- Left edge hint (swipe back) -->
            <div
              class="absolute left-0 top-0 bottom-0 w-10 z-10 pointer-events-none flex items-center justify-start"
            >
              <div
                class="slide-hint-gradient absolute inset-0"
                :class="{ 'opacity-0': !showHint }"
              />
              <Transition name="fade-hint">
                <div
                  v-if="showHint"
                  class="relative flex flex-col items-center gap-1 pl-1.5"
                >
                  <svg class="w-5 h-5 text-dali-void/40 animate-hint-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </div>
              </Transition>
            </div>

            <!-- Reuse the same #focus slot content -->
            <slot name="focus" />
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.dali-canvas-viewport {
  position: relative;
  width: 100vw;
  overflow-x: hidden;
  /* Color flow: initial color set by useColorFlow, transitions smoothly */
  background-color: var(--color-flow-bg, #F5E6B8);
  will-change: background-color;
  /* Initial color-flow values matching the first palette stop (light parchment
     background → dark text). These prevent a flash of white text before the
     JS-driven useColorFlow kicks in. Once initialized, GSAP overwrites them
     via inline styles as the user scrolls. */
  --color-flow-text: #1A1A2E;
  --color-flow-muted: #6B6B7B;
}

.dali-canvas {
  display: flex;
  width: 200vw;
  min-height: 100vh;
  transition: none; /* GSAP handles the transform animation */
  will-change: transform;
}

/* On mobile, canvas is only 100vw — no focus column */
@media (max-width: 1023px) {
  .dali-canvas {
    width: 100vw;
  }
}

.dali-discovery {
  width: 100vw;
  min-height: 100vh;
  flex-shrink: 0;
  position: relative;
  /* Transparent — inherits the flowing background from viewport */
  background: transparent;
}

.dali-focus {
  width: 100vw;
  min-height: 100vh;
  flex-shrink: 0;
  position: relative;
  overflow-y: auto;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.dali-focus--active {
  opacity: 1;
  pointer-events: auto;
}

/* ==================== Mobile overlay transitions ==================== */

/* Panel slide transition */
.slide-panel-enter-active {
  transition: opacity 0.3s ease;
}
.slide-panel-enter-active > div:last-child {
  transition: transform 0.45s cubic-bezier(0.32, 0.72, 0, 1);
}
.slide-panel-leave-active {
  transition: opacity 0.25s ease;
}
.slide-panel-leave-active > div:last-child {
  transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1);
}
.slide-panel-enter-from {
  opacity: 0;
}
.slide-panel-enter-from > div:last-child {
  transform: translateX(100%);
}
.slide-panel-leave-to {
  opacity: 0;
}
.slide-panel-leave-to > div:last-child {
  transform: translateX(100%);
}

/* Left edge gradient hint */
.slide-hint-gradient {
  background: linear-gradient(to right, rgba(0,0,0,0.06), transparent);
  transition: opacity 0.6s ease;
}

/* Hint arrow bounce */
@keyframes hintArrow {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(-4px); }
}
.animate-hint-arrow {
  animation: hintArrow 1.2s ease-in-out infinite;
}

/* Fade hint */
.fade-hint-enter-active,
.fade-hint-leave-active {
  transition: opacity 0.5s ease;
}
.fade-hint-enter-from,
.fade-hint-leave-to {
  opacity: 0;
}
</style>
