<template>
  <BackgroundLayout blur-background overlay-intensity="heavy" container-width="wide">
    <!-- Back button -->
    <NuxtLink :to="returnPath"
      class="inline-flex items-center gap-2 text-glass hover:text-glass-muted transition-colors mb-8">
      <IconsArrowLeft class="w-4 h-4" />
      Back to {{ returnTitle }}
    </NuxtLink>

    <!-- Game content -->
    <div v-if="gameExists" class="max-w-none">
      <!-- Game Header -->
      <header class="mb-6 text-center">
        <h1 class="text-4xl font-bold text-glass mb-4 text-shadow-strong">
          {{ gameTitle }}
        </h1>

        <div class="relative mb-4">
          <div class="absolute inset-0 bg-black/20 rounded-2xl blur-xl"></div>
          <div class="relative flex items-center justify-center gap-4 text-s text-glass-muted px-6 py-3">
            <span>Unity WebGL Game</span>
            <span>•</span>
            <span>{{ gameDescription }}</span>
          </div>
        </div>
      </header>

      <!-- Main Game Container -->
      <GlassCard variant="primary" padding="sm" radius="lg">
        <div class="text-center">
          <div class="relative w-full min-h-[70vh] max-h-[85vh] overflow-hidden">
            <iframe ref="gameFrame" :src="gameUrl" class="absolute inset-0 w-full h-full rounded-lg game-iframe"
              frameborder="0" allowfullscreen title="Game Frame" @load="onGameLoad"></iframe>
          </div>

          <!-- Game controls -->
          <div class="mt-4 flex justify-center gap-4">
            <button @click="requestFullscreen"
              class="px-4 py-2 glass-secondary rounded-lg text-glass-muted hover:bg-white/30 transition-colors"
              title="Fullscreen">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </button>

            <button @click="refreshGame"
              class="px-4 py-2 glass-secondary rounded-lg text-glass-muted hover:bg-white/30 transition-colors"
              title="Refresh Game">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </GlassCard>
    </div>

    <!-- Loading state -->
    <div v-else-if="loading" class="text-center py-12">
      <GlassCard variant="primary" padding="lg" radius="lg">
        <p class="text-glass">Loading game...</p>
      </GlassCard>
    </div>

    <!-- Game not found -->
    <div v-else class="text-center py-12">
      <GlassCard variant="primary" padding="lg" radius="lg">
        <h2 class="text-xl font-bold text-glass mb-4">Game Not Found</h2>
        <p class="text-glass-muted">The requested game could not be found.</p>
      </GlassCard>
    </div>
  </BackgroundLayout>
</template>

<script setup lang="ts">
import BackgroundLayout from '~/components/layouts/BackgroundLayout.vue'
import GlassCard from '~/components/ui/GlassCard.vue'
import IconsArrowLeft from '~/components/icons/arrowLeft.vue'

const route = useRoute()
const slug = route.params.slug as string

// Game state
const loading = ref(true)
const gameExists = ref(false)
const gameFrame = ref<HTMLIFrameElement | null>(null)

// Game info mapping
const gameInfo = {
  'glitch_garden': {
    title: 'Glitch Garden',
    description: 'A tower defense game where you defend your garden from glitched invaders using various plant defenders.'
  },
  'tile_vania': {
    title: 'Tile Vania',
    description: 'A classic 2D platformer adventure through mystical tile-based worlds filled with challenges and secrets.'
  },
  'flight_controller': {
    title: 'Flight Controller',
    description: 'A minimal demo showing control of a paper plane',
  }
}

// Computed properties
const gameTitle = computed(() => {
  const info = gameInfo[slug as keyof typeof gameInfo]
  return info?.title || slug.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
})

const gameDescription = computed(() => {
  const info = gameInfo[slug as keyof typeof gameInfo]
  return info?.description || 'An interactive Unity WebGL game experience.'
})

const gameUrl = computed(() => `/gamescontent/${slug}/`)

// History stack for back button
const returnPath = ref('/')
const returnTitle = ref('Home')

// Check if game exists
const checkGameExists = async () => {
  try {
    // Check if this is a known game first
    const knownGames = ['glitch_garden', 'tile_vania']
    if (knownGames.includes(slug)) {
      gameExists.value = true
      loading.value = false
      return
    }

    // For unknown games, try to fetch
    const response = await fetch(gameUrl.value)
    gameExists.value = response.ok
  } catch (error) {
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
  if (gameFrame.value) {
    if (gameFrame.value.requestFullscreen) {
      gameFrame.value.requestFullscreen()
    }
  }
}

const refreshGame = () => {
  if (gameFrame.value) {
    gameFrame.value.src = gameFrame.value.src
  }
}

// Map of route patterns to page titles
const getPageTitle = (path: string, search: string = '') => {
  if (path === '/') return 'Home'
  if (path === '/blogs' || path === '/blogs/') return 'Blog'
  if (path === '/blogs/timeline') return 'Timeline'
  if (path === '/blogs/tags') return 'Tags'
  if (path === '/blogs/about') return 'About'
  if (path === '/games') return 'Games'
  if (path.startsWith('/blogs/tags/')) {
    const tag = path.split('/blogs/tags/')[1]
    return `Posts tagged: ${decodeURIComponent(tag)}`
  }
  if (search && search.includes('tag=')) {
    const params = new URLSearchParams(search)
    const tag = params.get('tag')
    return tag ? `Posts tagged: ${tag}` : 'Blog'
  }
  return 'Previous Page'
}

// Initialize return path
onMounted(() => {
  if (import.meta.client) {
    // Check session storage for return path
    const savedReturnPath = sessionStorage.getItem('gameReturnPath')
    const savedReturnTitle = sessionStorage.getItem('gameReturnTitle')

    if (savedReturnPath) {
      returnPath.value = savedReturnPath
      returnTitle.value = savedReturnTitle || 'Previous Page'
      sessionStorage.removeItem('gameReturnPath')
      sessionStorage.removeItem('gameReturnTitle')
    } else {
      // Use referrer if available
      const referrer = document.referrer
      if (referrer) {
        try {
          const referrerUrl = new URL(referrer)
          if (referrerUrl.origin === window.location.origin) {
            const referrerPath = referrerUrl.pathname
            const referrerSearch = referrerUrl.search

            returnPath.value = referrerPath + referrerSearch
            returnTitle.value = getPageTitle(referrerPath, referrerSearch)
          }
        } catch (e) {
          // Invalid referrer, use default
        }
      }
    }
  }
})

// Check game availability on client side only
onMounted(() => {
  checkGameExists()
})

// SEO meta
useHead({
  title: computed(() => gameTitle.value),
  meta: [
    { name: 'description', content: computed(() => gameDescription.value) }
  ]
})
</script>

<style scoped>
.game-iframe {
  /* Custom scrollbar styling */
  scrollbar-width: thin;
  /* Firefox */
  scrollbar-color: rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.05);
  /* Firefox */
  overflow: auto;
}

/* Webkit browsers (Chrome, Safari, Edge) */
.game-iframe::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.game-iframe::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.game-iframe::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  transition: background 0.2s ease;
}

.game-iframe::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.game-iframe::-webkit-scrollbar-corner {
  background: rgba(255, 255, 255, 0.05);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .game-iframe {
    min-height: 60vh;
  }

  .game-iframe::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
}
</style>