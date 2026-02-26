<template>
  <section id="space" class="relative px-6 md:px-12 py-16 md:py-24 overflow-hidden">
    <div class="mx-auto max-w-6xl">
      <!-- Section heading -->
      <h2
        ref="spaceHeadingRef"
        class="space-heading opacity-0 mb-12"
      >
        <span class="inline-block bg-dali-violet px-5 py-2 text-dali-white border-2 border-dali-white/20 rotate-1 shadow-dali-void">
          My Digital Space
        </span>
      </h2>

      <!-- Photo Gallery — collage style -->
      <div
        ref="galleryRef"
        class="mb-12 opacity-0"
      >
        <h3 class="text-lg font-bold mb-4 text-dali-gold">Gallery</h3>
        <NeoPhotoGallery @open-lightbox="(img: GalleryImage) => emit('openGallery', img)" />
      </div>

      <!-- About & Contact cards — scattered -->
      <div class="space-cards grid grid-cols-1 md:grid-cols-2 gap-8">
        <DaliIrregularCard
          ref="aboutCardRef"
          :seed="200"
          :rotation="-2"
          accent-color="var(--color-dali-teal)"
          class="space-card opacity-0 cursor-pointer"
          @click="emit('openAbout')"
        >
          <h3 class="text-lg font-bold mb-2 text-dali-white">About Me</h3>
          <p class="text-sm text-dali-muted">
            {{ siteConfig.author.bio }}. Learn more about my background, what I do, and what drives me.
          </p>
          <span class="mt-3 text-xs font-bold text-dali-teal flex items-center gap-1">
            Read more
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </DaliIrregularCard>

        <DaliIrregularCard
          ref="contactCardRef"
          :seed="201"
          :rotation="2.5"
          accent-color="var(--color-dali-gold)"
          class="space-card opacity-0 cursor-pointer"
          @click="emit('openContact')"
        >
          <h3 class="text-lg font-bold mb-2 text-dali-white">Contact</h3>
          <p class="text-sm text-dali-muted">
            Get in touch via email, GitHub, or LinkedIn. Always happy to chat.
          </p>
          <span class="mt-3 text-xs font-bold text-dali-gold flex items-center gap-1">
            Get in touch
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </DaliIrregularCard>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { siteConfig } from '~/site.config'
import type { GalleryImage } from '~/composables/useBackgroundGallery'

const emit = defineEmits<{
  openAbout: []
  openContact: []
  openGallery: [image: GalleryImage]
}>()

// ── Template refs ──
const spaceHeadingRef = ref<HTMLElement | null>(null)
const galleryRef = ref<HTMLElement | null>(null)
const aboutCardRef = ref<any>(null)
const contactCardRef = ref<any>(null)

// ── GSAP scroll animations ──
onMounted(async () => {
  if (!import.meta.client) return
  await nextTick()

  const isMobile = window.innerWidth < 1024
  const { gsap } = await import('gsap')
  const { ScrollTrigger } = await import('gsap/ScrollTrigger')
  gsap.registerPlugin(ScrollTrigger)

  const scale = isMobile ? 0.4 : 1
  const ta = 'play none none reverse'

  if (spaceHeadingRef.value) {
    gsap.fromTo(spaceHeadingRef.value,
      { opacity: 0, x: 100 * scale, rotation: isMobile ? 0 : 3 },
      {
        opacity: 1, x: 0, rotation: 0,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: spaceHeadingRef.value,
          start: 'top 85%',
          toggleActions: ta,
        },
      },
    )
  }

  if (galleryRef.value) {
    gsap.fromTo(galleryRef.value,
      { opacity: 0, x: isMobile ? 40 : 120 },
      {
        opacity: 1, x: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: galleryRef.value,
          start: 'top 80%',
          toggleActions: ta,
        },
      },
    )
  }

  // About and Contact cards: fly in from opposite sides
  nextTick(() => {
    const aboutEl = aboutCardRef.value?.$el || aboutCardRef.value
    if (aboutEl) {
      gsap.fromTo(aboutEl,
        { opacity: 0, x: isMobile ? -40 : -120, rotation: isMobile ? 0 : -5 },
        {
          opacity: 1, x: 0, rotation: 0,
          duration: 0.7,
          ease: 'back.out(1.2)',
          scrollTrigger: {
            trigger: aboutEl,
            start: 'top 85%',
            toggleActions: ta,
          },
        },
      )
    }

    const contactEl = contactCardRef.value?.$el || contactCardRef.value
    if (contactEl) {
      gsap.fromTo(contactEl,
        { opacity: 0, x: isMobile ? 40 : 120, rotation: isMobile ? 0 : 5 },
        {
          opacity: 1, x: 0, rotation: 0,
          duration: 0.7,
          ease: 'back.out(1.2)',
          scrollTrigger: {
            trigger: contactEl,
            start: 'top 85%',
            toggleActions: ta,
          },
          delay: 0.15,
        },
      )
    }
  })
})
</script>
