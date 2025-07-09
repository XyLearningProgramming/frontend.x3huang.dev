<template>
  <BackgroundLayout container-width="wide" overlay-intensity="heavy" blur-background>
    <!-- Back navigation -->
    <div class="mb-6">
      <NuxtLink to="/"
        class="inline-flex items-center gap-2 text-glass hover:text-glass-muted transition-colors">
        <IconsArrowLeft class="w-4 h-4" />
        Back to Home
      </NuxtLink>
    </div>

    <PageHeader title="Latest Blog Posts"
      description="Technical articles, insights, and thoughts on my software development journey." />

    <!-- Search box -->
    <div class="mb-8">
      <div class="relative">
        <input v-model="searchQuery" type="text" placeholder="Search blogs by title, description, or tag..."
          class="w-full px-4 py-3 pl-12 pr-12 glass-primary rounded-lg border-0 text-glass placeholder-glass-muted/60 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-200" />
        <div class="absolute left-4 top-1/2 transform -translate-y-1/2 text-white">
          <IconsSearch class="w-5 h-5" />
        </div>
        <button v-if="searchQuery.trim()" @click="clearSearch"
          class="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-white/70 transition-colors duration-200">
          <IconsX class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Blog posts -->
    <div class="mb-8">
      <BlogList :posts="filteredPosts" />
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

    
  </BackgroundLayout>
</template>

<script setup lang="ts">
import BackgroundLayout from '~/components/layouts/BackgroundLayout.vue'
import PageHeader from '~/components/ui/PageHeader.vue'
import IconsArrowLeft from '~/components/icons/arrowLeft.vue'
import IconsSearch from '~/components/icons/search.vue'
import IconsX from '~/components/icons/x.vue'

// Calculate dynamic posts per page based on viewport height
const calculatePostsPerPage = () => {
  if (!import.meta.client) return 5 // Default for SSR

  const viewportHeight = window.innerHeight
  // Estimate ~200px per blog card + padding, minimum 3, maximum 20
  const estimated = Math.floor(viewportHeight / 200)
  return Math.max(3, Math.min(20, estimated + 2)) // +2 for buffer
}

// Pagination state
const postsPerPage = ref(5)
const posts = ref<any[]>([])
const loading = ref(false)
const hasMore = ref(true)

// Search state
const searchQuery = ref('')

// Clear search function
const clearSearch = () => {
  searchQuery.value = ''
}

// Filtered posts based on search query
const filteredPosts = computed(() => {
  if (!searchQuery.value.trim()) {
    return posts.value
  }

  const query = searchQuery.value.toLowerCase().trim()
  return posts.value.filter(post => {
    const titleMatch = post.title?.toLowerCase().includes(query)
    const descriptionMatch = post.description?.toLowerCase().includes(query)
    const tagsMatch = post.tags?.some((tag: string) => tag.toLowerCase().includes(query))

    return titleMatch || descriptionMatch || tagsMatch
  })
})

// Single function to query published blog posts
const queryPublishedBlogs = (limit: number, skip: number) => {
  const query = queryCollection('blogs')

  if (!import.meta.dev) {
    query.where('published', '=', true)
  }

  return query
    .order('date', 'DESC')
    .limit(limit)
    .skip(skip)
    .all()
}

// Load initial posts
const { data: initialPosts } = await useAsyncData('blog-posts-initial', () =>
  queryPublishedBlogs(postsPerPage.value, 0)
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
    const newPosts = await queryPublishedBlogs(postsPerPage.value, posts.value.length)

    if (newPosts && newPosts.length > 0) {
      posts.value.push(...newPosts)
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
  // Update posts per page on client-side mount
  postsPerPage.value = calculatePostsPerPage()

  window.addEventListener('scroll', handleScroll)
  window.addEventListener('resize', handleResize)
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