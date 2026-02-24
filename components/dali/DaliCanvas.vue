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
 * On mobile (< 1024px), the focus column is hidden and the SlidePanel in
 * index.vue handles focus mode instead.
 */
import { useCanvasCamera } from '~/composables/useCanvasCamera'

const camera = useCanvasCamera()
const { focusX, isFocused } = camera

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
  }
})

const canvasTransform = computed(() => {
  // On mobile, never pan — SlidePanel handles focus mode
  if (isMobile.value) return 'translateX(0)'
  return `translateX(${focusX.value}vw)`
})
</script>

<template>
  <div class="dali-canvas-viewport">
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

      <!-- Focus Column (right) — hidden on mobile, SlidePanel used instead -->
      <div
        class="dali-focus dali-focus-surface hidden lg:block"
        :class="{ 'dali-focus--active': isFocused && !isMobile }"
      >
        <slot name="focus" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.dali-canvas-viewport {
  position: relative;
  width: 100vw;
  overflow-x: hidden;
}

.dali-canvas {
  display: flex;
  width: 200vw;
  min-height: 100vh;
  transition: none; /* GSAP handles the animation */
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
</style>
