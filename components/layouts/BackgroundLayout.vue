<template>
  <div
    class="min-h-screen bg-gradient-to-br from-light-accent/20 to-dark-accent/20 dark:from-dark-accent/30 dark:to-light-accent/30 relative"
    :class="backgroundClass">
    
    <!-- Background image with blur for blog pages -->
    <div 
      v-if="currentBackground && blurBackground"
      class="fixed inset-0 bg-blur">
      <NuxtImg
        :src="currentBackground.url"
        :alt="currentBackground.title || 'Background'"
        class="w-full h-full object-cover"
        quality="60"
        format="webp"
        loading="eager"
        width="1920"
        height="1080"
      />
    </div>
    
    <!-- Background image without blur for other pages -->
    <div 
      v-else-if="currentBackground && !blurBackground"
      class="absolute inset-0">
      <NuxtImg
        :src="currentBackground.url"
        :alt="currentBackground.title || 'Background'"
        class="w-full h-full object-cover"
        quality="75"
        format="webp"
        loading="eager"
        width="1920"
        height="1080"
      />
    </div>
    
    <!-- Background overlay -->
    <div :class="overlayClass"></div>
    
    <!-- Photo notes -->
    <div v-if="showPhotoNote && currentBackground?.note" class="absolute bottom-4 left-4 md:left-6 md:max-w-md">
      <div class="bg-black/30 backdrop-blur-sm rounded-lg p-3 text-white border border-white/20">
        <h4 v-if="currentBackground.title" class="font-medium text-sm mb-1">{{ currentBackground.title }}</h4>
        <p class="text-xs text-white/90">{{ currentBackground.note }}</p>
      </div>
    </div>
    
    <!-- Main content -->
    <div class="relative z-10 min-h-screen">
      <div :class="containerClass">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  showPhotoNote?: boolean
  containerWidth?: 'normal' | 'wide' | 'full'
  overlayIntensity?: 'light' | 'medium' | 'heavy'
  blurBackground?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showPhotoNote: false,
  containerWidth: 'normal',
  overlayIntensity: 'medium',
  blurBackground: false
})

const { currentBackground, initializeBackground } = useBackgroundGallery()

onMounted(() => {
  initializeBackground()
})

const backgroundClass = computed(() => {
  return props.blurBackground ? '' : 'bg-cover bg-center bg-no-repeat'
})

const overlayClass = computed(() => {
  const base = props.blurBackground ? 'fixed inset-0' : 'absolute inset-0'
  switch (props.overlayIntensity) {
    case 'light': return `${base} bg-black/10 dark:bg-black/20`
    case 'heavy': return `${base} bg-black/40 dark:bg-black/60`
    default: return `${base} bg-black/20 dark:bg-black/40`
  }
})

const containerClass = computed(() => {
  const base = 'mx-auto py-8 px-8'
  switch (props.containerWidth) {
    case 'wide': return `${base} max-w-6xl`
    case 'full': return `${base} max-w-full`
    default: return `${base} max-w-4xl`
  }
})
</script>

<style scoped>
.bg-blur {
  filter: blur(8px);
  transform: scale(1.1);
}
</style>