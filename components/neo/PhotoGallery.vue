<script setup lang="ts">
import { usePageTransition } from '~/composables/usePageTransition'

const { images } = usePhotoGallery()
const { transitionTo } = usePageTransition()

function handleClick(index: number) {
  transitionTo(`/gallery?img=${index}`, { sectionId: 'space' })
}

// GSAP entrance animation (replaces v-motion which breaks SSR)
const galleryRef = ref<HTMLElement | null>(null)

onMounted(async () => {
  if (!galleryRef.value) return
  const { gsap } = await import('gsap')
  const { ScrollTrigger } = await import('gsap/ScrollTrigger')
  gsap.registerPlugin(ScrollTrigger)

  const cards = galleryRef.value.querySelectorAll('.card-gallery')
  cards.forEach((card, index) => {
    gsap.fromTo(card,
      { opacity: 0, scale: 0.9, x: 40 },
      {
        opacity: 1, scale: 1, x: 0,
        duration: 0.6,
        ease: 'back.out(1.4)',
        scrollTrigger: {
          trigger: card,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
        delay: index * 0.08,
      },
    )
  })
})
</script>

<template>
  <div class="relative">
    <!-- Horizontal scroll gallery -->
    <div
      ref="galleryRef"
      class="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth"
      style="scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.15) transparent;"
    >
      <div
        v-for="(image, index) in images"
        :key="index"
        class="dali-card flex-shrink-0 w-72 md:w-80 cursor-pointer overflow-hidden snap-center card-gallery opacity-0"
        style="border-color: var(--color-dali-muted);"
        @click="handleClick(index)"
      >
        <ClientOnly>
          <NuxtImg
            :src="image.url"
            :alt="image.alt || image.title || 'Gallery image'"
            class="w-full h-48 object-cover"
            loading="lazy"
          />
          <template #fallback>
            <div class="w-full h-48 bg-dali-smoke animate-pulse" />
          </template>
        </ClientOnly>
        <div v-if="image.title || image.note" class="p-3 border-t border-dali-muted/30">
          <p v-if="image.title" class="font-bold text-sm text-dali-white">{{ image.title }}</p>
          <p v-if="image.note" class="text-xs text-dali-muted mt-1 italic">{{ image.note }}</p>
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
  box-shadow: var(--shadow-dali-void-lg);
}
.card-gallery:active {
  transform: translate(0, 0);
  box-shadow: var(--shadow-dali-void-sm);
}
</style>
