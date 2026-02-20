<template>
  <div
    class="min-h-screen bg-gradient-to-br from-light-accent/20 to-dark-accent/20 dark:from-dark-accent/30 dark:to-light-accent/30 bg-cover bg-center bg-no-repeat relative"
    :style="{ backgroundImage: currentBackground ? `url(${currentBackground.url})` : 'none' }">
    <!-- Background overlay for better readability -->
    <div class="absolute inset-0 bg-black/20 dark:bg-black/40" />

    <!-- Photo notes (hidden when chat is active to avoid overlapping the input) -->
    <div v-if="currentBackground?.note && showFullLayout" class="absolute bottom-4 left-4 md:left-6 md:max-w-md">
      <div class="bg-black/30 backdrop-blur-sm rounded-lg p-3 text-white border border-white/20">
        <h4 v-if="currentBackground.title" class="font-medium text-sm mb-1">{{ currentBackground.title }}</h4>
        <p class="text-xs text-white/90">{{ currentBackground.note }}</p>
      </div>
    </div>

    <!-- Main content -->
    <div
      class="relative z-10 min-h-screen flex flex-col items-center p-8"
      :class="showFullLayout ? 'justify-center' : 'justify-start pt-6'"
    >
      <!-- Profile section -->
      <div class="text-center" :class="showFullLayout ? 'mb-12' : 'mb-4'">
        <!-- Profile photo -->
        <div v-if="showFullLayout" class="mb-6">
          <div
            class="w-32 h-32 rounded-full mx-auto shadow-2xl border-4 border-white/30 overflow-hidden bg-gradient-to-br from-light-accent to-dark-accent flex items-center justify-center ring-4 ring-white/10">
            <img v-show="!showFallback" :src="profile.image" :alt="profile.name" class="w-full h-full object-cover"
              @error="showFallback = true">
            <span v-show="showFallback" class="text-4xl text-white font-bold drop-shadow-lg">{{ profile.initials
              }}</span>
          </div>
        </div>

        <!-- Name and title -->
        <h1
          class="font-bold text-white drop-shadow-2xl text-shadow-strong"
          :class="showFullLayout ? 'text-4xl md:text-5xl mb-4' : 'text-2xl mb-2'"
        >
          {{ profile.name }}
        </h1>

        <!-- Motto/Introduction -->
        <div v-if="showFullLayout" class="relative">
          <div class="absolute inset-0 bg-black/20 rounded-2xl blur-xl" />
          <p
            class="relative text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed drop-shadow-xl text-shadow-medium px-6 py-2">
            {{ profile.subtitle }}
          </p>
          <p
            class="relative text-xl md:text-2xl text-white max-w-2xl mx-auto leading-relaxed drop-shadow-xl text-shadow-medium px-6 py-4 whitespace-nowrap">
            {{ profile.motto }}
          </p>
        </div>
      </div>

      <!-- Mode toggle -->
      <div class="flex justify-center mb-8 relative">
        <div class="inline-flex items-center bg-white/10 backdrop-blur-md rounded-full p-1 border border-white/20">
          <!-- Classical button -->
          <button
            @click="mode = 'home'"
            @mouseenter="hoverTarget = 'classical'"
            @mouseleave="hoverTarget = null"
            @touchstart.passive="onLongPressStart('classical')"
            @touchend.passive="onLongPressEnd"
            @touchcancel.passive="onLongPressEnd"
            class="px-6 py-2 rounded-full text-sm font-medium transition-all duration-200"
            :class="mode === 'home'
              ? 'bg-white/25 text-white shadow-lg'
              : 'text-white/60 hover:text-white/80'"
          >
            Classical
          </button>
          <!-- AI Chatbot button -->
          <button
            @click="mode = 'chat'"
            @mouseenter="hoverTarget = 'chatbot'"
            @mouseleave="hoverTarget = null"
            @touchstart.passive="onLongPressStart('chatbot')"
            @touchend.passive="onLongPressEnd"
            @touchcancel.passive="onLongPressEnd"
            class="px-6 py-2 rounded-full text-sm font-medium transition-all duration-200"
            :class="mode === 'chat'
              ? 'bg-white/25 text-white shadow-lg'
              : 'text-white/60 hover:text-white/80'"
          >
            Chatty
          </button>
        </div>

        <!-- Tooltip (hover / long-press) -->
        <Transition name="tooltip-fade">
          <div
            v-if="activeTooltip"
            class="absolute top-full mt-2 z-50 w-72 bg-black/60 backdrop-blur-lg rounded-xl border border-white/20 p-3 text-white shadow-2xl pointer-events-none"
          >
            <template v-if="activeTooltip === 'classical'">
              <p class="text-xs text-white/70 leading-relaxed">
                Browse the site through navigation cards -- blogs, tools, about, contact, and more.
              </p>
            </template>
            <template v-else>
              <p class="text-xs text-white/70 leading-relaxed mb-1.5">
                Powered by
                <a href="https://github.com/XyLearningProgramming/chatty" target="_blank" rel="noopener noreferrer" class="underline text-white/90 pointer-events-auto">chatty</a>,
                an open-source persona-driven chatbot running on a locally hosted small model.
              </p>
              <p class="text-xs text-white/50 leading-relaxed">
                Expect 10-60s response times depending on queue and query complexity.
              </p>
            </template>
          </div>
        </Transition>
      </div>

      <!-- Home mode content -->
      <template v-if="mode === 'home'">
        <!-- Navigation cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl w-full place-content-center">
          <template v-for="card in navigationCards" :key="card.title">
            <!-- Interactive card with route -->
            <NuxtLink v-if="card.route" :to="card.route" class="block group h-full">
              <Card variant="default" padding="lg" radius="lg" hover clickable
                class="bg-white/10 backdrop-blur-md border-white/20 text-center transition-all duration-300 group-hover:bg-white/20 group-hover:scale-105 h-full flex flex-col justify-between">
                <div class="text-white">
                  <div class="text-3xl mb-4">{{ card.icon }}</div>
                  <h3 class="text-xl font-semibold mb-2">{{ card.title }}</h3>
                  <p class="text-white/80 text-sm">{{ card.description }}</p>
                </div>
              </Card>
            </NuxtLink>
            <!-- Non-interactive card without route -->
            <div v-else class="h-full">
              <Card variant="default" padding="lg" radius="lg"
                class="bg-white/5 backdrop-blur-md border-white/10 text-center opacity-60 h-full flex flex-col justify-between cursor-not-allowed">
                <div class="text-white">
                  <div class="text-3xl mb-4">{{ card.icon }}</div>
                  <h3 class="text-xl font-semibold mb-2">{{ card.title }}</h3>
                  <p class="text-white/80 text-sm">{{ card.description }}</p>
                </div>
              </Card>
            </div>
          </template>
        </div>

        <!-- Footer note -->
        <div class="mt-12 text-center">
          <div class="mt-4 text-center">
            <p class="text-white/80 text-sm mb-2">
              {{ profile.welcomeMessage }}
            </p>
            <div class="flex justify-center">
              <VisitCounter path="/" singular-text="visitor to this site" plural-text="visitors to this site" />
            </div>
          </div>
        </div>
      </template>

      <!-- Chat mode content -->
      <template v-else>
        <ChatView @active-change="onChatActiveChange" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import Card from '~/components/ui/Card.vue'
