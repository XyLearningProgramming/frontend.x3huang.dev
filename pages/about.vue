<template>
  <div class="min-h-screen bg-neo-bg">
    <div class="mx-auto max-w-4xl px-6 py-12 md:py-16">
      <!-- Back -->
      <NuxtLink to="/" class="neo-btn inline-flex items-center gap-2 bg-neo-white px-3 py-1.5 text-sm font-bold mb-8">
        <IconsArrowLeft class="w-4 h-4" />
        Home
      </NuxtLink>

      <!-- Loading -->
      <div v-if="!allPages" class="text-center py-12">
        <div class="w-8 h-8 border-4 border-neo-black border-t-neo-yellow rounded-full animate-spin mx-auto mb-4" />
        <p class="text-neo-text-muted font-bold">Loading...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="text-center py-12">
        <div class="neo-card bg-neo-red/10 inline-block px-8 py-4 mb-4">
          <h2 class="text-xl font-bold mb-2">Error Loading Content</h2>
          <p class="text-sm text-neo-text-muted">{{ error }}</p>
        </div>
      </div>

      <!-- Not found -->
      <div v-else-if="!aboutContent" class="text-center py-12">
        <div class="neo-card bg-neo-yellow inline-block px-8 py-4 mb-4">
          <h2 class="text-xl font-bold mb-2">About Page Not Found</h2>
          <p class="text-sm text-neo-text-muted">The about page content could not be loaded.</p>
        </div>
      </div>

      <!-- About content -->
      <div v-else>
        <article>
          <header class="mb-8">
            <h1 class="mb-4">
              <span class="bg-neo-green px-3 py-1 border-2 border-neo-black inline-block -rotate-1">
                {{ aboutContent.title || 'About' }}
              </span>
            </h1>
            <p v-if="aboutContent.description" class="text-lg text-neo-text-muted">
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

          <div class="neo-card bg-neo-white p-6 md:p-10 mb-8">
            <div class="blog-content">
              <ContentRenderer :value="aboutContent" />
            </div>
          </div>
        </article>

        <!-- Comments -->
        <CommentSection
          title="About Page Comments"
          thread-id="/about"
          form-title="What do you think about this site?"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconsArrowLeft from '~/components/icons/arrowLeft.vue'
import AnalyticsDisplay from '~/components/blog/AnalyticsDisplay.vue'

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
