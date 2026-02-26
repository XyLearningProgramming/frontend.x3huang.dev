<template>
  <LayoutsSubPageLayout
    :title="post?.title || 'Loading...'"
    :back-to="backToUrl"
    back-label="Posts"
    max-width="default"
    :has-sidebar="true"
  >
    <!-- Header -->
    <template #header>
      <div v-if="post">
        <h1 class="text-dali-white mb-3">{{ post.title }}</h1>
        <div class="flex flex-wrap items-center gap-3 text-sm text-dali-white/60 mb-4">
          <span class="font-bold">{{ formatDate(post.date) }}</span>
          <span v-if="post.readTime" class="text-dali-muted">
            {{ post.readTime }} min read
          </span>
          <span v-if="post.tags?.length" class="flex flex-wrap gap-1">
            <span
              v-for="tag in post.tags"
              :key="tag"
              class="text-[10px] font-bold px-2 py-0.5 bg-dali-white/10 border border-dali-white/30 text-dali-white"
            >
              {{ tag }}
            </span>
          </span>
        </div>

        <!-- Analytics -->
        <AnalyticsDisplay
          :slug="slug"
          :analytics="analytics"
          :loading="analyticsLoading"
          :clickable="true"
        />

        <!-- Mobile TOC toggle -->
        <div class="lg:hidden mt-6">
          <button
            class="dali-btn w-full px-4 py-2 text-sm flex items-center justify-between"
            @click="mobileTocOpen = !mobileTocOpen"
          >
            <span>Table of Contents</span>
            <svg
              class="w-4 h-4 transition-transform"
              :class="{ 'rotate-180': mobileTocOpen }"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div v-show="mobileTocOpen" class="mt-2 border-2 border-dali-white/10 bg-dali-smoke p-4">
            <BlogTocList :items="tocItems" :active-id="activeTocId" @navigate="scrollToHeading" />
          </div>
        </div>
      </div>
    </template>

    <!-- Sidebar (desktop TOC) -->
    <template #sidebar>
      <div v-if="tocItems.length > 0" class="toc-sidebar">
        <h4 class="text-xs font-bold uppercase tracking-wider text-dali-muted mb-3">
          On this page
        </h4>
        <BlogTocList :items="tocItems" :active-id="activeTocId" @navigate="scrollToHeading" />
      </div>
    </template>

    <!-- Main content -->
    <div v-if="pending" class="flex items-center justify-center py-24">
      <div class="w-8 h-8 border-4 border-dali-red border-t-dali-gold rounded-full animate-spin" />
    </div>

    <div v-else-if="error || !post" class="text-center py-24">
      <div class="text-4xl mb-4">404</div>
      <h2 class="text-xl font-bold text-dali-white mb-2">Post Not Found</h2>
      <p class="text-dali-muted mb-6">The blog post you're looking for doesn't exist.</p>
      <NuxtLink :to="backToUrl" class="dali-btn px-6 py-2">
        Back to Posts
      </NuxtLink>
    </div>

    <template v-else>
      <!-- Blog content -->
      <article id="blog-article" class="blog-content mb-12">
        <ContentRenderer :value="post" />
      </article>

      <!-- Related articles (prev/next) -->
      <div v-if="surroundPosts && surroundPosts.length > 0" class="mb-12">
        <h3 class="text-lg font-bold text-dali-white mb-4">Continue Reading</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NuxtLink
            v-for="(related, idx) in surroundPosts"
            :key="idx"
            :to="related.path"
            class="block p-4 border-2 border-dali-white/15 bg-dali-white/5 hover:border-dali-red transition-colors"
          >
            <span class="text-[10px] font-bold text-dali-muted block mb-1">
              {{ idx === 0 ? 'Previous' : 'Next' }}
            </span>
            <span class="text-sm font-bold text-dali-white">{{ related.title }}</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Comments -->
      <CommentSection
        :title="post.title"
        :thread-id="`/blogs/${slug}`"
        form-title="Share your thoughts"
      />
    </template>
  </LayoutsSubPageLayout>
</template>

<script setup lang="ts">
import AnalyticsDisplay from '~/components/blog/AnalyticsDisplay.vue'
import { siteConfig, getPageMeta } from '~/site.config'

const route = useRoute()
const slug = route.params.slug as string

