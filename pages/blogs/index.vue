<template>
  <div class="min-h-screen" style="background: var(--color-dali-void);">
    <div class="mx-auto max-w-5xl px-6 py-12 md:py-16">
      <!-- Back navigation -->
      <div class="mb-6">
        <NuxtLink to="/" class="dali-btn inline-flex items-center gap-2 px-3 py-1.5 text-sm font-bold">
          <IconsArrowLeft class="w-4 h-4" />
          Home
        </NuxtLink>
      </div>

      <!-- Header -->
      <div class="mb-8">
        <h1 class="mb-2">
          <span class="bg-dali-red px-4 py-1.5 text-dali-white font-bold border-2 border-dali-white/20 inline-block -rotate-1 shadow-dali">
            {{ blogConfig.title }}
          </span>
        </h1>
        <p class="text-dali-muted text-lg">{{ blogConfig.pageDescription }}</p>
      </div>

      <!-- RSS + Visit Counter -->
      <div class="flex flex-wrap items-center gap-4 mb-8">
        <VisitCounter path="/blogs" singular-text="visit" plural-text="visits" />
        <button
          class="dali-btn px-3 py-1.5 text-sm font-bold flex items-center gap-1"
          @click="showRssPopup = true"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
          RSS
        </button>
      </div>

      <!-- RSS Popup -->
      <Teleport to="body">
        <Transition name="fade">
          <div v-if="showRssPopup" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="closeRssPopup">
            <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div class="relative dali-card p-6 max-w-md w-full" style="border-color: var(--color-dali-red); background: var(--color-dali-smoke);" @click.stop>
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-bold text-lg text-dali-white">RSS Feed</h3>
                <button class="dali-btn px-2 py-1 text-xs font-bold" @click="closeRssPopup">
                  <IconsX class="w-4 h-4" />
                </button>
              </div>
              <p class="text-sm text-dali-muted mb-4">Subscribe to my blog posts with your favorite RSS reader.</p>
              <div class="space-y-3">
                <label class="block text-sm font-bold text-dali-white">RSS Feed URL</label>
                <div class="relative">
                  <input
                    ref="urlInput"
                    :value="rssUrl"
                    readonly
                    class="dali-input w-full px-3 py-2 pr-20 text-sm"
                  />
                  <button
                    class="dali-btn absolute right-1 top-1/2 -translate-y-1/2 bg-dali-red text-dali-white px-3 py-1 text-xs font-bold"
                    @click="copyToClipboard"
                  >
                    {{ copied ? 'Copied!' : 'Copy' }}
                  </button>
                </div>
              </div>
              <div class="flex gap-2 mt-6">
                <a :href="rssUrl" target="_blank" class="dali-btn flex-1 text-center px-4 py-2 text-sm font-bold">
                  Open Feed
                </a>
                <button class="dali-btn flex-1 px-4 py-2 text-sm font-bold" @click="closeRssPopup">
                  Close
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>

      <!-- Search -->
      <div class="mb-8">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search blogs by title, description, or tag..."
            class="dali-input w-full px-4 py-3 pl-12 pr-12 text-sm"
          />
          <div class="absolute left-4 top-1/2 -translate-y-1/2">
            <IconsSearch class="w-5 h-5 text-dali-muted" />
          </div>
          <button
            v-if="searchQuery.trim()"
            class="absolute right-4 top-1/2 -translate-y-1/2"
            @click="clearSearch"
          >
            <IconsX class="w-5 h-5 text-dali-muted hover:text-dali-white" />
          </button>
        </div>
      </div>

      <!-- Blog posts -->
      <div class="mb-8">
        <BlogList :posts="filteredPosts" />
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-8">
        <div class="w-8 h-8 border-4 border-dali-red border-t-dali-gold rounded-full animate-spin" />
      </div>

      <!-- End of posts -->
      <div v-else-if="!hasMore && posts.length > 0" class="text-center py-8">
        <div class="dali-card inline-block px-8 py-4" style="border-color: var(--color-dali-gold);">
          <p class="text-lg font-bold mb-1 text-dali-white">You've reached the end!</p>
          <p class="text-sm text-dali-muted">Thanks for reading.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import VisitCounter from '~/components/ui/VisitCounter.vue'
