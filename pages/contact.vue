<template>
  <LayoutsSubPageLayout
    title="Get In Touch"
    back-to="/#space"
    back-label="Home"
    max-width="default"
  >
    <template #header>
      <p class="text-lg text-dali-muted">
        Feel free to reach out for collaborations, questions, or just to say hello!
      </p>
    </template>

    <!-- Contact cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
      <!-- Email -->
      <a
        :href="`mailto:${siteConfig.social.email}`"
        class="block p-5 border-2 border-dali-white/20 bg-dali-white/5 text-center hover:border-dali-red transition-colors"
      >
        <div class="text-4xl mb-3">📧</div>
        <h3 class="text-lg font-bold mb-1 text-dali-white">Email</h3>
        <p class="text-sm text-dali-white/60">{{ siteConfig.social.email }}</p>
        <div class="mt-3 pt-3 border-t border-dali-white/10">
          <VisitCounter path="/contact/email" singular-text="person said hello" plural-text="people said hello" />
        </div>
      </a>

      <!-- GitHub -->
      <a
        :href="siteConfig.social.github"
        target="_blank"
        rel="noopener noreferrer"
        class="block p-5 border-2 border-dali-white/20 bg-dali-white/5 text-center hover:border-dali-teal transition-colors"
      >
        <div class="text-4xl mb-3">💻</div>
        <h3 class="text-lg font-bold mb-1 text-dali-white">GitHub</h3>
        <p class="text-sm text-dali-white/60">{{ siteConfig.social.github?.split('/').pop() }}</p>
        <div class="mt-3 pt-3 border-t border-dali-white/10">
          <VisitCounter path="/contact/github" singular-text="person explored my code" plural-text="people explored my code" />
        </div>
      </a>

      <!-- LinkedIn -->
      <a
        :href="siteConfig.social.linkedin"
        target="_blank"
        rel="noopener noreferrer"
        class="block p-5 border-2 border-dali-white/20 bg-dali-white/5 text-center hover:border-dali-gold transition-colors"
      >
        <div class="text-4xl mb-3">💼</div>
        <h3 class="text-lg font-bold mb-1 text-dali-white">LinkedIn</h3>
        <p class="text-sm text-dali-white/60">{{ siteConfig.social.linkedin?.split('/').slice(-2).join('/') }}</p>
        <div class="mt-3 pt-3 border-t border-dali-white/10">
          <VisitCounter path="/contact/linkedin" singular-text="person connected" plural-text="people connected" />
        </div>
      </a>

      <!-- Resume -->
      <a
        :href="resumePath"
        target="_blank"
        rel="noopener noreferrer"
        class="block p-5 border-2 border-dali-white/20 bg-dali-white/5 text-center hover:border-dali-violet transition-colors"
      >
        <div class="text-4xl mb-3">📄</div>
        <h3 class="text-lg font-bold mb-1 text-dali-white">Resume</h3>
        <p class="text-sm text-dali-white/60">Download CV</p>
        <div class="mt-3 pt-3 border-t border-dali-white/10">
          <VisitCounter path="/contact/resume" singular-text="person requested my resume" plural-text="people requested my resume" />
        </div>
      </a>
    </div>

    <!-- Comments Section -->
    <CommentSection title="Contact & Messages" thread-id="/contact" form-title="Leave me a note" />
  </LayoutsSubPageLayout>
</template>

<script setup lang="ts">
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
