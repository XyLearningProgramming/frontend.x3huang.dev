<template>
  <section id="footer" class="relative px-6 md:px-12 py-12">
    <!-- Red diagonal slash accent -->
    <div class="absolute top-0 right-0 w-1/3 h-full overflow-hidden pointer-events-none" aria-hidden="true">
      <div class="absolute inset-0 bg-dali-red/5 -skew-x-12 origin-top-right" />
    </div>

    <div
      ref="footerRef"
      class="mx-auto max-w-6xl text-center relative z-10 opacity-0"
    >
      <h2 class="flow-text mb-4">
        <span class="text-lg font-bold">{{ siteConfig.name }}</span>
      </h2>
      <div class="flex justify-center gap-4 mb-6">
        <a
          v-if="siteConfig.social.github"
          :href="siteConfig.social.github"
          target="_blank"
          rel="noopener noreferrer"
          class="dali-btn px-4 py-2 text-sm"
        >
          GitHub
        </a>
        <a
          v-if="siteConfig.social.linkedin"
          :href="siteConfig.social.linkedin"
          target="_blank"
          rel="noopener noreferrer"
          class="dali-btn px-4 py-2 text-sm"
        >
          LinkedIn
        </a>
        <a
          v-if="siteConfig.social.email"
          :href="`mailto:${siteConfig.social.email}`"
          class="dali-btn px-4 py-2 text-sm"
        >
          Email
        </a>
      </div>
      <p class="text-sm flow-muted">
        Built with Nuxt, Vue, and Nuxt Content.
      </p>
      <p class="text-xs flow-muted opacity-60 mt-1">
        &copy; {{ new Date().getFullYear() }} {{ siteConfig.author.name }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { siteConfig } from '~/site.config'

// ── Template ref ──
const footerRef = ref<HTMLElement | null>(null)

// ── GSAP scroll animation ──
onMounted(async () => {
  if (!import.meta.client) return
  await nextTick()

  const { gsap } = await import('gsap')
  const { ScrollTrigger } = await import('gsap/ScrollTrigger')
  gsap.registerPlugin(ScrollTrigger)

  if (footerRef.value) {
    gsap.fromTo(footerRef.value,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0,
        duration: 0.6,
        scrollTrigger: {
          trigger: footerRef.value,
          start: 'top 90%',
          toggleActions: 'play none none reverse',
        },
      },
    )
  }
})
</script>
