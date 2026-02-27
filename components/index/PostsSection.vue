<template>
  <section id="posts" class="relative px-6 md:px-12 py-16 md:py-24 overflow-hidden">
    <div class="mx-auto max-w-6xl">
      <!-- Section heading — angled + RSS link -->
      <div class="flex items-center justify-between mb-12">
        <h2
          ref="postsHeadingRef"
          class="posts-heading opacity-0"
        >
          <span class="inline-block bg-dali-red px-5 py-2 text-dali-white border-2 border-dali-white/20 -rotate-2 shadow-dali-void">
            Xinyu's Latest Posts
          </span>
        </h2>
        <a
          href="/blogs/rss.xml"
          target="_blank"
          class="rss-link group flex items-center gap-2 px-4 py-2 text-sm font-bold border-2 border-white/20 bg-dali-void/50 hover:bg-dali-void hover:text-dali-gold hover:border-dali-gold transition-all shadow-dali-void-sm backdrop-blur-sm"
          style="color: rgba(255,255,255,0.75)"
          title="Subscribe via RSS"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 11a9 9 0 0 1 9 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M4 4a16 16 0 0 1 16 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="5" cy="19" r="1" fill="currentColor"/>
          </svg>
          RSS
        </a>
      </div>

      <!-- Loading skeleton -->
      <div v-if="recentPosts.length === 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
        <div
          v-for="i in 3"
          :key="i"
          class="dali-card p-5 animate-pulse"
          :class="`dali-card--v${i}`"
        >
          <div class="h-3 w-20 bg-dali-muted/20 rounded mb-3" />
          <div class="h-5 w-3/4 bg-dali-muted/20 rounded mb-2" />
          <div class="h-4 w-full bg-dali-muted/20 rounded mb-1" />
          <div class="h-4 w-2/3 bg-dali-muted/20 rounded" />
        </div>
      </div>

      <!-- Post cards — scattered at angles, explode from center -->
      <div v-else class="posts-grid mb-10">
        <DaliIrregularCard
          v-for="(post, idx) in recentPosts"
          :key="post.path"
          :ref="el => setPostCardRef(el, idx)"
          :seed="idx * 7 + 3"
          :rotation="postRotations[idx] || 0"
          :accent-color="postColors[idx % postColors.length]"
          class="posts-card opacity-0 cursor-pointer"
          @click="transitionTo(post.path, { sectionId: 'posts' })"
        >
          <span class="text-[10px] font-bold text-dali-muted block mb-2">
            {{ formatDate(post.date) }}
          </span>
          <h3 class="text-lg font-bold mb-2 leading-tight text-dali-white">{{ post.title }}</h3>
          <p class="text-sm text-dali-muted flex-1">{{ post.description }}</p>
          <div v-if="post.tags?.length" class="mt-3 flex flex-wrap gap-1">
            <span
              v-for="tag in post.tags.slice(0, 3)"
              :key="tag"
              class="text-[10px] font-bold px-2 py-0.5 border border-dali-gold/40 text-dali-gold"
            >
              {{ tag }}
            </span>
          </div>
          <span class="mt-3 text-xs font-bold text-dali-teal flex items-center gap-1">
            Read more
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </DaliIrregularCard>

      </div>

      <!-- Show More / Show Less button -->
      <div class="text-center mt-8">
        <div v-if="allPostsLoading" class="flex items-center justify-center py-4">
          <div class="w-6 h-6 border-3 border-dali-red border-t-dali-gold rounded-full animate-spin" />
        </div>

        <!-- Extra posts grid (shown in batches) -->
        <div v-if="visibleExtraPosts.length > 0" class="posts-grid mb-8 text-left">
          <DaliIrregularCard
            v-for="(post, idx) in visibleExtraPosts"
            :key="post.path"
            :seed="idx * 5 + 11"
            :rotation="((idx % 5) - 2) * 1.2"
            :accent-color="postColors[(idx + recentPosts.length) % postColors.length]"
            class="cursor-pointer"
            @click="transitionTo(post.path, { sectionId: 'posts' })"
          >
            <span class="text-[10px] font-bold text-dali-muted block mb-2">
              {{ formatDate(post.date) }}
            </span>
            <h3 class="text-lg font-bold mb-2 leading-tight text-dali-white">{{ post.title }}</h3>
            <p class="text-sm text-dali-muted flex-1">{{ post.description }}</p>
            <div v-if="post.tags?.length" class="mt-3 flex flex-wrap gap-1">
              <span
                v-for="tag in post.tags.slice(0, 3)"
                :key="tag"
                class="text-[10px] font-bold px-2 py-0.5 border border-dali-gold/40 text-dali-gold"
              >
                {{ tag }}
              </span>
            </div>
            <span class="mt-3 text-xs font-bold text-dali-teal flex items-center gap-1">
              Read more
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </DaliIrregularCard>
        </div>

        <div class="flex items-center justify-center gap-3">
          <button
            v-if="canShowLess"
            class="dali-btn bg-dali-void/50 border-white/15 px-5 py-2 text-sm font-bold hover:border-white/40 hover:bg-white/5 transition-all"
            style="color: rgba(255,255,255,0.5)"
            @click="showLess"
          >
            Show Less
          </button>
          <button
            v-if="canShowMore"
            ref="viewAllCardRef"
            class="dali-btn bg-dali-void/50 border-white/20 px-6 py-2.5 text-sm font-bold hover:border-white/50 hover:bg-white/5 transition-all"
            style="color: rgba(255,255,255,0.75)"
            @click="showMore"
          >
            Show More Posts
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
export interface BlogPost {
  path: string
  title: string
  description: string
  date: string
  tags?: string[]
}
</script>

