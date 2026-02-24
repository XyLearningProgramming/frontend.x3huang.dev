<template>
  <div class="relative min-h-screen">
    <!-- Floating decorative shapes (parallax background) -->
    <NeoFloatingShapes />

    <!-- Notion-style TOC (desktop) -->
    <NeoNotionToc :sections="tocSections" />

    <!-- ==================== HERO / CHATTY SECTION ==================== -->
    <section id="hero" class="relative min-h-screen flex items-center justify-center px-6 md:px-12 py-20">
      <div class="flex flex-col items-center text-center max-w-3xl mx-auto">
        <!-- Avatar — spring bounce in -->
        <div
          v-motion
          :initial="{ opacity: 0, scale: 0.5, y: 20 }"
          :enter="{ opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 12, delay: 100 } }"
          class="mb-6"
        >
          <div class="neo-card w-28 h-28 rounded-full mx-auto overflow-hidden flex items-center justify-center">
            <img
              v-show="!showFallback"
              :src="profile.image"
              :alt="profile.name"
              class="w-full h-full object-cover"
              @error="showFallback = true"
            >
            <span v-show="showFallback" class="text-3xl font-bold">
              {{ profile.initials }}
            </span>
          </div>
        </div>

        <!-- Name — fade up -->
        <h1
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 500, delay: 300 } }"
          class="text-neo-black mb-2"
        >
          {{ profile.name }}
        </h1>

        <!-- Subtitle -->
        <p
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 500, delay: 450 } }"
          class="text-lg md:text-xl text-neo-text-muted max-w-xl mb-2"
        >
          {{ profile.subtitle }}
        </p>

        <!-- Motto -->
        <p
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 500, delay: 600 } }"
          class="text-xl md:text-2xl font-bold text-neo-black max-w-2xl mb-10 italic"
        >
          "{{ profile.motto }}"
        </p>

        <!-- Chatty input (always visible) -->
        <div
          v-motion
          :initial="{ opacity: 0, y: 40 }"
          :enter="{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 14, delay: 800 } }"
          class="w-full max-w-2xl"
        >
          <!-- Powered by chatty note -->
          <div class="neo-card bg-neo-white p-1 mb-4">
            <div class="bg-neo-cyan/10 p-3">
              <p class="text-xs text-neo-text-muted">
                Powered by
                <a
                  href="https://github.com/XyLearningProgramming/chatty"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="underline font-bold text-neo-black"
                >chatty</a> &mdash; an open-source persona-driven chatbot.
                <span class="text-[10px] block mt-0.5">Expect 10-60s response times. Responses may be inaccurate.</span>
              </p>
            </div>
          </div>
          <ChatView @active-change="onChatActiveChange" />
        </div>
      </div>

      <!-- Scroll indicator -->
      <div
        v-motion
        :initial="{ opacity: 0 }"
        :enter="{ opacity: 1, transition: { duration: 800, delay: 1400 } }"
        class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-opacity duration-500"
        :class="{ 'opacity-0': hasScrolled }"
      >
        <span class="text-[10px] font-mono text-neo-text-muted uppercase tracking-widest">Scroll to explore</span>
        <svg class="w-5 h-5 text-neo-text-muted animate-bounce-gentle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>

    <!-- ==================== BLOG POSTS SECTION ==================== -->
    <section id="posts" class="relative px-6 md:px-12 py-16 md:py-24">
      <div class="mx-auto max-w-6xl">
        <!-- Section heading with colored strip -->
        <div
          v-motion
          :initial="{ opacity: 0, x: -60 }"
          :visibleOnce="{ opacity: 1, x: 0, transition: { type: 'spring', stiffness: 100, damping: 14 } }"
          class="mb-10"
        >
          <h2>
            <span class="bg-neo-cyan px-4 py-1.5 border-2 border-neo-black inline-block -rotate-1 shadow-neo-sm">
              Latest Posts
            </span>
          </h2>
        </div>

        <!-- Loading skeleton while posts load -->
        <div v-if="recentPosts.length === 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <div
            v-for="i in 3"
            :key="i"
            class="neo-card bg-neo-white p-5 animate-pulse"
          >
            <div class="h-3 w-20 bg-neo-black/10 rounded mb-3" />
            <div class="h-5 w-3/4 bg-neo-black/10 rounded mb-2" />
            <div class="h-4 w-full bg-neo-black/10 rounded mb-1" />
            <div class="h-4 w-2/3 bg-neo-black/10 rounded" />
            <div class="mt-3 flex gap-1">
              <div class="h-4 w-12 bg-neo-yellow/30 rounded" />
              <div class="h-4 w-14 bg-neo-yellow/30 rounded" />
            </div>
          </div>
        </div>

        <!-- Post cards grid — fly in alternating left/right -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <div
            v-for="(post, idx) in recentPosts"
            :key="post.path"
            v-motion
            :initial="{ opacity: 0, x: idx % 2 === 0 ? -80 : 80, y: 20 }"
            :visibleOnce="{
              opacity: 1, x: 0, y: 0,
              transition: { type: 'spring', stiffness: 100, damping: 14, delay: idx * 120 },
            }"
            class="neo-card bg-neo-white p-5 flex flex-col cursor-pointer card-tilt"
            @click="openPost(post)"
          >
            <span class="text-xs font-bold text-neo-text-muted mb-2">
              {{ formatDate(post.date) }}
            </span>
            <h3 class="text-lg font-bold mb-2 leading-tight">{{ post.title }}</h3>
            <p class="text-sm text-neo-text-muted flex-1">{{ post.description }}</p>
            <div v-if="post.tags?.length" class="mt-3 flex flex-wrap gap-1">
              <span
                v-for="tag in post.tags.slice(0, 3)"
                :key="tag"
                class="text-[10px] font-bold px-2 py-0.5 bg-neo-yellow/40 border border-neo-black"
              >
                {{ tag }}
              </span>
            </div>
            <span class="mt-3 text-xs font-bold text-neo-cyan flex items-center gap-1">
              Read more
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>

          <!-- "View All" as the last card in the grid -->
          <NuxtLink
            v-motion
            :initial="{ opacity: 0, scale: 0.9 }"
            :visibleOnce="{ opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 14, delay: recentPosts.length * 120 } }"
            to="/blogs"
            class="neo-card bg-neo-bg p-5 flex flex-col items-center justify-center text-center cursor-pointer card-tilt border-dashed"
          >
            <span class="text-3xl mb-3">📚</span>
            <span class="text-sm font-bold">View All Posts</span>
            <span class="text-xs text-neo-text-muted mt-1">Browse the full archive &rarr;</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ==================== MY DIGITAL SPACE SECTION ==================== -->
    <section id="space" class="relative px-6 md:px-12 py-16 md:py-24">
      <div class="mx-auto max-w-6xl">
        <!-- Section heading -->
        <div
          v-motion
          :initial="{ opacity: 0, x: 60 }"
          :visibleOnce="{ opacity: 1, x: 0, transition: { type: 'spring', stiffness: 100, damping: 14 } }"
          class="mb-10"
        >
          <h2>
            <span class="bg-neo-purple px-4 py-1.5 border-2 border-neo-black inline-block rotate-1 shadow-neo-sm">
              My Digital Space
            </span>
          </h2>
        </div>

        <!-- Photo Gallery — fly in from right -->
        <div
          v-motion
          :initial="{ opacity: 0, x: 100 }"
          :visibleOnce="{ opacity: 1, x: 0, transition: { type: 'spring', stiffness: 80, damping: 14, delay: 100 } }"
          class="mb-12"
        >
          <h3 class="text-lg font-bold mb-4">Gallery</h3>
          <NeoPhotoGallery @open-lightbox="openGallery" />
        </div>

        <!-- About & Contact cards — alternating fly in -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            v-motion
            :initial="{ opacity: 0, x: -80 }"
            :visibleOnce="{ opacity: 1, x: 0, transition: { type: 'spring', stiffness: 100, damping: 14, delay: 200 } }"
            class="neo-card bg-neo-white p-6 cursor-pointer card-tilt"
            @click="openAbout"
          >
            <h3 class="text-lg font-bold mb-2">About Me</h3>
            <p class="text-sm text-neo-text-muted">
              {{ siteConfig.author.bio }}. Learn more about my background, what I do, and what drives me.
            </p>
            <span class="mt-3 text-xs font-bold text-neo-purple flex items-center gap-1">
              Read more
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
          <div
            v-motion
            :initial="{ opacity: 0, x: 80 }"
            :visibleOnce="{ opacity: 1, x: 0, transition: { type: 'spring', stiffness: 100, damping: 14, delay: 350 } }"
            class="neo-card bg-neo-white p-6 cursor-pointer card-tilt"
            @click="openContact"
          >
            <h3 class="text-lg font-bold mb-2">Contact</h3>
            <p class="text-sm text-neo-text-muted">
              Get in touch via email, GitHub, or LinkedIn. Always happy to chat.
            </p>
            <span class="mt-3 text-xs font-bold text-neo-pink flex items-center gap-1">
              Get in touch
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== TOOLS SECTION ==================== -->
    <section id="tools" class="relative px-6 md:px-12 py-16 md:py-24">
      <div class="mx-auto max-w-6xl">
        <!-- Section heading -->
        <div
          v-motion
          :initial="{ opacity: 0, x: -60 }"
          :visibleOnce="{ opacity: 1, x: 0, transition: { type: 'spring', stiffness: 100, damping: 14 } }"
          class="mb-10"
        >
          <h2>
            <span class="bg-neo-orange px-4 py-1.5 border-2 border-neo-black inline-block -rotate-1 shadow-neo-sm">
              Dev Tools
            </span>
          </h2>
        </div>

        <!-- Tool cards — scale + float in staggered -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <NuxtLink
            v-for="(tool, idx) in tools"
            :key="tool.title"
            v-motion
            :initial="{ opacity: 0, scale: 0.85, y: 40 }"
            :visibleOnce="{
              opacity: 1, scale: 1, y: 0,
              transition: { type: 'spring', stiffness: 150, damping: 14, delay: idx * 150 },
            }"
            :to="tool.route"
            class="neo-card bg-neo-white p-5 card-tilt"
          >
            <span class="text-2xl block mb-2">{{ tool.icon }}</span>
            <h3 class="text-base font-bold mb-1">{{ tool.title }}</h3>
            <p class="text-sm text-neo-text-muted">{{ tool.description }}</p>
          </NuxtLink>
        </div>
        <div
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 500, delay: 300 } }"
          class="text-center"
        >
          <NuxtLink
            to="/tools"
            class="neo-btn inline-block bg-neo-white px-6 py-3 text-sm font-bold"
          >
            All Tools &rarr;
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ==================== FOOTER ==================== -->
    <section id="footer" class="relative bg-neo-black px-6 md:px-12 py-12">
      <div
        v-motion
        :initial="{ opacity: 0, y: 30 }"
        :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 600, delay: 100 } }"
        class="mx-auto max-w-6xl text-center text-neo-white"
      >
        <h2 class="text-neo-white mb-4">
          <span class="text-lg font-bold">{{ siteConfig.name }}</span>
        </h2>
        <div class="flex justify-center gap-4 mb-6">
          <a
            v-if="siteConfig.social.github"
            :href="siteConfig.social.github"
            target="_blank"
            rel="noopener noreferrer"
            class="neo-btn bg-neo-white text-neo-black px-4 py-2 text-sm font-bold"
          >
            GitHub
          </a>
          <a
            v-if="siteConfig.social.linkedin"
            :href="siteConfig.social.linkedin"
            target="_blank"
            rel="noopener noreferrer"
            class="neo-btn bg-neo-white text-neo-black px-4 py-2 text-sm font-bold"
          >
            LinkedIn
          </a>
          <a
            v-if="siteConfig.social.email"
            :href="`mailto:${siteConfig.social.email}`"
            class="neo-btn bg-neo-white text-neo-black px-4 py-2 text-sm font-bold"
          >
            Email
          </a>
        </div>
        <p class="text-sm text-white/60">
          Built with Nuxt, Vue, and Nuxt Content.
        </p>
        <p class="text-xs text-white/40 mt-1">
          &copy; {{ new Date().getFullYear() }} {{ siteConfig.author.name }}
        </p>
      </div>
    </section>

    <!-- ==================== SLIDE PANELS ==================== -->

    <!-- Post Detail Panel -->
    <NeoSlidePanel
      :open="!!activePost"
      :title="activePost?.title"
      @close="closePost"
    >
      <template v-if="activePost">
        <article>
          <header class="mb-8">
            <h1 class="mb-3">{{ activePost.title }}</h1>
            <div class="flex flex-wrap items-center gap-3 text-sm text-neo-text-muted mb-4">
              <span class="font-bold">{{ formatDate(activePost.date) }}</span>
              <span v-if="activePost.tags?.length" class="flex flex-wrap gap-1">
                <span
                  v-for="tag in activePost.tags"
                  :key="tag"
                  class="text-[10px] font-bold px-2 py-0.5 bg-neo-yellow/40 border border-neo-black"
                >
                  {{ tag }}
                </span>
              </span>
            </div>
          </header>
          <div v-if="activePostContent" class="blog-content neo-card bg-neo-white p-6 md:p-10">
            <ContentRenderer :value="activePostContent" />
          </div>
          <div v-else class="flex items-center justify-center py-12">
            <div class="w-8 h-8 border-4 border-neo-black border-t-neo-yellow rounded-full animate-spin" />
          </div>
          <div class="mt-8 text-center">
            <NuxtLink
              :to="activePost.path"
              class="neo-btn inline-block bg-neo-yellow px-6 py-3 text-sm font-bold"
            >
              Open Full Post &rarr;
            </NuxtLink>
          </div>
        </article>
      </template>
    </NeoSlidePanel>

    <!-- About Panel -->
    <NeoSlidePanel
      :open="panelMode === 'about'"
      title="About Me"
      @close="closePanel"
    >
      <div v-if="aboutContent" class="blog-content neo-card bg-neo-white p-6 md:p-10">
        <ContentRenderer :value="aboutContent" />
      </div>
      <div v-else class="flex items-center justify-center py-12">
        <div class="w-8 h-8 border-4 border-neo-black border-t-neo-yellow rounded-full animate-spin" />
      </div>
    </NeoSlidePanel>

    <!-- Contact Panel -->
    <NeoSlidePanel
      :open="panelMode === 'contact'"
      title="Get In Touch"
      @close="closePanel"
    >
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <!-- Email -->
        <a :href="`mailto:${siteConfig.social.email}`" class="neo-card bg-neo-white p-5 text-center card-tilt">
          <div class="text-4xl mb-3">📧</div>
          <h3 class="text-lg font-bold mb-1">Email</h3>
          <p class="text-sm text-neo-text-muted">{{ siteConfig.social.email }}</p>
        </a>
        <!-- GitHub -->
        <a :href="siteConfig.social.github" target="_blank" rel="noopener noreferrer" class="neo-card bg-neo-white p-5 text-center card-tilt">
          <div class="text-4xl mb-3">💻</div>
          <h3 class="text-lg font-bold mb-1">GitHub</h3>
          <p class="text-sm text-neo-text-muted">{{ siteConfig.social.github?.split('/').pop() }}</p>
        </a>
        <!-- LinkedIn -->
        <a :href="siteConfig.social.linkedin" target="_blank" rel="noopener noreferrer" class="neo-card bg-neo-white p-5 text-center card-tilt">
          <div class="text-4xl mb-3">💼</div>
          <h3 class="text-lg font-bold mb-1">LinkedIn</h3>
          <p class="text-sm text-neo-text-muted">{{ siteConfig.social.linkedin?.split('/').slice(-2).join('/') }}</p>
        </a>
        <!-- Resume -->
        <a href="/resume/20260111.pdf" target="_blank" rel="noopener noreferrer" class="neo-card bg-neo-white p-5 text-center card-tilt">
          <div class="text-4xl mb-3">📄</div>
          <h3 class="text-lg font-bold mb-1">Resume</h3>
          <p class="text-sm text-neo-text-muted">Download CV</p>
        </a>
      </div>
    </NeoSlidePanel>

    <!-- Gallery Lightbox Panel -->
    <NeoSlidePanel
      :open="panelMode === 'gallery'"
      :title="selectedGalleryImage?.title || 'Gallery'"
      @close="closePanel"
    >
      <div v-if="selectedGalleryImage" class="flex flex-col items-center">
        <div class="neo-card overflow-hidden mb-4 max-w-3xl w-full">
          <NuxtImg
            :src="selectedGalleryImage.url"
            :alt="selectedGalleryImage.alt || selectedGalleryImage.title || 'Photo'"
            class="w-full object-contain max-h-[70vh]"
          />
        </div>
        <div v-if="selectedGalleryImage.title || selectedGalleryImage.note" class="text-center max-w-xl">
          <p v-if="selectedGalleryImage.title" class="font-bold text-lg mb-1">{{ selectedGalleryImage.title }}</p>
          <p v-if="selectedGalleryImage.note" class="text-sm text-neo-text-muted italic">{{ selectedGalleryImage.note }}</p>
        </div>
      </div>
    </NeoSlidePanel>

    <!-- Mobile nav drawer trigger -->
    <button
      class="lg:hidden fixed bottom-6 right-6 z-50 neo-btn bg-neo-yellow text-neo-black p-3 rounded-full"
      aria-label="Open navigation"
      @click="toggleMobileNav"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>

    <!-- Mobile nav overlay -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="mobileNavOpen"
          class="lg:hidden fixed inset-0 z-50 bg-black/60"
          @click.self="mobileNavOpen = false"
        >
          <div class="absolute bottom-0 left-0 right-0 bg-neo-white border-t-4 border-neo-black p-6">
            <div class="flex justify-between items-center mb-4">
              <p class="text-xs font-bold uppercase tracking-widest text-neo-text-muted">Navigate</p>
              <button class="neo-btn bg-neo-white px-2 py-1 text-xs font-bold" @click="mobileNavOpen = false">
                Close
              </button>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <button
                v-for="section in tocSections"
                :key="section.id"
                class="neo-btn bg-neo-bg px-4 py-3 text-sm font-bold text-left"
                @click="scrollToSection(section.id)"
              >
                {{ section.label }}
              </button>
              <NuxtLink
                to="/blogs"
                class="neo-btn bg-neo-bg px-4 py-3 text-sm font-bold text-left"
                @click="mobileNavOpen = false"
              >
                All Posts
              </NuxtLink>
              <NuxtLink
                to="/tools"
                class="neo-btn bg-neo-bg px-4 py-3 text-sm font-bold text-left"
                @click="mobileNavOpen = false"
              >
                All Tools
              </NuxtLink>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import ChatView from '~/components/chat/ChatView.vue'