import VisitCounter from '~/components/ui/VisitCounter.vue'
import ChatView from '~/components/chat/ChatView.vue'
import { siteConfig, getPageMeta } from '~/site.config'

const MODE_STORAGE_KEY = 'home-mode'
const mode = ref<'home' | 'chat'>('home')
const chatActive = ref(false)

const hoverTarget = ref<'classical' | 'chatbot' | null>(null)
const longPressTarget = ref<'classical' | 'chatbot' | null>(null)
let longPressTimer: ReturnType<typeof setTimeout> | null = null

const activeTooltip = computed(() => longPressTarget.value || hoverTarget.value)

function onLongPressStart(target: 'classical' | 'chatbot') {
  longPressTimer = setTimeout(() => { longPressTarget.value = target }, 400)
}

function onLongPressEnd() {
  if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null }
  longPressTarget.value = null
}

const showFullLayout = computed(() => mode.value === 'home' || !chatActive.value)

function onChatActiveChange(active: boolean) {
  chatActive.value = active
}

onMounted(() => {
  const saved = localStorage.getItem(MODE_STORAGE_KEY)
  if (saved === 'chat') mode.value = 'chat'
})

watch(mode, (val) => {
  if (import.meta.client) localStorage.setItem(MODE_STORAGE_KEY, val)
})

// ========== CUSTOMIZABLE CONTENT ==========
// Profile Information
const profile = {
  name: siteConfig.author.name,
  initials: siteConfig.author.name.split(' ').map(n => n[0]).join('').toUpperCase(),
  image: '/images/profile.png',
  motto: 'Code with passion, learn for life, run freely, and read deeply.',
  subtitle: siteConfig.author.bio,
  welcomeMessage: 'Welcome to my digital space powered by vue, nuxt, and nuxt content'
}

// Navigation Cards
const navigationCards = [
  {
    title: 'Blogs',
    icon: '📝',
    description: 'Technical articles and thoughts',
    route: '/blogs'
  },
  {
    title: 'Tools',
    icon: '🛠️',
    description: 'Useful utilities and converters',
    route: '/tools'
  },
  {
    title: 'About',
    icon: '👋',
    description: 'More about this site and me',
    route: '/about'
  },
  {
    title: 'Contact',
    icon: '💬',
    description: 'Get in touch with me',
    route: '/contact'
  },
  {
    title: '勉強中',
    icon: '🗒️',
    description: 'Japanese Grammar Notes from "新标日"',
    route: 'https://xylearningprogramming.github.io/nihongo_pages/'
  },
  {
    title: 'Life',
    icon: '🍾',
    description: 'Incoming - My book picks, hobbies, my life',
  },
]
// ========== END CUSTOMIZABLE CONTENT ==========

const { currentBackground, initializeBackground } = useBackgroundGallery()
const { initializeTracking, trackVisit } = useGoatCounter()
const showFallback = ref(false)

// Initialize background and tracking on mount
onMounted(() => {
  initializeBackground()
  initializeTracking()
  trackVisit('/')
})

onUnmounted(() => {
  if (longPressTimer) clearTimeout(longPressTimer)
})

// SEO meta using centralized config
useHead(getPageMeta({
  description: siteConfig.description,
  url: siteConfig.url,
  type: 'website'
}))
</script>

<style scoped>
.text-shadow-strong {
  text-shadow:
    0 2px 4px rgba(0, 0, 0, 0.8),
    0 4px 8px rgba(0, 0, 0, 0.6),
    0 8px 16px rgba(0, 0, 0, 0.4);
}

.text-shadow-medium {
  text-shadow:
    0 1px 2px rgba(0, 0, 0, 0.8),
    0 2px 4px rgba(0, 0, 0, 0.6),
    0 4px 8px rgba(0, 0, 0, 0.3);
}

.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>