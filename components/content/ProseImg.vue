<template>
    <figure class="glass-figure">
        <div class="image-container">
            <nuxt-img 
                :src="refinedSrc" 
                :alt="alt" 
                :sizes="responsiveSizes"
                format="webp"
                loading="lazy"
                class="glass-image cursor-pointer hover:opacity-90 transition-opacity"
                @click="openModal"
            />
        </div>
        <figcaption v-if="alt" class="glass-caption">{{ alt }}</figcaption>    
    </figure>
    
    <!-- Modal for full-size image -->
    <teleport to="body">
        <div 
            v-if="isModalOpen"
            class="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[9999] p-4"
            @click="closeModal"
        >
            <div class="relative w-full h-full flex items-center justify-center">
                <!-- Original image -->
                <img 
                    :src="refinedSrc" 
                    :alt="alt"
                    class="max-w-[95vw] max-h-[95vh] object-contain shadow-2xl"
                    @click.stop
                />
                
                <!-- Close button -->
                <button 
                    @click="closeModal"
                    class="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 bg-black bg-opacity-60 rounded-full w-12 h-12 flex items-center justify-center font-bold transition-all hover:scale-110"
                    aria-label="Close modal"
                >
                    ×
                </button>
                
                <!-- Instructions -->
                <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm opacity-75">
                    Click anywhere to close or press ESC
                </div>
            </div>
        </div>
    </teleport>
</template>

<script setup lang="ts">
import { withBase } from 'ufo'
import { useRuntimeConfig, computed, ref, onMounted, onUnmounted } from '#imports'

interface Props {
  // Backward compatibility props
  src?: string
  alt?: string
  width?: string | number
  height?: string | number
  // New props from Image component
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
  // Support both src and imgSrc props for compatibility
  const imageSrc = props.imgSrc || props.src
  if (imageSrc?.startsWith('/') && !imageSrc.startsWith('//')) {
    return withBase(imageSrc, useRuntimeConfig().app.baseURL)
  }
  return imageSrc
})

// Responsive sizes based on size prop for nuxt-img
const responsiveSizes = computed(() => {
  switch (props.size) {
    case 'small':
      return 'sm:100vw md:50vw lg:350px'
    case 'medium':
      return 'sm:100vw md:75vw lg:600px'
    case 'large':
      return 'sm:100vw md:100vw lg:800px'
    case 'full':
      return '100vw'
    default:
      return 'sm:100vw md:75vw lg:600px' // default medium
  }
})

const imageStyle = computed(() => {
  const styles: Record<string, string> = {}
  
  // Apply max-width constraints to work with nuxt-img
  switch (props.size) {
    case 'small':
      styles.maxWidth = '350px'
      break
    case 'medium':
      styles.maxWidth = '600px'
      break
    case 'large':
      styles.maxWidth = '800px'
      break
    case 'full':
      styles.maxWidth = '100%'
      break
    default:
      styles.maxWidth = '600px' // default medium
  }
  
  styles.width = '100%'
  styles.height = 'auto'
  
  return styles
})

const isModalOpen = ref(false)

const openModal = () => {
  isModalOpen.value = true
  // Prevent body scroll when modal is open
  document.body.style.overflow = 'hidden'
}

const closeModal = () => {
  isModalOpen.value = false
  // Restore body scroll when modal is closed
  document.body.style.overflow = 'auto'
}

// Close modal on escape key
onMounted(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isModalOpen.value) {
      closeModal()
    }
  }
  document.addEventListener('keydown', handleEscape)
  
  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape)
  })
})
</script>

<style scoped>
.glass-figure {
    margin: 1.5rem 0;
    text-align: center;
}

.image-container {
    position: relative;
    display: inline-block;
    border-radius: 0.75rem;
    overflow: hidden;
    background-color: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    padding: 0.5rem;
}

.glass-image {
    display: block;
    max-width: 100%;
    height: auto;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.glass-caption {
    margin-top: 0.75rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: rgba(255, 255, 255, 0.75);
    font-style: italic;
    text-align: center;
}
</style>
