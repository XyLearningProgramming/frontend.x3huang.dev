<template>
  <BackgroundLayout container-width="normal" overlay-intensity="heavy" blur-background>
    <PageHeader title="Get In Touch"
      description="Feel free to reach out for collaborations, questions, or just to say hello!" />

    <!-- Contact cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      <!-- Email -->
      <a :href="`mailto:${siteConfig.social.email}`" class="block group">
        <GlassCard variant="primary" padding="md" radius="lg" hover clickable class="text-center h-full">
          <div class="text-glass">
            <div class="text-4xl mb-4">📧</div>
            <h3 class="text-xl font-semibold mb-2">
              Email
            </h3>
            <p class="text-glass-muted">
              {{ siteConfig.social.email }}
            </p>
            <!-- Email counter -->
            <div class="mt-3 pt-3 border-t border-white/20 text-center">
              <VisitCounter path="/contact/email" singular-text="person said hello" plural-text="people said hello" />
            </div>
          </div>
        </GlassCard>
      </a>

      <!-- GitHub -->
      <a :href="siteConfig.social.github" target="_blank" rel="noopener noreferrer" class="block group">
        <GlassCard variant="primary" padding="md" radius="lg" hover clickable class="text-center h-full">
          <div class="text-glass">
            <div class="text-4xl mb-4">💻</div>
            <h3 class="text-xl font-semibold mb-2">
              GitHub
            </h3>
            <p class="text-glass-muted text-sm">
              {{ siteConfig.social.github?.split('/').pop() }}
            </p>
            <!-- GitHub counter -->
            <div class="mt-3 pt-3 border-t border-white/20 text-center">
              <VisitCounter path="/contact/github" singular-text="person explored my code"
                plural-text="people explored my code" />
            </div>
          </div>
        </GlassCard>
      </a>

      <!-- LinkedIn -->
      <a :href="siteConfig.social.linkedin" target="_blank" rel="noopener noreferrer" class="block group">
        <GlassCard variant="primary" padding="md" radius="lg" hover clickable class="text-center h-full">
          <div class="text-glass">
            <div class="text-4xl mb-4">💼</div>
            <h3 class="text-xl font-semibold mb-2">
              LinkedIn
            </h3>
            <p class="text-glass-muted">
              {{ siteConfig.social.linkedin?.split('/').slice(-2).join('/') }}
            </p>
            <!-- LinkedIn counter -->
            <div class="mt-3 pt-3 border-t border-white/20 text-center">
              <VisitCounter path="/contact/linkedin" singular-text="person connected professionally"
                plural-text="people connected professionally" />
            </div>
          </div>
        </GlassCard>
      </a>

      <!-- Resume -->
      <a :href="resumePath" target="_blank" rel="noopener noreferrer" class="block group">
        <GlassCard variant="primary" padding="md" radius="lg" hover clickable class="text-center h-full">
          <div class="text-glass">
            <div class="text-4xl mb-4">📄</div>
            <h3 class="text-xl font-semibold mb-2">
              Resume
            </h3>
            <p class="text-glass-muted">
              Download CV
            </p>
            <!-- Resume counter -->
            <div class="mt-3 pt-3 border-t border-white/20 text-center">
              <VisitCounter path="/contact/resume" singular-text="person requested my resume"
                plural-text="people requested my resume" />
            </div>
          </div>
        </GlassCard>
      </a>
    </div>

    <!-- Comments Section -->
    <CommentSection 
      title="Contact & Messages"
      thread-id="/contact"
      form-title="Leave me a note"
    />

    <!-- Back navigation -->
    <div class="text-center mt-8">
      <NuxtLink to="/" class="inline-flex items-center gap-2 text-glass hover:text-glass-muted transition-colors">
        <IconsArrowLeft class="w-4 h-4" />
        Back to Home
      </NuxtLink>
    </div>
  </BackgroundLayout>
</template>

<script setup lang="ts">
import GlassCard from '~/components/ui/GlassCard.vue'
import BackgroundLayout from '~/components/layouts/BackgroundLayout.vue'
import PageHeader from '~/components/ui/PageHeader.vue'
import IconsArrowLeft from '~/components/icons/arrowLeft.vue'
import VisitCounter from '~/components/ui/VisitCounter.vue'
import { siteConfig, getPageMeta } from '~/site.config'

const resumePath = "/resume/20250703.pdf"

// Initialize tracking
onMounted(() => {
  if (!import.meta.client) return

  const { initializeTracking, trackVisit } = useGoatCounter()
  initializeTracking()
  trackVisit('/contact')
})

useHead(getPageMeta({
  title: 'Contact',
  description: `Get in touch with ${siteConfig.author.name}. Reach out for collaborations, questions, or just to say hello!`
}))
</script>