<template>
  <BackgroundLayout container-width="wide" overlay-intensity="heavy" blur-background>
    <!-- Back navigation -->
    <div class="mb-6">
      <NuxtLink to="/" class="inline-flex items-center gap-2 text-glass hover:text-glass-muted transition-colors">
        <IconsArrowLeft class="w-4 h-4" />
        Back to Home
      </NuxtLink>
    </div>

    <PageHeader :title="blogConfig.title" :description="blogConfig.pageDescription" />

    <!-- RSS Feed and Visit Counter -->
    <div class="flex items-center justify-center gap-6 mb-8">
      <!-- Visit Counter (styled like analytics) -->
      <VisitCounter path="/blogs" singular-text="visit of blog page" plural-text="visits of blog page" />
      <!-- RSS Feed (styled like share button) -->
      <button @click="showRssPopup = true"
        class="flex items-center gap-1 text-glass-muted hover:text-orange-400 transition-all duration-300 group cursor-pointer"
        title="Subscribe to RSS feed">
        <svg class="w-4 h-4 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor"
          viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z" />
        </svg>
        <span class="text-sm">RSS Feed</span>
      </button>
    </div>

    <!-- RSS Popup Modal -->
    <Teleport to="body">
      <div v-if="showRssPopup" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click="closeRssPopup">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

        <!-- Modal -->
        <div class="relative glass-primary rounded-2xl border border-white/20 p-6 max-w-md w-full shadow-2xl"
          @click.stop>
          <!-- Header -->
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-glass flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
              RSS Feed
            </h3>
            <button @click="closeRssPopup"
              class="text-glass-muted hover:text-glass transition-colors duration-200 p-1 rounded-lg hover:bg-white/10">
              <IconsX class="w-5 h-5" />
            </button>
          </div>

          <!-- Description -->
          <p class="text-glass-muted text-sm mb-4">
            Subscribe to my blog posts with your favorite RSS reader.
          </p>

          <!-- RSS URL Input -->
          <div class="space-y-3">
            <label class="block text-sm font-medium text-glass">RSS Feed URL</label>
            <div class="relative">
              <input ref="urlInput" :value="rssUrl" readonly
                class="w-full px-3 py-2 pr-20 glass-secondary rounded-lg border border-white/20 text-glass text-sm focus:outline-none focus:ring-2 focus:ring-white/30 selection:bg-white/20" />
              <button @click="copyToClipboard"
                class="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 text-xs bg-white/20 hover:bg-white/30 rounded text-glass transition-colors duration-200">
                {{ copied ? 'Copied!' : 'Copy' }}
              </button>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-2 mt-6">
            <a :href="rssUrl" target="_blank"
              class="flex-1 text-center px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-glass text-sm transition-colors duration-200">
              Open RSS Feed
            </a>
            <button @click="closeRssPopup"
              class="flex-1 px-4 py-2 glass-secondary border border-white/20 hover:border-white/40 rounded-lg text-glass text-sm transition-all duration-200">
              Close
            </button>
          </div>
        </div>
      </div>
    </Teleport>

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
import VisitCounter from '~/components/ui/VisitCounter.vue'
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

// RSS popup state
const showRssPopup = ref(false)
const copied = ref(false)
const urlInput = ref<HTMLInputElement | null>(null)

// Clear search function
const clearSearch = () => {
  searchQuery.value = ''
}

// RSS functions
const rssUrl = computed(() => {
  if (import.meta.client) {
    return `${window.location.origin}/blogs/rss.xml`
  }
  return '/blogs/rss.xml'
})

const closeRssPopup = () => {
  showRssPopup.value = false
  copied.value = false
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(rssUrl.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    // Fallback for older browsers
    if (urlInput.value) {
      urlInput.value.select()
      urlInput.value.setSelectionRange(0, 99999)
      try {
        document.execCommand('copy')
        copied.value = true
        setTimeout(() => {
          copied.value = false
        }, 2000)
      } catch (fallbackErr) {
        console.warn('Copy to clipboard failed:', fallbackErr)
      }
    }
  }
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
    .select('title', 'date', 'description', 'tags', 'image')
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

  // RSS popup escape key handler
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeRssPopup()
    }
  }
  document.addEventListener('keydown', handleEscape)

  // Initialize GoatCounter tracking
  const { initializeTracking, trackVisit } = useGoatCounter()
  initializeTracking()
  trackVisit('/blogs')

  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape)
  })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', handleResize)
})

// Import configs
import { blogConfig, getBlogPageTitle, getBlogPageDescription } from '~/site.config'

// SEO meta
useHead({
  title: getBlogPageTitle('Blog Posts'),
  meta: [
    { name: 'description', content: getBlogPageDescription() }
  ],
  link: [
    {
      rel: 'alternate',
      type: 'application/rss+xml',
      title: 'Blog RSS Feed',
      href: '/blogs/rss.xml'
    }
  ]
})
</script>