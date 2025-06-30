<template>
  <BackgroundLayout container-width="wide">
    <PageHeader 
      title="Latest Blog Posts" 
      description="Technical articles, insights, and thoughts on my software development journey." 
    />

    <!-- Blog posts -->
    <div class="mb-8">
      <BlogList :posts="posts" />
    </div>

    <!-- Loading indicator -->
    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white/60"></div>
    </div>

    <!-- End of posts indicator -->
    <div v-else-if="!hasMore && posts.length > 0" class="text-center py-8">
      <div class="relative">
        <div class="absolute inset-0 bg-black/20 rounded-2xl blur-xl"></div>
        <div class="relative text-glass px-6 py-4">
          <p class="text-lg mb-4">🎉 You've reached the end!</p>
          <p class="text-sm opacity-75">Thanks for reading all my posts.</p>
        </div>
      </div>
    </div>

    <!-- Back to home -->
    <div class="text-center mt-12">
      <NuxtLink 
        to="/" 
        class="inline-flex items-center gap-2 text-glass hover:text-glass-muted transition-colors"
      >
        <IconsArrowLeft class="w-4 h-4" />
        Back to Home
      </NuxtLink>
    </div>
  </BackgroundLayout>
</template>

<script setup lang="ts">
import BackgroundLayout from '~/components/layouts/BackgroundLayout.vue'
import PageHeader from '~/components/ui/PageHeader.vue'
import IconsArrowLeft from '~/components/icons/arrowLeft.vue'

// Calculate dynamic posts per page based on viewport height
const calculatePostsPerPage = () => {
  if (!import.meta.client) return 6 // Default for SSR

  const viewportHeight = window.innerHeight
  // Estimate ~200px per blog card + padding, minimum 3, maximum 20
  const estimated = Math.floor(viewportHeight / 200)
  return Math.max(3, Math.min(20, estimated + 2)) // +2 for buffer
}

// Pagination state
const postsPerPage = ref(calculatePostsPerPage())
const currentPage = ref(0)
const posts = ref<any[]>([])
const loading = ref(false)
const hasMore = ref(true)

// Load initial posts
const { data: initialPosts } = await useAsyncData('blog-posts-initial', () =>
  queryCollection('blog')
    .order('date', 'DESC')
    .limit(postsPerPage.value)
    .skip(0)
    .all()
)

// Initialize posts with first batch
if (initialPosts.value && Array.isArray(initialPosts.value)) {
  posts.value = initialPosts.value
  hasMore.value = initialPosts.value.length === postsPerPage.value
}

// Load more posts function
const loadMorePosts = async () => {
  if (loading.value || !hasMore.value) return

  loading.value = true

  try {
    const nextPage = currentPage.value + 1
    const newPosts = await queryCollection('blog')
      .order('date', 'DESC')
      .limit(postsPerPage.value)
      .skip(nextPage * postsPerPage.value)
      .all()

    if (newPosts && newPosts.length > 0) {
      posts.value.push(...newPosts)
      currentPage.value = nextPage
      hasMore.value = newPosts.length === postsPerPage.value
    } else {
      hasMore.value = false
    }
  } catch (error) {
    console.error('Error loading more posts:', error)
  } finally {
    loading.value = false
  }
}

// Scroll event handler
const handleScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight

  // Load more when user is near bottom (within 200px)
  if (scrollTop + windowHeight >= documentHeight - 200) {
    loadMorePosts()
  }
}

// Handle window resize to update posts per page
const handleResize = () => {
  const newPostsPerPage = calculatePostsPerPage()
  if (newPostsPerPage !== postsPerPage.value) {
    postsPerPage.value = newPostsPerPage
  }
}

// Set up event listeners
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  window.addEventListener('resize', handleResize)

  // Update posts per page on client-side mount
  postsPerPage.value = calculatePostsPerPage()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', handleResize)
})

// SEO meta
useHead({
  title: 'Blog Posts - Xinyu Huang',
  meta: [
    { name: 'description', content: 'Latest blog posts by Xinyu Huang. Technical articles, insights, and thoughts on web development, technology, and more.' }
  ]
})
</script>