<template>
  <BackgroundLayout blur-background overlay-intensity="heavy">
    <!-- Back button -->
    <NuxtLink :to="returnPath"
      class="inline-flex items-center gap-2 text-glass hover:text-glass-muted transition-colors mb-8">
      <IconsArrowLeft class="w-4 h-4" />
      Back to {{ returnTitle }}
    </NuxtLink>

    <!-- Post content -->
    <article v-if="post" class="prose prose-lg max-w-none">
      <header class="mb-8 text-center">
        <h1 class="text-4xl font-bold text-glass mb-4 text-shadow-strong">
          {{ post.title }}
        </h1>

        <div class="relative mb-6">
          <div class="absolute inset-0 bg-black/20 rounded-2xl blur-xl"></div>
          <div class="relative flex items-center justify-center gap-4 text-sm text-glass-muted px-6 py-4">
            <time>{{ formatDate(post.date) }}</time>
            <span v-if="post.author">by {{ post.author }}</span>
            <span v-if="post.readTime">{{ post.readTime }} min read</span>
          </div>
        </div>

        <div v-if="post.tags && post.tags.length" class="flex flex-wrap gap-2 justify-center mb-6">
          <span v-for="tag in post.tags" :key="tag"
            class="px-3 py-1 text-xs glass-secondary rounded-full text-glass-muted">
            {{ tag }}
          </span>
        </div>
      </header>

      <GlassCard variant="primary" padding="lg" radius="lg" class="mb-8">
        <div class="text-white prose-white">
          <ClientOnly>
            <ContentRenderer :value="post" />
            <template #fallback>
              <div class="animate-pulse">
                <div class="h-4 bg-white/20 rounded mb-4"></div>
                <div class="h-4 bg-white/20 rounded mb-4"></div>
                <div class="h-4 bg-white/20 rounded mb-4 w-3/4"></div>
              </div>
            </template>
          </ClientOnly>
        </div>
      </GlassCard>
    </article>

    <!-- Loading state -->
    <div v-else class="text-center py-12">
      <GlassCard variant="primary" padding="lg" radius="lg">
        <p class="text-glass">Loading post...</p>
      </GlassCard>
    </div>

    <!-- Floating Table of Contents -->
    <ClientOnly>
      <div v-if="hasToc">
        <div :class="[
          'fixed top-16 right-4 transition-transform duration-300 z-30 shadow-xl',
          showTocPanel ? 'translate-x-0' : 'translate-x-full'
        ]">
          <div class="relative">
            <TableOfContents :links="post?.body.toc?.links || []" />

            <!-- Close button -->
            <button @click="showTocPanel = false"
              class="absolute -top-2 -left-2 p-1 glass-secondary rounded-full hover:bg-white/30 transition-colors shadow-md"
              aria-label="Hide table of contents">
              <svg class="w-3 h-3 text-glass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- TOC Toggle Button (when panel is hidden) -->
        <button v-if="!showTocPanel" @click="showTocPanel = true"
          class="fixed top-1/2 right-0 transform -translate-y-1/2 glass-primary rounded-l-lg p-2 shadow-lg hover:shadow-xl transition-all duration-300 z-40"
          aria-label="Show table of contents">
          <svg class="w-4 h-4 text-glass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </ClientOnly>

    <!-- Floating Action Buttons -->
    <div v-if="post" class="fixed right-4 bottom-4 flex flex-col gap-2 z-50">
      <!-- Scroll to Top -->
      <NavScrollTopIcon />

      <!-- Share Icons -->
      <GlassCard variant="primary" padding="sm" radius="lg">
        <NavShareIcons :headline="post.title" :description="post.description || 'Check out this blog post'"
          :path="route.fullPath" />
      </GlassCard>
    </div>
  </BackgroundLayout>
</template>

<script setup lang="ts">
import BackgroundLayout from '~/components/layouts/BackgroundLayout.vue'
import GlassCard from '~/components/ui/GlassCard.vue'
import TableOfContents from '~/components/blog/TableOfContents.vue'
import IconsArrowLeft from '~/components/icons/arrowLeft.vue'

