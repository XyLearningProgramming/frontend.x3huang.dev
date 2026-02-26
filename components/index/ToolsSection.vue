<template>
  <section id="tools" class="relative px-6 md:px-12 py-16 md:py-24 overflow-hidden">
    <div class="mx-auto max-w-6xl">
      <!-- Section heading -->
      <h2
        ref="toolsHeadingRef"
        class="tools-heading opacity-0 mb-12"
      >
        <span class="inline-block bg-dali-teal px-5 py-2 text-dali-white border-2 border-dali-white/20 -rotate-1 shadow-dali-void">
          Dev Tools
        </span>
      </h2>

      <!-- Tool cards — float in sideways during vertical scroll -->
      <div class="tools-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-6">
        <DaliIrregularCard
          v-for="(tool, idx) in tools"
          :key="tool.title"
          :ref="el => setToolCardRef(el, idx)"
          :seed="300 + idx"
          :rotation="toolRotations[idx] || 0"
          :accent-color="tool.color"
          :interactive="false"
          class="tool-card opacity-0 cursor-pointer"
          @click="navigateTo(tool.route)"
        >
          <span class="text-2xl block mb-2">{{ tool.icon }}</span>
          <h3 class="text-base font-bold mb-1 text-dali-white">{{ tool.title }}</h3>
          <p class="text-sm text-dali-muted">{{ tool.description }}</p>
        </DaliIrregularCard>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// ── Static data ──
const tools = [
  { title: 'Base64', icon: '🔐', description: 'Encode & decode Base64 strings', route: '/tools/base64', color: 'var(--color-dali-red)' },
  { title: 'JSON', icon: '📋', description: 'Format & validate JSON', route: '/tools/json', color: 'var(--color-dali-teal)' },
  { title: 'JWT', icon: '🔑', description: 'Decode JWT tokens', route: '/tools/jwt', color: 'var(--color-dali-gold)' },
]

const toolRotations = [-2, 1.5, -1]

// ── Template refs ──
const toolsHeadingRef = ref<HTMLElement | null>(null)
const toolCardRefs = ref<any[]>([])

function setToolCardRef(el: any, idx: number) {
  if (el) toolCardRefs.value[idx] = el
}

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

  if (toolsHeadingRef.value) {
    gsap.fromTo(toolsHeadingRef.value,
      { opacity: 0, x: -80 * scale, rotation: isMobile ? 0 : -3 },
      {
        opacity: 1, x: 0, rotation: 0,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: toolsHeadingRef.value,
          start: 'top 85%',
          toggleActions: ta,
        },
      },
    )
  }

  nextTick(() => {
    toolCardRefs.value.forEach((cardRef, idx) => {
      const el = cardRef?.$el || cardRef
      if (!el) return

      if (isMobile) {
        gsap.fromTo(el,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0,
            duration: 0.5,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '#tools',
              start: 'top 75%',
              toggleActions: ta,
            },
            delay: idx * 0.1,
          },
        )
      } else {
        const fromX = idx % 2 === 0 ? -200 : 200

        gsap.fromTo(el,
          { opacity: 0, x: fromX },
          {
            opacity: 1, x: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '#tools',
              start: 'top 75%',
              toggleActions: ta,
            },
            delay: idx * 0.1,
          },
        )
      }
    })
  })

})
</script>
