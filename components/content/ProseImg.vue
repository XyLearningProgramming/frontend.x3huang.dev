<template>
  <figure class="my-6 text-center">
    <div class="inline-block neo-border bg-neo-bg p-2 relative" style="box-shadow: 4px 4px 0px 0px #000;">
      <nuxt-img 
        :src="refinedSrc" 
        :alt="alt" 
        :sizes="responsiveSizes"
        format="webp"
        loading="lazy"
        class="block max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
        @click="openModal"
      />
    </div>
    <figcaption v-if="alt" class="mt-3 text-sm text-neo-black/60 italic">{{ alt }}</figcaption>    
  </figure>
  
  <!-- Modal for full-size image -->
  <teleport to="body">
    <div 
      v-if="isModalOpen"
      class="fixed inset-0 bg-neo-black/90 flex items-center justify-center z-[9999] p-4"
      @click="closeModal"
    >
      <div class="relative w-full h-full flex items-center justify-center">
        <img 
          :src="refinedSrc" 
          :alt="alt"
          class="max-w-[95vw] max-h-[95vh] object-contain neo-border"
          style="box-shadow: 8px 8px 0px 0px rgba(0,0,0,0.5);"
          @click.stop
        />
        
        <!-- Close button -->
        <button 
          @click="closeModal"
          class="absolute top-4 right-4 neo-border bg-neo-yellow text-neo-black w-12 h-12 flex items-center justify-center font-bold hover:bg-neo-orange transition-colors text-3xl"
          style="box-shadow: 4px 4px 0px 0px #000;"
          aria-label="Close modal"
        >
          ×
        </button>
        
        <!-- Instructions -->
        <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-neo-bg text-sm opacity-75">
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
      return 'sm:100vw md:75vw lg:600px'
  }
})

const isModalOpen = ref(false)

const openModal = () => {
  isModalOpen.value = true
  document.body.style.overflow = 'hidden'
}

const closeModal = () => {
  isModalOpen.value = false
  document.body.style.overflow = 'auto'
}

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