const route = useRoute()
const slug = route.params.slug as string

// TOC panel state
const showTocPanel = ref(true)
const hasToc = computed(() => {
  return post.value && post.value.body && post.value.body.toc && post.value.body.toc.links && post.value.body.toc.links.length > 0
})

// Handle responsive behavior
const handleResize = () => {
  if (import.meta.client) {
    // Hide TOC panel on screens smaller than 1280px (xl breakpoint)
    if (window.innerWidth < 1280) {
      showTocPanel.value = false
    } else {
      // Auto-show on large screens if TOC exists
      if (hasToc.value) {
        showTocPanel.value = true
      }
    }
  }
}

onMounted(() => {
  if (import.meta.client) {
    window.addEventListener('resize', handleResize)
    handleResize() // Initial check
  }
})

onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener('resize', handleResize)
  }
})

// History stack for back button
const returnPath = ref('/')
const returnTitle = ref('Home')

// Map of route patterns to page titles
const getPageTitle = (path: string, search: string = '') => {
  if (path === '/blogs/') return 'Latest Posts'
  if (path === '/blogs/timeline') return 'Timeline'
  if (path === '/blogs/tags') return 'Tags'
  if (path === '/blogs/about') return 'About'
  if (path.startsWith('/blogs/tags/')) {
    const tag = path.split('/blogs/tags/')[1]
    return `Posts tagged: ${decodeURIComponent(tag)}`
  }
  if (search && search.includes('tag=')) {
    const params = new URLSearchParams(search)
    const tag = params.get('tag')
    return tag ? `Posts tagged: ${tag}` : 'Latest Posts'
  }
  return 'Previous Page'
}

// Get return path using multiple strategies
onMounted(() => {
  if (import.meta.client) {
    // Strategy 1: Check session storage (for programmatic navigation)
    const savedReturnPath = sessionStorage.getItem('blogReturnPath')
    const savedReturnTitle = sessionStorage.getItem('blogReturnTitle')

    if (savedReturnPath) {
      returnPath.value = savedReturnPath
      returnTitle.value = savedReturnTitle || 'Previous Page'
      // Clear after use
      sessionStorage.removeItem('blogReturnPath')
      sessionStorage.removeItem('blogReturnTitle')
      return
    }

    // Strategy 2: Use browser history if available
    if (window.history.length > 1) {
      // Try to get the previous page from referrer
      const referrer = document.referrer
      if (referrer) {
        try {
          const referrerUrl = new URL(referrer)
          // Only handle referrers from the same origin
          if (referrerUrl.origin === window.location.origin) {
            const referrerPath = referrerUrl.pathname
            const referrerSearch = referrerUrl.search

            returnPath.value = referrerPath + referrerSearch
            returnTitle.value = getPageTitle(referrerPath, referrerSearch)
            return
          }
        } catch (e) {
          // Invalid referrer URL, continue to fallback
        }
      }
    }

    // Strategy 3: Fallback based on current route context
    // If we have a tag in the current slug, assume they came from tags
    const currentRoute = useRoute()
    if (currentRoute.query.from === 'tags') {
      returnPath.value = '/tags'
      returnTitle.value = 'Tags'
    } else if (currentRoute.query.from === 'timeline') {
      returnPath.value = '/timeline'
      returnTitle.value = 'Timeline'
    }
    // Default fallback remains '/' and 'Home'
  }
})

// Helper function to generate slug from title
const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// First try to find post by direct path
const { data: post, error } = await useAsyncData(`blog-${slug}`, async () => {
  // Get all posts to find matching slug
  const allPosts = await queryCollection('blogs').all()
  return allPosts.find(p => generateSlug(p.title || "missing-title") === slug) || null
})

// Handle 404 if post not found
if (!post.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Post not found'
  })
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// SEO meta
useHead({
  title: computed(() => post.value?.title || 'Blog Post'),
  meta: [
    { name: 'description', content: computed(() => post.value?.description || 'Blog post content') }
  ]
})
</script>