<script setup lang="ts">
import { usePageTransition } from '~/composables/usePageTransition'

const { transitionTo } = usePageTransition()
const route = useRoute()

// ── Data fetching: recent posts ──
const { data: rawPosts } = await useAsyncData('recent-posts', () =>
  queryCollection('blogs')
    .where('published', '=', true)
    .order('date', 'DESC')
    .limit(6)
    .all(),
)

const recentPosts = computed<BlogPost[]>(() => {
  if (!rawPosts.value) return []
  return rawPosts.value.map((post: any) => ({
    path: post.path,
    title: post.title || 'Untitled',
    description: post.description || '',
    date: post.date || '',
    tags: post.tags || [],
  }))
})

// ── Visual config ──
const postRotations = [-3, 2, -1.5, 2.5, -2, 1]
const postColors = [
  'var(--color-dali-red)',
  'var(--color-dali-teal)',
  'var(--color-dali-gold)',
  'var(--color-dali-violet)',
  'var(--color-dali-red)',
  'var(--color-dali-teal)',
]

// ── "Show More" state (paginated in batches, synced with URL + sessionStorage) ──
const BATCH_SIZE = 6
const STORAGE_KEY = 'posts-visible-extra'
const allPosts = ref<any[]>([])
const allPostsLoaded = ref(false)
const allPostsLoading = ref(false)

// Restore visibleExtra from URL query (?posts=N) — SSR-safe since route.query
// is available on both server and client.  sessionStorage is deferred to
// onMounted to avoid hydration mismatches.
const initialExtra = Number(route.query.posts) || 0
const visibleExtra = ref(initialExtra) // how many extra posts beyond the initial 6 to show

// If the URL already has ?posts=N, eagerly load all posts so they render immediately
if (initialExtra > 0) {
  loadAllPosts()
}

/** Persist visibleExtra to both the URL bar and sessionStorage.
 *  Uses history.replaceState (NOT router.replace) so clicking "Show More"
 *  never triggers Vue Router navigation, scroll behavior, or relocation. */
function syncState() {
  if (!import.meta.client) return

  // Silently update the URL bar — no routing side-effects
  const url = new URL(window.location.href)
  if (visibleExtra.value > 0) {
    url.searchParams.set('posts', String(visibleExtra.value))
  } else {
    url.searchParams.delete('posts')
  }
  // Preserve the #posts hash so the page stays anchored to the posts section.
  // Without it, reloading /?posts=6 would land at the hero instead of posts.
  url.hash = 'posts'
  window.history.replaceState(history.state, '', url.pathname + url.search + url.hash)

  // sessionStorage — survives cross-page navigation (blog → home)
  if (visibleExtra.value > 0) {
    sessionStorage.setItem(STORAGE_KEY, String(visibleExtra.value))
  } else {
    sessionStorage.removeItem(STORAGE_KEY)
  }
}

const extraPosts = computed(() => {
  if (!allPostsLoaded.value) return []
  const recentPaths = new Set(recentPosts.value.map(p => p.path))
  return allPosts.value.filter((p: any) => !recentPaths.has(p.path))
})

const visibleExtraPosts = computed(() => extraPosts.value.slice(0, visibleExtra.value))
const canShowMore = computed(() => {
  if (!allPostsLoaded.value) return true // haven't loaded yet, assume there's more
  return visibleExtra.value < extraPosts.value.length
})
const canShowLess = computed(() => visibleExtra.value > 0)

