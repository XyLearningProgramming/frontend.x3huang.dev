<template>
  <figure class="my-6 text-center">
    <div
      class="inline-block overflow-hidden rounded border border-dali-white/15 bg-dali-smoke/40 cursor-pointer group relative"
      @click="openModal"
    >
      <ClientOnly>
        <NuxtImg
          :src="refinedSrc"
          :alt="alt"
          :width="thumbnailWidth"
          :height="thumbnailHeight"
          fit="inside"
          :sizes="responsiveSizes"
          format="webp"
          :quality="75"
          loading="lazy"
          class="block max-w-full h-auto transition-all duration-200 group-hover:brightness-110 group-hover:scale-[1.01]"
        />
        <template #fallback>
          <div class="w-full h-48 bg-dali-smoke animate-pulse" />
        </template>
      </ClientOnly>
      <!-- Zoom hint overlay -->
      <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/20 pointer-events-none">
        <div class="w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
        </div>
      </div>
    </div>
    <figcaption v-if="alt" class="mt-3 text-sm text-dali-muted italic">{{ alt }}</figcaption>
  </figure>

  <!-- Lightbox modal -->
  <Teleport to="body">
    <Transition name="prose-lightbox">
      <div
        v-if="isModalOpen"
        class="fixed inset-0 z-[9999] flex items-center justify-center prose-lightbox-overlay"
        @click.self="closeModal"
      >
        <!-- Close button -->
        <button
          class="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors backdrop-blur-sm"
          aria-label="Close lightbox"
          @click="closeModal"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Main content area -->
        <div class="flex flex-col items-center max-w-[90vw] max-h-[90vh] w-full">
          <!-- High-res image -->
          <div class="relative flex items-center justify-center w-full">
            <NuxtImg
              :src="refinedSrc"
              :alt="alt"
              sizes="sm:100vw md:80vw lg:1200px"
              format="webp"
              :quality="90"
              class="max-h-[75vh] max-w-full object-contain rounded select-none"
            />
          </div>

          <!-- Caption + controls row -->
          <div class="mt-4 flex flex-col items-center gap-3 w-full max-w-2xl px-4">
            <!-- Caption -->
            <p v-if="alt" class="text-sm text-white/70 italic text-center">{{ alt }}</p>

            <!-- Download link -->
            <a
              :href="refinedSrc"
              download
              class="inline-flex items-center gap-1.5 text-xs font-bold text-white/50 hover:text-white/80 transition-colors uppercase tracking-wider"
              @click.stop
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download original
            </a>

            <!-- ESC hint (desktop) -->
            <p class="text-xs text-white/25 hidden md:block">
              Press ESC to close
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { withBase } from 'ufo'
import { useRuntimeConfig, computed, ref, onMounted, onUnmounted } from '#imports'

interface Props {
  src?: string
  alt?: string
  width?: string | number
  height?: string | number
  imgSrc?: string
  size?: 'small' | 'medium' | 'large' | 'full'
}

const props = withDefaults(defineProps<Props>(), {
  src: '',
  alt: '',
  width: undefined,
  height: undefined,
  imgSrc: '',
  size: 'medium'
})

const refinedSrc = computed(() => {
  const imageSrc = props.imgSrc || props.src
  if (imageSrc?.startsWith('/') && !imageSrc.startsWith('//')) {
    return withBase(imageSrc, useRuntimeConfig().app.baseURL)
  }
  return imageSrc
})

// Lower-res responsive sizes for inline display (thumbnails)
const responsiveSizes = computed(() => {
  switch (props.size) {
    case 'small':
      return 'xs:280px sm:320px md:350px'
    case 'medium':
      return 'xs:320px sm:480px md:600px'
    case 'large':
      return 'xs:320px sm:640px md:800px'
    case 'full':
      return 'xs:320px sm:640px md:100vw'
    default:
      return 'xs:320px sm:480px md:600px'
  }
})

// Constrain the thumbnail dimensions for proper ipx optimization
const thumbnailWidth = computed(() => {
  if (props.width) return Number(props.width)
  switch (props.size) {
    case 'small': return 400
    case 'medium': return 700
    case 'large': return 900
    case 'full': return 1200
    default: return 700
  }
})

const thumbnailHeight = computed(() => {
  if (props.height) return Number(props.height)
  return undefined
})

const isModalOpen = ref(false)

const openModal = () => {
  isModalOpen.value = true
  document.body.style.overflow = 'hidden'
}

const closeModal = () => {
  isModalOpen.value = false
  document.body.style.overflow = ''
}

const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isModalOpen.value) {
    closeModal()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
  if (isModalOpen.value) {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.prose-lightbox-overlay {
  background: rgba(0, 0, 0, 0.92);
  backdrop-filter: blur(8px);
}

/* Transition */
.prose-lightbox-enter-active {
  transition: opacity 0.25s ease;
}
.prose-lightbox-leave-active {
  transition: opacity 0.2s ease;
}
.prose-lightbox-enter-from,
.prose-lightbox-leave-to {
  opacity: 0;
}
</style>