import IconsArrowLeft from '~/components/icons/arrowLeft.vue'
import IconsSearch from '~/components/icons/search.vue'
import IconsX from '~/components/icons/x.vue'
import { blogConfig, getBlogPageTitle, getBlogPageDescription } from '~/site.config'

// Calculate dynamic posts per page
const calculatePostsPerPage = () => {
  if (!import.meta.client) return 5
  const viewportHeight = window.innerHeight
  const estimated = Math.floor(viewportHeight / 200)
  return Math.max(3, Math.min(20, estimated + 2))
}

// Pagination state
const postsPerPage = ref(5)
const posts = ref<any[]>([])
const loading = ref(false)
const hasMore = ref(true)

// Search
const searchQuery = ref('')
const clearSearch = () => { searchQuery.value = '' }

// RSS
const showRssPopup = ref(false)
const copied = ref(false)
const urlInput = ref<HTMLInputElement | null>(null)

const rssUrl = computed(() => {
  if (import.meta.client) return `${window.location.origin}/blogs/rss.xml`
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
    setTimeout(() => { copied.value = false }, 2000)
  }
  catch (err) {
    if (urlInput.value) {
      urlInput.value.select()
      try {
        document.execCommand('copy')
        copied.value = true
        setTimeout(() => { copied.value = false }, 2000)
      }
      catch { /* noop */ }
    }
  }
}

// Filter
const filteredPosts = computed(() => {
  if (!searchQuery.value.trim()) return posts.value
  const query = searchQuery.value.toLowerCase().trim()
  return posts.value.filter((post) => {
    return post.title?.toLowerCase().includes(query)
      || post.description?.toLowerCase().includes(query)
      || post.tags?.some((tag: string) => tag.toLowerCase().includes(query))
  })
})

// Query
const queryPublishedBlogs = (limit: number, skip: number) => {
  const query = queryCollection('blogs')
  if (!import.meta.dev) query.where('published', '=', true)
  return query.select('title', 'date', 'description', 'tags', 'image')
    .order('date', 'DESC').limit(limit).skip(skip).all()
}

const { data: initialPosts } = await useAsyncData('blog-posts-initial', () =>
  queryPublishedBlogs(postsPerPage.value, 0),
)

if (initialPosts.value && Array.isArray(initialPosts.value)) {
  posts.value = initialPosts.value
  hasMore.value = initialPosts.value.length === postsPerPage.value
}

const loadMorePosts = async () => {
  if (loading.value || !hasMore.value) return
  loading.value = true
  try {
    const newPosts = await queryPublishedBlogs(postsPerPage.value, posts.value.length)
    if (newPosts && newPosts.length > 0) {
      posts.value.push(...newPosts)
      hasMore.value = newPosts.length === postsPerPage.value
    }
    else { hasMore.value = false }
  }
  catch (error) { console.error('Error loading more posts:', error) }
  finally { loading.value = false }
}

const handleScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight
  if (scrollTop + windowHeight >= documentHeight - 200) loadMorePosts()
}

const handleResize = () => {
  const n = calculatePostsPerPage()
  if (n !== postsPerPage.value) postsPerPage.value = n
}

onMounted(() => {
  postsPerPage.value = calculatePostsPerPage()
  window.addEventListener('scroll', handleScroll)
  window.addEventListener('resize', handleResize)
  const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') closeRssPopup() }
  document.addEventListener('keydown', handleEscape)
  onUnmounted(() => document.removeEventListener('keydown', handleEscape))
  const { initializeTracking, trackVisit } = useGoatCounter()
  initializeTracking()
  trackVisit('/blogs')
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', handleResize)
})

useHead({
  title: getBlogPageTitle('Blog Posts'),
  meta: [{ name: 'description', content: getBlogPageDescription() }],
  link: [{ rel: 'alternate', type: 'application/rss+xml', title: 'Blog RSS Feed', href: '/blogs/rss.xml' }],
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }
</style>