// Build a dynamic back-to URL that preserves the "Show More" expansion state.
// If the user expanded extra posts before clicking into this article, the count
// is stored in sessionStorage so the back navigation restores it.
const backToUrl = computed(() => {
  if (!import.meta.client) return '/#posts'
  const extra = Number(sessionStorage.getItem('posts-visible-extra')) || 0
  return extra > 0 ? `/?posts=${extra}#posts` : '/#posts'
})

// ── Fetch blog post content ──
const { data: post, pending, error } = await useAsyncData(`blog-${slug}`, () =>
  queryCollection('blogs').path(`/blogs/${slug}`).first(),
)

// ── Surround (prev/next) posts ──
const { data: surroundData } = await useAsyncData(`blog-surround-${slug}`, async () => {
  try {
    const allPosts = await queryCollection('blogs')
      .where('published', '=', true)
      .select('title', 'path', 'date')
      .order('date', 'DESC')
      .all()

    const currentIdx = allPosts.findIndex((p: any) => p.path === `/blogs/${slug}`)
    if (currentIdx === -1) return []

    const results: any[] = []
    // Previous (newer) post
    if (currentIdx > 0) {
      results.push(allPosts[currentIdx - 1])
    }
    // Next (older) post
    if (currentIdx < allPosts.length - 1) {
      results.push(allPosts[currentIdx + 1])
    }
    return results
  } catch {
    return []
  }
})

const surroundPosts = computed(() => surroundData.value || [])

// ── Analytics ──
const analytics = ref({ visits: 0, likes: 0, shares: 0 })
const analyticsLoading = ref(true)

// ── TOC ──
const tocItems = ref<{ id: string; label: string; level: number }[]>([])
const activeTocId = ref('')
const mobileTocOpen = ref(false)

function scanHeadings() {
  if (!import.meta.client) return
  const article = document.getElementById('blog-article')
  if (!article) return

  const headings = article.querySelectorAll('h2[id], h3[id]')
  const items: { id: string; label: string; level: number }[] = []

  headings.forEach((el) => {
    const id = (el as HTMLElement).id
    const label = el.textContent?.replace(/^#\s*/, '').trim() || id
    const level = el.tagName === 'H2' ? 2 : 3
    items.push({ id, label, level })
  })

  tocItems.value = items
}

function updateActiveToc() {
  if (!import.meta.client || tocItems.value.length === 0) return

  const scrollY = window.scrollY
  let activeId = ''

  for (const item of tocItems.value) {
    const el = document.getElementById(item.id)
    if (el) {
      const top = el.getBoundingClientRect().top + scrollY - 100
      if (scrollY >= top) {
        activeId = item.id
      }
    }
  }

  activeTocId.value = activeId
}

function scrollToHeading(id: string) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    mobileTocOpen.value = false
  }
}

// ── Lifecycle ──
let scrollRaf = 0
let observer: MutationObserver | null = null

onMounted(async () => {
  if (!import.meta.client) return

  // Analytics
  try {
    const { initializeTracking, trackVisit, getBlogAnalytics } = useGoatCounter()
    initializeTracking()
    trackVisit(`/blogs/${slug}`)
    analytics.value = await getBlogAnalytics(slug)
  } catch (e) {
    console.warn('Failed to load analytics:', e)
  } finally {
    analyticsLoading.value = false
  }

  // Scan headings after content renders
  await nextTick()
  setTimeout(scanHeadings, 500)

  // MutationObserver to catch late-rendered content
  observer = new MutationObserver(() => {
    scanHeadings()
  })
  const article = document.getElementById('blog-article')
  if (article) {
    observer.observe(article, { childList: true, subtree: true })
  }
  setTimeout(() => observer?.disconnect(), 8000)

  // Scroll tracking for active TOC item
  function loop() {
    updateActiveToc()
    scrollRaf = requestAnimationFrame(loop)
  }
  scrollRaf = requestAnimationFrame(loop)
})

onUnmounted(() => {
  if (import.meta.client) {
    cancelAnimationFrame(scrollRaf)
    observer?.disconnect()
  }
})

// ── Helpers ──
function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

// ── SEO ──
useHead(getPageMeta({
  title: post.value?.title ? `${post.value.title} - ${siteConfig.name}` : siteConfig.title,
  description: (post.value as any)?.description || siteConfig.description,
  url: `${siteConfig.url}/blogs/${slug}`,
  type: 'article',
}))
</script>