import { siteConfig, getPageMeta } from '~/site.config'
import type { ScrollSpySection } from '~/composables/useScrollSpy'
import type { GalleryImage } from '~/composables/useBackgroundGallery'

// ==================== STATE ====================
const showFallback = ref(false)
const mobileNavOpen = ref(false)
const chatActive = ref(false)
const hasScrolled = ref(false)

// Panel state
const panelMode = ref<'none' | 'about' | 'contact' | 'gallery'>('none')
const selectedGalleryImage = ref<GalleryImage | null>(null)

// ==================== TOC SECTIONS ====================
const tocSections: ScrollSpySection[] = [
  { id: 'hero', label: 'Home' },
  { id: 'posts', label: 'Posts' },
  { id: 'space', label: 'Space' },
  { id: 'tools', label: 'Tools' },
  { id: 'footer', label: 'Footer' },
]

// ==================== PROFILE ====================
const profile = {
  name: siteConfig.author.name,
  initials: siteConfig.author.name.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
  image: '/images/profile.png',
  motto: 'Code with passion, learn for life, run freely, and read deeply.',
  subtitle: siteConfig.author.bio,
}

// ==================== TOOLS ====================
const tools = [
  { title: 'Base64', icon: '🔐', description: 'Encode & decode Base64 strings', route: '/tools/base64' },
  { title: 'JSON', icon: '📋', description: 'Format & validate JSON', route: '/tools/json' },
  { title: 'JWT', icon: '🔑', description: 'Decode JWT tokens', route: '/tools/jwt' },
]

