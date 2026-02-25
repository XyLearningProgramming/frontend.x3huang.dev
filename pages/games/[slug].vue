<template>
  <div class="min-h-screen bg-neo-bg text-neo-black py-16 px-4">
    <div class="container mx-auto max-w-screen-xl">
      <!-- Back button -->
      <div class="mb-6">
        <NuxtLink :to="returnPath"
          class="inline-flex items-center gap-2 text-neo-black/70 hover:text-neo-black transition-colors">
          <IconsArrowLeft class="w-4 h-4" />
          Back to {{ returnTitle }}
        </NuxtLink>
      </div>

      <!-- Game content -->
      <div v-if="gameExists" class="max-w-none">
        <!-- Game Header -->
        <header class="mb-6 text-center">
          <h1 class="font-neo-heading text-h2-sm md:text-h2 font-bold mb-2">
            {{ gameTitle }}
          </h1>
          <p class="text-lg text-neo-black/70">
            {{ gameDescription }}
          </p>
        </header>

        <!-- Main Game Container -->
        <div class="neo-border bg-neo-bg p-4 relative" style="box-shadow: 6px 6px 0px 0px #000;">
          <div class="text-center">
            <div class="relative w-full min-h-[70vh] max-h-[85vh] overflow-hidden neo-border">
              <iframe ref="gameFrame" :src="gameUrl" class="absolute inset-0 w-full h-full"
                frameborder="0" allowfullscreen title="Game Frame" @load="onGameLoad"></iframe>
            </div>

            <!-- Game controls -->
            <div class="mt-4 flex justify-center gap-4">
              <button @click="requestFullscreen"
                class="px-4 py-2 neo-border bg-neo-bg hover:bg-neo-yellow text-neo-black transition-colors rounded-none"
                style="box-shadow: 2px 2px 0px 0px #000;"
                title="Fullscreen">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </button>

              <button @click="refreshGame"
                class="px-4 py-2 neo-border bg-neo-bg hover:bg-neo-yellow text-neo-black transition-colors rounded-none"
                style="box-shadow: 2px 2px 0px 0px #000;"
                title="Refresh Game">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading state -->
      <div v-else-if="loading" class="text-center py-12">
        <div class="neo-border bg-neo-bg p-8 max-w-md mx-auto" style="box-shadow: 4px 4px 0px 0px #000;">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-neo-black/60 mx-auto mb-4"></div>
          <p class="text-neo-black">Loading game...</p>
        </div>
      </div>

      <!-- Game not found -->
      <div v-else class="text-center py-12">
        <div class="neo-border bg-neo-bg p-8 max-w-md mx-auto" style="box-shadow: 4px 4px 0px 0px #000;">
          <h2 class="text-xl font-bold text-neo-black mb-4">Game Not Found</h2>
          <p class="text-neo-black/70">The requested game could not be found.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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
  if (path === '/games') return 'Games'
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
