<template>
  <div class="min-h-screen bg-neo-bg">
    <div class="mx-auto max-w-5xl px-6 py-12 md:py-16">
      <!-- Back button -->
      <NuxtLink
        :to="returnPath"
        class="neo-btn inline-flex items-center gap-2 bg-neo-white px-3 py-1.5 text-sm font-bold mb-8"
      >
        <IconsArrowLeft class="w-4 h-4" />
        Back to {{ returnTitle }}
      </NuxtLink>

      <!-- Post content -->
      <article v-if="post">
        <header class="mb-8">
          <h1 class="text-3xl md:text-4xl font-bold mb-4">
            {{ post.title }}
          </h1>

          <div class="flex flex-wrap items-center gap-4 text-sm text-neo-text-muted mb-4">
            <time>{{ formatDate(post.date) }}</time>
            <span v-if="post.author">by {{ post.author }}</span>
            <span v-if="post.readTime">{{ post.readTime }} min read</span>
          </div>

          <!-- Analytics -->
          <AnalyticsDisplay
            :slug="slug"
            :analytics="analytics"
            :loading="analyticsLoading"
          />

          <!-- Tags -->
          <div v-if="post.tags && post.tags.length" class="flex flex-wrap gap-2 mt-4">
            <span
              v-for="tag in post.tags"
              :key="tag"
              class="text-[10px] font-bold px-2 py-0.5 bg-neo-yellow/40 border border-neo-black"
            >
              {{ tag }}
            </span>
          </div>
        </header>

        <!-- Article body in a neo card -->
        <div class="neo-card bg-neo-white p-6 md:p-10 mb-8">
          <div class="blog-content">
            <ClientOnly>
              <ContentRenderer :value="post" />
              <template #fallback>
                <div class="animate-pulse space-y-4">
                  <div class="h-4 bg-neo-bg rounded w-full" />
                  <div class="h-4 bg-neo-bg rounded w-full" />
                  <div class="h-4 bg-neo-bg rounded w-3/4" />
                </div>
              </template>
            </ClientOnly>
          </div>
        </div>
      </article>

      <!-- Loading state -->
      <div v-else class="text-center py-12">
        <div class="neo-card inline-block bg-neo-white px-8 py-4">
          <p class="text-neo-text-muted font-bold">Loading post...</p>
        </div>
      </div>

      <!-- Comments -->
      <CommentSection
        v-if="post"
        :title="post.title"
        :thread-id="`/blogs/${slug}`"
      />

      <!-- Floating action buttons -->
      <div v-if="post" class="fixed right-4 bottom-4 flex flex-col gap-2 z-50">
        <NavScrollTopIcon />
        <div class="neo-card bg-neo-white p-2">
          <NavShareIcons
            :headline="post.title"
            :description="post.description || 'Check out this blog post'"
            :path="route.fullPath"
            :image="post.image?.src || ''"
            :slug="slug"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AnalyticsDisplay from '~/components/blog/AnalyticsDisplay.vue'
import IconsArrowLeft from '~/components/icons/arrowLeft.vue'
import { siteConfig, getPageMeta, getBlogPageTitle } from '~/site.config'

const route = useRoute()
const slug = route.params.slug as string
const { initializeTracking, trackVisit, getBlogAnalytics } = useGoatCounter()

// Analytics state
const analytics = ref({ visits: 0, likes: 0, shares: 0 })
const analyticsLoading = ref(true)

// Back navigation
const returnPath = ref('/blogs')
const returnTitle = ref('Latest Posts')

// Slug helper
const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// Fetch post
const { data: post } = await useAsyncData(`blog-${slug}`, async () => {
  const allPosts = await queryCollection('blogs').all()
  return allPosts.find((p) => generateSlug(p.title || 'missing-title') === slug) || null
})

if (!post.value) {
  throw createError({ statusCode: 404, statusMessage: 'Post not found' })
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

onMounted(async () => {
  if (import.meta.client) {
    initializeTracking()
    trackVisit(`/blogs/${slug}`)
    try {
      analytics.value = await getBlogAnalytics(slug)
    }
    catch (error) {
      console.warn('Failed to load analytics:', error)
    }
    finally {
      analyticsLoading.value = false
    }
  }
})

// SEO
useHead(computed(() => getPageMeta({
  title: getBlogPageTitle(post.value?.title),
  description: post.value?.description || 'Blog post content',
  url: `${siteConfig.url}${route.fullPath}`,
  image: post.value?.image?.src ? `${siteConfig.url}${post.value.image.src}` : undefined,
  type: 'article',
})))
</script>
