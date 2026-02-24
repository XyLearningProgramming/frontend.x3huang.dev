<script setup lang="ts">
/**
 * SlidePanel — Full-screen panel that slides in from the right.
 * Used for mobile focus mode (post detail, gallery lightbox, about, contact, etc.)
 * Supports swipe-right to dismiss (touch), Escape key, and back button.
 *
 * Restyled with Dalí visual tokens for the surrealist design.
 */

interface Props {
  open: boolean
  title?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

// Track touch for swipe-to-dismiss
const panelRef = ref<HTMLElement | null>(null)
const touchStartX = ref(0)
const touchDeltaX = ref(0)
const isDragging = ref(false)
const showHint = ref(true)

// Hide hint after 2.5s
let hintTimeout: ReturnType<typeof setTimeout> | null = null

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    showHint.value = true
    if (hintTimeout) clearTimeout(hintTimeout)
    hintTimeout = setTimeout(() => {
      showHint.value = false
    }, 2500)
    // Lock body scroll
    if (import.meta.client) {
      document.body.style.overflow = 'hidden'
    }
  } else {
    showHint.value = false
    if (hintTimeout) clearTimeout(hintTimeout)
    // Restore body scroll
    if (import.meta.client) {
      document.body.style.overflow = ''
    }
  }
})

// Keyboard: Escape to close
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.open) {
    emit('close')
  }
}

onMounted(() => {
  if (import.meta.client) {
    window.addEventListener('keydown', onKeydown)
  }
})

onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener('keydown', onKeydown)
    document.body.style.overflow = ''
    if (hintTimeout) clearTimeout(hintTimeout)
  }
})

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
    emit('close')
  }
  touchDeltaX.value = 0
}

const panelStyle = computed(() => {
  if (isDragging.value && touchDeltaX.value > 0) {
    return {
      transform: `translateX(${touchDeltaX.value}px)`,
      transition: 'none',
    }
  }
  return {}
})
</script>

<template>
  <Teleport to="body">
    <Transition name="slide-panel">
      <div
        v-if="open"
        class="fixed inset-0 z-[100] flex"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/70 backdrop-blur-sm"
          @click="emit('close')"
        />

        <!-- Panel -->
        <div
          ref="panelRef"
          class="relative ml-auto w-full h-full dali-focus-surface overflow-y-auto overflow-x-hidden"
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

          <!-- Close button (Dalí styled) -->
          <div class="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-dali-cream border-b-2 border-dali-void/10">
            <button
              class="dali-btn bg-transparent text-dali-void border-dali-void px-3 py-1.5 text-sm font-bold flex items-center gap-2"
              style="--color-dali-red: var(--color-dali-void);"
              @click="emit('close')"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <span v-if="title" class="text-sm font-bold text-dali-void/60 truncate max-w-[60%]">
              {{ title }}
            </span>
            <button
              class="text-xs font-bold text-dali-void/60 hover:text-dali-void px-2 py-1"
              @click="emit('close')"
            >
              ESC
            </button>
          </div>

          <!-- Content -->
          <div class="px-6 md:px-12 py-8 max-w-4xl mx-auto">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
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
