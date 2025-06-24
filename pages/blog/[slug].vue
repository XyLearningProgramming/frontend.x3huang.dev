<template>
  <div class="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text">
    <div class="max-w-4xl mx-auto py-8 px-4">
      <!-- Back button -->
      <NuxtLink 
        :to="returnPath" 
        class="inline-flex items-center text-light-accent dark:text-dark-accent hover:underline mb-8"
      >
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
            <span 
              v-for="tag in post.tags" 
              :key="tag"
              class="px-3 py-1 text-xs bg-light-border dark:bg-dark-border rounded-full"
            >
              {{ tag }}
            </span>
          </div>
        </header>

        <div class="text-light-text dark:text-dark-text">
          <ContentRenderer :value="post" />
        </div>
      </article>

      <!-- Loading state -->
      <div v-else class="text-center py-12">
        <p class="text-light-text dark:text-dark-text">Loading post...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string

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

// Fetch all posts to find the one with matching slug
const { data: allPosts } = await useAsyncData('all-posts', () => 
  queryCollection('blog').all()
)

// Find the post that matches the slug
const post = computed(() => {
  if (!allPosts.value) return null
  return allPosts.value.find(p => generateSlug(p.title) === slug)
})

// Watch for when data loads and check if post exists
watchEffect(() => {
  if (allPosts.value && !post.value) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Post not found'
    })
  }
})

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
    { name: 'description', content: computed(() => post.value?.excerpt || 'Blog post content') }
  ]
})
</script>