async function loadAllPosts() {
  if (allPostsLoaded.value || allPostsLoading.value) return
  allPostsLoading.value = true
  try {
    const query = queryCollection('blogs')
    if (!import.meta.dev) query.where('published', '=', true)
    const result = await query
      .select('title', 'date', 'description', 'tags', 'image', 'path')
      .order('date', 'DESC')
      .all()
    allPosts.value = result || []
    allPostsLoaded.value = true
  } catch (e) {
    console.warn('Failed to load all posts:', e)
  } finally {
    allPostsLoading.value = false
  }
}

async function showMore() {
  if (!allPostsLoaded.value) await loadAllPosts()
  visibleExtra.value = Math.min(visibleExtra.value + BATCH_SIZE, extraPosts.value.length)
  syncState()
}

function showLess() {
  visibleExtra.value = Math.max(visibleExtra.value - BATCH_SIZE, 0)
  syncState()
}

function scrollToPosts() {
  nextTick(() => {
    document.getElementById('posts')?.scrollIntoView({ behavior: 'smooth' })
  })
}

// ── Helpers ──
function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Template refs ──
const postsHeadingRef = ref<HTMLElement | null>(null)
const viewAllCardRef = ref<any>(null)
const postCardRefs = ref<any[]>([])

function setPostCardRef(el: any, idx: number) {
  if (el) postCardRefs.value[idx] = el
}

// ── Expose for parent ──
defineExpose({ showMore, scrollToPosts })

// ── Restore expansion state from sessionStorage (client-only, post-hydration) ──
onMounted(() => {
  // Only restore if the URL didn't already carry the state (avoids double-load)
  if (visibleExtra.value === 0) {
    const stored = Number(sessionStorage.getItem(STORAGE_KEY)) || 0
    if (stored > 0) {
      visibleExtra.value = stored
      loadAllPosts()
    }
  }
})

// ── GSAP scroll animations ──
onMounted(async () => {
  if (!import.meta.client) return
  await nextTick()

  const isMobile = window.innerWidth < 1024
  const { gsap } = await import('gsap')
  const { ScrollTrigger } = await import('gsap/ScrollTrigger')
  gsap.registerPlugin(ScrollTrigger)

  const scale = isMobile ? 0.4 : 1
  const ta = 'play none none reverse'

  // Heading
  if (postsHeadingRef.value) {
    gsap.fromTo(postsHeadingRef.value,
      { opacity: 0, x: -100 * scale, rotation: isMobile ? 0 : -5 },
      {
        opacity: 1, x: 0, rotation: 0,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: postsHeadingRef.value,
          start: 'top 85%',
          toggleActions: ta,
        },
      },
    )
  }

  // Post cards: explode from center with rotation (simpler on mobile)
  nextTick(() => {
    postCardRefs.value.forEach((cardRef, idx) => {
      const el = cardRef?.$el || cardRef
      if (!el) return

      if (isMobile) {
        gsap.fromTo(el,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0,
            duration: 0.5,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '#posts',
              start: 'top 70%',
              toggleActions: ta,
            },
            delay: idx * 0.08,
          },
        )
      } else {
        const angle = (idx / Math.max(postCardRefs.value.length, 1)) * Math.PI * 2 + Math.PI / 4
        const startX = Math.cos(angle) * 200
        const startY = Math.sin(angle) * 150
        const startRotation = (Math.random() - 0.5) * 30

        gsap.fromTo(el,
          { opacity: 0, x: -startX, y: -startY, rotation: startRotation, scale: 0.3 },
          {
            opacity: 1, x: 0, y: 0, rotation: 0, scale: 1,
            duration: 0.8,
            ease: 'back.out(1.2)',
            scrollTrigger: {
              trigger: '#posts',
              start: 'top 70%',
              toggleActions: ta,
            },
            delay: idx * 0.1,
          },
        )
      }
    })

    // Show More button
    const viewAllEl = viewAllCardRef.value?.$el || viewAllCardRef.value
    if (viewAllEl) {
      gsap.fromTo(viewAllEl,
        { opacity: 0, y: 20 },
        {
          opacity: 1, y: 0,
          duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '#posts',
            start: 'top 60%',
            toggleActions: ta,
          },
          delay: 0.7,
        },
      )
    }
  })
})
</script>

<style scoped>
.posts-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 2rem;
}

@media (min-width: 768px) {
  .posts-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .posts-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
