<script setup lang="ts">
import type { GalleryImage } from '~/composables/useBackgroundGallery'

interface Props {
  images: GalleryImage[]
  modelValue: number | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [index: number | null]
}>()

const isOpen = computed(() => props.modelValue !== null && props.modelValue >= 0)
const currentImage = computed(() =>
  props.modelValue !== null && props.modelValue >= 0 && props.modelValue < props.images.length
    ? props.images[props.modelValue]
    : null,
)

const hasPrev = computed(() => props.modelValue !== null && props.modelValue > 0)
const hasNext = computed(() => props.modelValue !== null && props.modelValue < props.images.length - 1)
const showNav = computed(() => props.images.length > 1)

function close() {
  emit('update:modelValue', null)
}

function prev() {
  if (hasPrev.value && props.modelValue !== null) {
    emit('update:modelValue', props.modelValue - 1)
  }
}

function next() {
  if (hasNext.value && props.modelValue !== null) {
    emit('update:modelValue', props.modelValue + 1)
  }
}

// ── Keyboard navigation ──
function onKeydown(e: KeyboardEvent) {
  if (!isOpen.value) return
  if (e.key === 'Escape') close()
  else if (e.key === 'ArrowLeft') prev()
  else if (e.key === 'ArrowRight') next()
}

// ── Body scroll lock ──
watch(isOpen, (open) => {
  if (!import.meta.client) return
  if (open) {
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeydown)
  } else {
    document.body.style.overflow = ''
    document.removeEventListener('keydown', onKeydown)
  }
})

onUnmounted(() => {
  if (import.meta.client) {
    document.body.style.overflow = ''
    document.removeEventListener('keydown', onKeydown)
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="lightbox">
      <div
        v-if="isOpen && currentImage"
        class="fixed inset-0 z-[9999] flex items-center justify-center lightbox-overlay"
        @click.self="close"
      >
        <!-- Close button -->
        <button
          class="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors backdrop-blur-sm"
          aria-label="Close lightbox"
          @click="close"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Main content area -->
        <div class="flex flex-col items-center max-w-[90vw] max-h-[90vh] w-full">
          <!-- Image -->
          <div class="relative flex items-center justify-center w-full">
            <!-- Prev button -->
            <button
              v-if="showNav && hasPrev"
              class="lightbox-arrow-btn absolute left-2 md:left-4 z-10"
              aria-label="Previous image"
              @click.stop="prev"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <NuxtImg
              :key="modelValue ?? -1"
              :src="currentImage.url"
              :alt="currentImage.alt || currentImage.title || 'Gallery photo'"
              sizes="sm:100vw md:80vw lg:1200px"
              format="webp"
              class="max-h-[75vh] max-w-full object-contain rounded select-none"
            />

            <!-- Next button -->
            <button
              v-if="showNav && hasNext"
              class="lightbox-arrow-btn absolute right-2 md:right-4 z-10"
              aria-label="Next image"
              @click.stop="next"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <!-- Caption + controls row -->
          <div class="mt-4 flex flex-col items-center gap-3 w-full max-w-2xl px-4">
            <!-- Title + note -->
            <div v-if="currentImage.title || currentImage.note" class="text-center">
              <p v-if="currentImage.title" class="font-bold text-base text-white">
                {{ currentImage.title }}
              </p>
              <p v-if="currentImage.note" class="text-sm text-white/60 italic mt-1">
                {{ currentImage.note }}
              </p>
            </div>

            <!-- Counter + download -->
            <div class="flex items-center gap-4">
              <span v-if="showNav" class="text-sm text-white/40">
                {{ (modelValue ?? 0) + 1 }} / {{ images.length }}
              </span>
              <a
                :href="currentImage.url"
                download
                class="inline-flex items-center gap-1.5 text-xs font-bold text-white/50 hover:text-white/80 transition-colors uppercase tracking-wider"
                @click.stop
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download original
              </a>
            </div>

            <!-- ESC hint (desktop) -->
            <p class="text-xs text-white/25 hidden md:block">
              Press ESC to close &middot; Arrow keys to navigate
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.lightbox-overlay {
  background: rgba(0, 0, 0, 0.92);
  backdrop-filter: blur(8px);
}

.lightbox-arrow-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.15);
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
  backdrop-filter: blur(4px);
}
.lightbox-arrow-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

/* Transition */
.lightbox-enter-active {
  transition: opacity 0.25s ease;
}
.lightbox-leave-active {
  transition: opacity 0.2s ease;
}
.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}
</style>
