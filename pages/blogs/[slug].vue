<template>
  <div class="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text">
    <div class="flex">
      <!-- Table of Contents Left Panel -->
      <ClientOnly>
        <div v-if="hasToc" class="hidden xl:block">
          <div 
            :class="[
              'fixed top-16 left-0 w-64 bg-light-surface/80 dark:bg-dark-surface/80 backdrop-blur-sm transition-transform duration-300 z-30',
              showTocPanel ? 'translate-x-0' : '-translate-x-full'
            ]"
          >
            <!-- TOC Header with Toggle -->
            <div class="px-6 py-4">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-medium text-light-text-strong dark:text-dark-text-strong">Contents</h3>
                <button 
                  @click="showTocPanel = !showTocPanel"
                  class="p-1 rounded hover:bg-light-border/50 dark:hover:bg-dark-border/50 transition-colors"
                  :aria-label="showTocPanel ? 'Hide table of contents' : 'Show table of contents'"
                >
                  <svg class="w-4 h-4 text-light-text dark:text-dark-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- TOC Content -->
              <nav class="overflow-y-auto max-h-[calc(100vh-8rem)]">
                <ul class="space-y-1">
                  <li 
                    v-for="link of flattenLinks(post.body.toc.links)" 
                    :key="link.id" 
                    :class="`toc-link_${link.depth}`"
                  >
                    <a 
                      :href="`#${link.id}`" 
                      class="text-sm text-light-text/80 dark:text-dark-text/80 hover:text-light-accent dark:hover:text-dark-accent transition-colors block py-1 leading-tight"
                      @click="scrollToHeading(link.id)"
                    >
                      {{ link.text }}
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>

          <!-- TOC Toggle Button (when panel is hidden) -->
          <button 
            v-if="!showTocPanel"
            @click="showTocPanel = true"
            class="fixed top-1/2 left-0 transform -translate-y-1/2 bg-light-surface dark:bg-dark-surface rounded-r-lg p-2 shadow-lg hover:shadow-xl transition-all duration-300 z-40"
            aria-label="Show table of contents"
          >
            <svg class="w-4 h-4 text-light-text dark:text-dark-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </ClientOnly>

      <!-- Main Content -->
      <div class="flex-1 max-w-4xl mx-auto py-8 px-4" :class="{ 'xl:ml-64': hasToc && showTocPanel }">
        <!-- Back button -->
        <NuxtLink :to="returnPath"
          class="inline-flex items-center text-light-accent dark:text-dark-accent hover:underline mb-8">
          ← Back to {{ returnTitle }}
        </NuxtLink>

        <!-- Post content -->
        <article v-if="post" class="prose prose-lg max-w-none">
        <header class="mb-8">
          <h1 class="text-4xl font-bold text-light-text-strong dark:text-dark-text-strong mb-4">
            {{ post.title }}
          </h1>

          <div class="flex items-center gap-4 text-sm text-light-text dark:text-dark-text mb-6">
            <time>{{ formatDate(post.date) }}</time>
            <span v-if="post.author">by {{ post.author }}</span>
            <span v-if="post.readTime">{{ post.readTime }} min read</span>
          </div>

          <div v-if="post.tags && post.tags.length" class="flex flex-wrap gap-2 mb-6">
            <span v-for="tag in post.tags" :key="tag"
              class="px-3 py-1 text-xs bg-light-border dark:bg-dark-border rounded-full">
              {{ tag }}
            </span>
          </div>
        </header>

        <div class="text-light-text dark:text-dark-text">
          <ClientOnly>
            <ContentRenderer :value="post" />
            <template #fallback>
              <div class="animate-pulse">
                <div class="h-4 bg-light-border dark:bg-dark-border rounded w-3/4 mb-4"></div>
                <div class="h-4 bg-light-border dark:bg-dark-border rounded w-1/2 mb-4"></div>
                <div class="h-4 bg-light-border dark:bg-dark-border rounded w-5/6 mb-4"></div>
              </div>
            </template>
          </ClientOnly>
        </div>
      </article>

      <!-- Loading state -->
      <div v-else class="text-center py-12">
        <p class="text-light-text dark:text-dark-text">Loading post...</p>
      </div>
    </div>
  </div>

    <!-- Floating Action Buttons -->
    <div v-if="post" class="fixed right-4 bottom-4 flex flex-col gap-2 z-50">
      <!-- Scroll to Top -->
      <NavScrollTopIcon />

      <!-- Share Icons -->
      <div
        class="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg p-3 shadow-lg">
        <NavShareIcons :headline="post.title" :description="post.description || 'Check out this blog post'"
          :path="route.fullPath" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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

// Get return path from session storage
onMounted(() => {
  if (import.meta.client) {
    const savedReturnPath = sessionStorage.getItem('blogReturnPath')
    const savedReturnTitle = sessionStorage.getItem('blogReturnTitle')

    if (savedReturnPath) {
      returnPath.value = savedReturnPath
      returnTitle.value = savedReturnTitle || 'Previous Page'
    } else {
      // Fallback: check if user came from a known page using document.referrer
      const referrer = document.referrer
      if (referrer) {
        const referrerUrl = new URL(referrer)
        const referrerPath = referrerUrl.pathname

        if (referrerPath === '/timeline') {
          returnPath.value = '/timeline'
          returnTitle.value = 'Timeline'
        } else if (referrerPath === '/tags') {
          returnPath.value = '/tags'
          returnTitle.value = 'Tags'
        } else if (referrerPath === '/about') {
          returnPath.value = '/about'
          returnTitle.value = 'About'
        } else if (referrerPath.startsWith('/?tag=')) {
          returnPath.value = referrerPath + referrerUrl.search
          const tag = referrerUrl.searchParams.get('tag')
          returnTitle.value = tag ? `Posts tagged: ${tag}` : 'Latest Posts'
        }
      }
    }

    // Clear the saved return path after using it
    sessionStorage.removeItem('blogReturnPath')
    sessionStorage.removeItem('blogReturnTitle')
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
  const allPosts = await queryCollection('blog').all()
  return allPosts.find(p => generateSlug(p.title) === slug) || null
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

// Helper functions for TOC
const flattenLinks = (links: any[]) => {
  let _links = links
    .map((link) => {
      let _link = [link]
      if (link.children) {
        let flattened = flattenLinks(link.children)
        _link = [link, ...flattened]
      }
      return _link
    })
    .flat(1)
  return _links
}

const scrollToHeading = (id: string) => {
  if (import.meta.client) {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }
}

// SEO meta
useHead({
  title: computed(() => post.value?.title || 'Blog Post'),
  meta: [
    { name: 'description', content: computed(() => post.value?.description || 'Blog post content') }
  ]
})
</script>

<style scoped>
.toc-link_2 {
  @apply pl-3;
}
.toc-link_3 {
  @apply pl-6;
}
.toc-link_4 {
  @apply pl-9;
}
.toc-link_5 {
  @apply pl-12;
}
.toc-link_6 {
  @apply pl-16;
}
</style>