// ==================== BLOG POSTS ====================
interface BlogPost {
  path: string
  title: string
  description: string
  date: string
  tags?: string[]
}

// Fetch at top-level (SSR-compatible) so cards are always available immediately
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

const activePost = ref<BlogPost | null>(null)
const activePostContent = ref<any>(null)

// ==================== ABOUT CONTENT ====================
const aboutContent = ref<any>(null)

// ==================== METHODS ====================
function onChatActiveChange(active: boolean) {
  chatActive.value = active
}

function toggleMobileNav() {
  mobileNavOpen.value = !mobileNavOpen.value
}

function scrollToSection(id: string) {
  mobileNavOpen.value = false
  nextTick(() => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// --- Post panel ---
async function openPost(post: BlogPost) {
  activePost.value = post
  activePostContent.value = null
  updateHash(`post${post.path}`)
  try {
    const data = await queryCollection('blogs').path(post.path).first()
    activePostContent.value = data
  } catch (e) {
    console.warn('Failed to load post content:', e)
  }
}

function closePost() {
  activePost.value = null
  activePostContent.value = null
  clearHash()
}

// --- About / Contact / Gallery panels ---
async function openAbout() {
  panelMode.value = 'about'
  updateHash('about')
  if (!aboutContent.value) {
    try {
      const allPages = await queryCollection('pages').all()
      aboutContent.value = allPages.find((page: any) => page.path === '/pages/about')
    } catch (e) {
      console.warn('Failed to load about content:', e)
    }
  }
}

function openContact() {
  panelMode.value = 'contact'
  updateHash('contact')
}

function openGallery(image: GalleryImage) {
  selectedGalleryImage.value = image
  panelMode.value = 'gallery'
  updateHash('gallery')
}

function closePanel() {
  panelMode.value = 'none'
  selectedGalleryImage.value = null
  clearHash()
}

// --- Hash routing ---
function updateHash(hash: string) {
  if (import.meta.client) {
    window.history.pushState(null, '', `#${hash}`)
  }
}

function clearHash() {
  if (import.meta.client) {
    window.history.pushState(null, '', window.location.pathname)
  }
}

function onPopState() {
  const hash = window.location.hash.slice(1)
  if (!hash) {
    // Back to main page
    activePost.value = null
    activePostContent.value = null
    panelMode.value = 'none'
    selectedGalleryImage.value = null
  } else if (hash === 'about') {
    openAbout()
  } else if (hash === 'contact') {
    openContact()
  } else if (hash.startsWith('post/')) {
    const path = '/' + hash.slice(4) // hash is "post/blogs/slug" -> "/blogs/slug"
    const post = recentPosts.value.find(p => p.path === path)
    if (post) openPost(post)
  }
}

// Scroll tracking for scroll indicator
function onScroll() {
  hasScrolled.value = window.scrollY > 100
}

// ==================== LIFECYCLE ====================
const { initializeTracking, trackVisit } = useGoatCounter()

onMounted(async () => {
  // GoatCounter
  initializeTracking()
  trackVisit('/')

  // Scroll listener
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('popstate', onPopState)

  // Handle initial hash
  const hash = window.location.hash.slice(1)
  if (hash === 'about') openAbout()
  else if (hash === 'contact') openContact()
})

onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('popstate', onPopState)
  }
})

// ==================== SEO ====================
useHead(getPageMeta({
  description: siteConfig.description,
  url: siteConfig.url,
  type: 'website',
}))
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Card tilt hover effect */
.card-tilt {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.card-tilt:hover {
  transform: translate(-2px, -2px) rotate(-0.5deg);
  box-shadow: var(--shadow-neo-lg);
}
.card-tilt:active {
  transform: translate(0, 0) rotate(0deg);
  box-shadow: var(--shadow-neo-sm);
}

/* Gentle bounce for scroll indicator */
@keyframes bounceGentle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(6px); }
}
.animate-bounce-gentle {
  animation: bounceGentle 2s ease-in-out infinite;
}

/* Shadow utility */
.shadow-neo-sm {
  box-shadow: var(--shadow-neo-sm);
}
</style>
