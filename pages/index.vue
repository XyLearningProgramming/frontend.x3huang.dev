<template>
  <div class="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text">
    <div class="flex">
      <!-- Sidebar -->
      <AppSidebar />

      <!-- Right Panel -->
      <main :class="[
        'flex-1 p-8 transition-all duration-300',
        isExpanded && !isMobile ? 'ml-64' : 'ml-0'
      ]">
        <h1 class="text-3xl font-bold text-light-text-strong dark:text-dark-text-strong mb-8">Latest Posts</h1>

        <BlogList :posts="posts" />

        <!-- Loading indicator -->
        <div v-if="loading" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-light-accent dark:border-dark-accent"></div>
        </div>

        <!-- End of posts indicator -->
        <div v-else-if="!hasMore && posts.length > 0" class="text-center py-8 text-light-text dark:text-dark-text">
          You've reached the end
        </div>
      </main>
    </div>

  </div>
</template>

<script setup lang="ts">
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

// Use sidebar state for responsive layout
const { isExpanded, isMobile } = useSidebar()

// Head meta
useHead({
  title: "Xinyu's Blog", // same as manifest short_name
  meta: [
    {
      name: 'description',
      content: 'Blog site of Xinyu Huang, x3huang, sharing tech insights, self-hosting experience, web development',
    }
  ],
  link: [
    { rel: "apple-touch-icon", sizes: "180x180", href: "/favicon/apple-touch-icon.png" },
    { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon/favicon-32x32.png' },
    { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon/favicon-16x16.png' },
    { rel: 'manifest', href: '/favicon/site.webmanifest' },
  ],
})
</script>