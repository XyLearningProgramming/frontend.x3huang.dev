<template>
  <LayoutsSubPageLayout
    :title="aboutContent?.title || 'About'"
    :back-to="backTo"
    :back-label="backLabel"
    max-width="default"
  >
    <!-- Loading -->
    <div v-if="!allPages" class="text-center py-12">
      <div class="w-8 h-8 border-4 border-dali-red border-t-dali-gold rounded-full animate-spin mx-auto mb-4" />
      <p class="text-dali-muted font-bold">Loading...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-12">
      <div class="dali-card inline-block px-8 py-4 mb-4" style="border-color: var(--color-dali-red);">
        <h2 class="text-xl font-bold mb-2 text-dali-white">Error Loading Content</h2>
        <p class="text-sm text-dali-muted">{{ error }}</p>
      </div>
    </div>

    <!-- Not found -->
    <div v-else-if="!aboutContent" class="text-center py-12">
      <div class="dali-card inline-block px-8 py-4 mb-4" style="border-color: var(--color-dali-gold);">
        <h2 class="text-xl font-bold mb-2 text-dali-white">About Page Not Found</h2>
        <p class="text-sm text-dali-muted">The about page content could not be loaded.</p>
      </div>
    </div>

    <!-- About content -->
    <div v-else>
      <article>
        <header class="mb-8">
          <p v-if="aboutContent.description" class="text-lg text-dali-muted">
            {{ aboutContent.description }}
          </p>
          <div class="mt-4">
            <AnalyticsDisplay
              slug="about"
              :analytics="analytics"
              :loading="analyticsLoading"
              :show-shares="false"
            />
          </div>
        </header>

        <div class="blog-content mb-8">
          <ContentRenderer :value="aboutContent" />
        </div>
      </article>

      <!-- Comments -->
      <CommentSection
        title="About Page Comments"
        thread-id="/about"
        form-title="What do you think about this site?"
      />
    </div>
  </LayoutsSubPageLayout>
</template>

<script setup lang="ts">
import AnalyticsDisplay from '~/components/blog/AnalyticsDisplay.vue'

// ── Smart back navigation ──
// If the user arrived from a sub-page (e.g. a blog post), go back there.
// Otherwise, fall back to the home page space section.
const backTo = computed(() => {
  if (!import.meta.client) return '/#space'
  const prev = window.history.state?.back as string | undefined
  if (prev && prev !== '/' && !prev.startsWith('/#') && !prev.startsWith('/?')) return prev
  return '/#space'
})

const backLabel = computed(() => {
  const to = backTo.value
  if (to === '/' || to.startsWith('/#') || to.startsWith('/?')) return 'Home'
  if (to.startsWith('/posts/')) return 'Post'
  return 'Back'
})

const { data: allPages, error } = await useAsyncData('all-pages', () =>
  queryCollection('pages').all(),
)

const aboutContent = computed(() => {
  if (!allPages.value) return null
  return allPages.value.find((page: any) => page.path === '/pages/about')
})

const analytics = ref({ visits: 0, likes: 0, shares: 0 })
const analyticsLoading = ref(true)

onMounted(async () => {
  if (!import.meta.client) return
  try {
    const { initializeTracking, trackVisit, getBlogAnalytics } = useGoatCounter()
    initializeTracking()
    trackVisit('/about')
    analytics.value = await getBlogAnalytics('about')
  }
  catch (error) {
    console.warn('Failed to load analytics for about page:', error)
  }
  finally {
    analyticsLoading.value = false
  }
})

useHead({
  title: computed(() => aboutContent.value ? `${(aboutContent.value as any).title} - Xinyu Huang` : 'About - Xinyu Huang'),
  meta: [
    { name: 'description', content: computed(() => (aboutContent.value as any)?.description || 'Learn more about Xinyu Huang and this blog') },
  ],
})
</script>
