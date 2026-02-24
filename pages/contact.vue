<template>
  <div class="min-h-screen bg-neo-bg">
    <div class="mx-auto max-w-5xl px-6 py-12 md:py-16">
      <!-- Back -->
      <NuxtLink to="/" class="neo-btn inline-flex items-center gap-2 bg-neo-white px-3 py-1.5 text-sm font-bold mb-8">
        <IconsArrowLeft class="w-4 h-4" />
        Home
      </NuxtLink>

      <!-- Header -->
      <div class="mb-8">
        <h1 class="mb-2">
          <span class="bg-neo-pink px-3 py-1 border-2 border-neo-black inline-block rotate-1">
            Get In Touch
          </span>
        </h1>
        <p class="text-lg text-neo-text-muted">
          Feel free to reach out for collaborations, questions, or just to say hello!
        </p>
      </div>

      <!-- Contact cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <!-- Email -->
        <a :href="`mailto:${siteConfig.social.email}`" class="neo-card bg-neo-white p-5 text-center">
          <div class="text-4xl mb-3">📧</div>
          <h3 class="text-lg font-bold mb-1">Email</h3>
          <p class="text-sm text-neo-text-muted">{{ siteConfig.social.email }}</p>
          <div class="mt-3 pt-3 border-t-2 border-neo-black">
            <VisitCounter path="/contact/email" singular-text="person said hello" plural-text="people said hello" />
          </div>
        </a>

        <!-- GitHub -->
        <a :href="siteConfig.social.github" target="_blank" rel="noopener noreferrer" class="neo-card bg-neo-white p-5 text-center">
          <div class="text-4xl mb-3">💻</div>
          <h3 class="text-lg font-bold mb-1">GitHub</h3>
          <p class="text-sm text-neo-text-muted">{{ siteConfig.social.github?.split('/').pop() }}</p>
          <div class="mt-3 pt-3 border-t-2 border-neo-black">
            <VisitCounter path="/contact/github" singular-text="person explored my code" plural-text="people explored my code" />
          </div>
        </a>

        <!-- LinkedIn -->
        <a :href="siteConfig.social.linkedin" target="_blank" rel="noopener noreferrer" class="neo-card bg-neo-white p-5 text-center">
          <div class="text-4xl mb-3">💼</div>
          <h3 class="text-lg font-bold mb-1">LinkedIn</h3>
          <p class="text-sm text-neo-text-muted">{{ siteConfig.social.linkedin?.split('/').slice(-2).join('/') }}</p>
          <div class="mt-3 pt-3 border-t-2 border-neo-black">
            <VisitCounter path="/contact/linkedin" singular-text="person connected" plural-text="people connected" />
          </div>
        </a>

        <!-- Resume -->
        <a :href="resumePath" target="_blank" rel="noopener noreferrer" class="neo-card bg-neo-white p-5 text-center">
          <div class="text-4xl mb-3">📄</div>
          <h3 class="text-lg font-bold mb-1">Resume</h3>
          <p class="text-sm text-neo-text-muted">Download CV</p>
          <div class="mt-3 pt-3 border-t-2 border-neo-black">
            <VisitCounter path="/contact/resume" singular-text="person requested my resume" plural-text="people requested my resume" />
          </div>
        </a>
      </div>

      <!-- Comments Section -->
      <CommentSection title="Contact & Messages" thread-id="/contact" form-title="Leave me a note" />
    </div>
  </div>
</template>

<script setup lang="ts">
import IconsArrowLeft from '~/components/icons/arrowLeft.vue'
import VisitCounter from '~/components/ui/VisitCounter.vue'
import { siteConfig, getPageMeta } from '~/site.config'

const resumePath = '/resume/20260111.pdf'

onMounted(() => {
  if (!import.meta.client) return
  const { initializeTracking, trackVisit } = useGoatCounter()
  initializeTracking()
  trackVisit('/contact')
})

useHead(getPageMeta({
  title: 'Contact',
  description: `Get in touch with ${siteConfig.author.name}. Reach out for collaborations, questions, or just to say hello!`,
}))
</script>
