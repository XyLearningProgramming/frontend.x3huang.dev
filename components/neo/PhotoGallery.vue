<script setup lang="ts">
const { images } = usePhotoGallery()

const emit = defineEmits<{
  open: [index: number]
}>()

// ── Scroll state ──
const scrollRef = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

function updateScrollState() {
  const el = scrollRef.value
  if (!el) return
  canScrollLeft.value = el.scrollLeft > 4
  canScrollRight.value = el.scrollLeft < el.scrollWidth - el.clientWidth - 4
}

function scrollBy(direction: -1 | 1) {
  const el = scrollRef.value
  if (!el) return
  // Scroll by roughly one card width (320px) + gap (24px)
  el.scrollBy({ left: direction * 344, behavior: 'smooth' })
}

const showButtons = computed(() => images.length > 1)

onMounted(() => {
  updateScrollState()
  // Re-check on resize (e.g. if the container width changes)
  if (import.meta.client) {
    window.addEventListener('resize', updateScrollState)
  }
})

onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener('resize', updateScrollState)
  }
})

// ── GSAP entrance animation ──
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
  <div ref="galleryRef" class="relative group/gallery">
    <!-- Horizontal scroll strip -->
    <div
      ref="scrollRef"
      class="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth gallery-scrollbar"
      @scroll="updateScrollState"
    >
      <div
        v-for="(image, index) in images"
        :key="index"
        class="dali-card flex-shrink-0 w-72 md:w-80 cursor-pointer overflow-hidden snap-center card-gallery opacity-0"
        style="border-color: var(--color-dali-muted);"
        @click="emit('open', index)"
      >
        <ClientOnly>
          <NuxtImg
            :src="image.url"
            :alt="image.alt || image.title || 'Gallery image'"
            :width="400"
            :height="260"
            fit="cover"
            sizes="xs:280px sm:320px"
            format="webp"
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

    <!-- Left scroll button (desktop only, hidden at start) -->
    <button
      v-if="showButtons && canScrollLeft"
      class="gallery-nav-btn left-0 hidden lg:flex"
      aria-label="Scroll gallery left"
      @click="scrollBy(-1)"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>

    <!-- Right scroll button (desktop only, hidden at end) -->
    <button
      v-if="showButtons && canScrollRight"
      class="gallery-nav-btn right-0 hidden lg:flex"
      aria-label="Scroll gallery right"
      @click="scrollBy(1)"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.gallery-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.15) transparent;
}

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

/* Navigation arrow buttons */
.gallery-nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(107, 107, 123, 0.5);
  color: rgba(240, 237, 229, 0.8);
  border: 1px solid rgba(240, 237, 229, 0.15);
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
  z-index: 10;
  backdrop-filter: blur(4px);
}
.gallery-nav-btn:hover {
  background: rgba(107, 107, 123, 0.75);
  color: rgba(240, 237, 229, 1);
}
.gallery-nav-btn:active {
  background: rgba(107, 107, 123, 0.9);
}
</style>
