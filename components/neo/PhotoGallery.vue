<script setup lang="ts">
import type { GalleryImage } from '~/composables/useBackgroundGallery'

const { images } = usePhotoGallery()

const emit = defineEmits<{
  'open-lightbox': [image: GalleryImage]
}>()

function handleClick(image: GalleryImage) {
  emit('open-lightbox', image)
}
</script>

<template>
  <div class="relative">
    <!-- Horizontal scroll gallery -->
    <div
      class="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth"
      style="scrollbar-width: thin; scrollbar-color: rgba(0,0,0,0.2) transparent;"
    >
      <div
        v-for="(image, index) in images"
        :key="index"
        v-motion
        :initial="{ opacity: 0, scale: 0.9, x: 40 }"
        :visibleOnce="{
          opacity: 1, scale: 1, x: 0,
          transition: { type: 'spring', stiffness: 120, damping: 14, delay: index * 100 },
        }"
        class="neo-card flex-shrink-0 w-72 md:w-80 cursor-pointer overflow-hidden snap-center card-gallery"
        @click="handleClick(image)"
      >
        <NuxtImg
          :src="image.url"
          :alt="image.alt || image.title || 'Gallery image'"
          class="w-full h-48 object-cover"
          loading="lazy"
        />
        <div v-if="image.title || image.note" class="p-3 border-t-2 border-neo-black">
          <p v-if="image.title" class="font-bold text-sm">{{ image.title }}</p>
          <p v-if="image.note" class="text-xs text-neo-text-muted mt-1 italic">{{ image.note }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-gallery {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.card-gallery:hover {
  transform: translate(-2px, -2px) rotate(-0.5deg);
  box-shadow: var(--shadow-neo-lg);
}
.card-gallery:active {
  transform: translate(0, 0);
  box-shadow: var(--shadow-neo-sm);
}
</style>
