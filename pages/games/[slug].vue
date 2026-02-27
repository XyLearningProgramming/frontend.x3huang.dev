<template>
  <LayoutsSubPageLayout
    :title="gameTitle"
    :back-to="backTo"
    :back-label="backLabel"
    max-width="wide"
  >
    <!-- Header -->
    <template #header>
      <div>
        <h1 class="text-dali-white mb-3">{{ gameTitle }}</h1>
        <p class="text-sm text-dali-white/60">
          {{ gameDescription }}
        </p>
      </div>
    </template>

    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center py-24">
      <div class="w-8 h-8 border-4 border-dali-red border-t-dali-gold rounded-full animate-spin" />
    </div>

    <!-- Game not found -->
    <div v-else-if="!gameExists" class="text-center py-24">
      <div class="text-4xl mb-4">404</div>
      <h2 class="text-xl font-bold text-dali-white mb-2">Game Not Found</h2>
      <p class="text-dali-muted mb-6">The requested game could not be found.</p>
      <NuxtLink to="/" class="dali-btn px-6 py-2">
        Back to Home
      </NuxtLink>
    </div>

    <!-- Game content -->
    <template v-else>
      <!-- Main Game Container -->
      <div class="border-2 border-dali-white/15 bg-dali-white/5 p-4 relative mb-8">
        <div class="relative w-full min-h-[70vh] max-h-[85vh] overflow-hidden border border-dali-white/10">
          <iframe
            ref="gameFrame"
            :src="gameUrl"
            class="absolute inset-0 w-full h-full"
            frameborder="0"
            allowfullscreen
            title="Game Frame"
            @load="onGameLoad"
          />
        </div>

        <!-- Game controls -->
        <div class="mt-4 flex justify-center gap-4">
          <button
            class="dali-btn bg-transparent text-dali-white border-dali-white/40 px-4 py-2 text-sm font-bold flex items-center gap-2 hover:border-dali-gold transition-colors"
            title="Fullscreen"
            @click="requestFullscreen"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
            </svg>
            Fullscreen
          </button>

          <button
            class="dali-btn bg-transparent text-dali-white border-dali-white/40 px-4 py-2 text-sm font-bold flex items-center gap-2 hover:border-dali-gold transition-colors"
            title="Refresh Game"
            @click="refreshGame"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      <!-- Comments -->
      <CommentSection
        :title="gameTitle"
        :thread-id="`/games/${slug}`"
        form-title="Share your thoughts on this game"
      />
    </template>
  </LayoutsSubPageLayout>
</template>

<script setup lang="ts">
import { siteConfig, getPageMeta } from '~/site.config'

const route = useRoute()
const slug = route.params.slug as string

// ── Smart back navigation ──
// If the user arrived from a blog post (or other sub-page), go back to it.
// Otherwise, fall back to the home page.
const backTo = computed(() => {
  if (!import.meta.client) return '/'
  const prev = window.history.state?.back as string | undefined
  // If we came from a sub-page (not the index), navigate back there
  if (prev && prev !== '/' && !prev.startsWith('/#') && !prev.startsWith('/?')) return prev
  return '/'
})

const backLabel = computed(() => (backTo.value === '/' ? 'Home' : 'Back'))

// Game state
const loading = ref(true)
const gameExists = ref(false)
const gameFrame = ref<HTMLIFrameElement | null>(null)

// Game info mapping
const gameInfo: Record<string, { title: string; description: string }> = {
  'glitch_garden': {
    title: 'Glitch Garden',
    description: 'A tower defense game where you defend your garden from glitched invaders using various plant defenders.',
  },
  'tile_vania': {
    title: 'Tile Vania',
    description: 'A classic 2D platformer adventure through mystical tile-based worlds filled with challenges and secrets.',
  },
  'flight_controller': {
    title: 'Flight Controller',
    description: 'A minimal demo showing control of a paper plane.',
  },
}

// Computed properties
const gameTitle = computed(() => {
  const info = gameInfo[slug]
  return info?.title || slug.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
})

const gameDescription = computed(() => {
  const info = gameInfo[slug]
  return info?.description || 'An interactive Unity WebGL game experience.'
})

const gameUrl = computed(() => `/gamescontent/${slug}/`)

// Check if game exists
const checkGameExists = async () => {
  try {
    const knownGames = ['glitch_garden', 'tile_vania', 'flight_controller']
    if (knownGames.includes(slug)) {
      gameExists.value = true
      loading.value = false
      return
    }

    // For unknown games, try to fetch
    const response = await fetch(gameUrl.value)
    gameExists.value = response.ok
  } catch {
    gameExists.value = false
  } finally {
    loading.value = false
  }
}

// Game event handlers
const onGameLoad = () => {
  console.log('Game loaded successfully')
}

const requestFullscreen = () => {
  if (gameFrame.value?.requestFullscreen) {
    gameFrame.value.requestFullscreen()
  }
}

const refreshGame = () => {
  if (gameFrame.value) {
    gameFrame.value.src = gameFrame.value.src
  }
}

// Check game availability on client side only
onMounted(() => {
  checkGameExists()
})

// SEO
useHead(getPageMeta({
  title: `${gameTitle.value} - ${siteConfig.name}`,
  description: gameDescription.value,
  url: `${siteConfig.url}/games/${slug}`,
}))
</script>
