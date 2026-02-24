<template>
  <button
    @click="handleLike"
    :disabled="isLiking || liked || cooldownActive"
    class="flex items-center gap-1 transition-all duration-300 disabled:opacity-50 group"
    :class="{ 
      'animate-pulse': isLiking,
      'text-neo-black/50 hover:text-neo-pink': !liked && !cooldownActive,
      'text-neo-orange': cooldownActive,
      'cursor-not-allowed': cooldownActive,
      'cursor-default': liked
    }"
    :aria-label="liked ? 'Liked' : cooldownActive ? `Wait ${cooldownSecondsLeft}s` : 'Like this post'"
    :title="liked ? '' : cooldownActive ? `Please wait ${cooldownSecondsLeft} seconds before liking again` : 'Like this post'"
  >
    <div class="relative">
      <svg
        class="w-4 h-4 transition-all duration-300"
        :class="{ 
          'scale-110 animate-bounce': showLikeAnimation,
          'text-neo-pink': liked,
          'text-neo-black/50': !liked
        }"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        viewBox="0 0 24 24"
      >
        <path 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
          :fill="liked ? 'var(--color-neo-pink)' : 'none'"
          :stroke="liked ? 'var(--color-neo-black)' : 'currentColor'"
        />
      </svg>
      
      <!-- Sparkle animation on like -->
      <div
        v-if="showSparkle"
        class="absolute -top-1 -right-1 pointer-events-none"
      >
        <div class="animate-ping text-neo-yellow">
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
      </div>

      <!-- Floating heart animation -->
      <div
        v-if="showFloatingHeart"
        class="absolute -top-2 left-1/2 transform -translate-x-1/2 pointer-events-none"
      >
        <div class="animate-ping text-neo-pink opacity-75">
          <svg class="w-3 h-3" fill="var(--color-neo-pink)" stroke="var(--color-neo-black)" stroke-width="1" viewBox="0 0 24 24">
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
      </div>
    </div>
    
    <span class="text-sm">
      {{ formatCount(likeCount) }}
      {{ likeCount === 1 ? 'like' : 'likes' }}
    </span>
  </button>
</template>

<script setup lang="ts">
interface Props {
  slug: string
  initialCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  initialCount: 0
})

const { trackLike } = useGoatCounter()

const LIKED_POSTS_KEY = 'liked-blog-posts'
const LAST_LIKE_TIME_KEY = 'last-like-times'

const isLiking = ref(false)
const likeCount = ref(props.initialCount)
const liked = ref(false)
const showSparkle = ref(false)
const showLikeAnimation = ref(false)
const showFloatingHeart = ref(false)
const cooldownActive = ref(false)
const cooldownSecondsLeft = ref(0)

const COOLDOWN_DURATION = 60 * 1000

onMounted(() => {
  if (!import.meta.client) return
  
  try {
    const likedPosts = JSON.parse(localStorage.getItem(LIKED_POSTS_KEY) || '[]')
    liked.value = likedPosts.includes(props.slug)
    checkCooldownStatus()
  } catch {
    liked.value = false
  }
})

const checkCooldownStatus = () => {
  if (!import.meta.client) return
  
  try {
    const lastLikeTimes = JSON.parse(localStorage.getItem(LAST_LIKE_TIME_KEY) || '{}')
    const lastLikeTime = lastLikeTimes[props.slug]
    if (lastLikeTime) {
      const timeSince = Date.now() - parseInt(lastLikeTime)
      if (timeSince < COOLDOWN_DURATION) {
        cooldownActive.value = true
        cooldownSecondsLeft.value = Math.ceil((COOLDOWN_DURATION - timeSince) / 1000)
        
        const timer = setInterval(() => {
          cooldownSecondsLeft.value--
          if (cooldownSecondsLeft.value <= 0) {
            cooldownActive.value = false
            clearInterval(timer)
          }
        }, 1000)
      }
    }
  } catch {
    // Ignore errors
  }
}

const formatCount = (count: number): string => {
  if (count === 0) return '0'
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`
  }
  return count.toString()
}

const handleLike = async () => {
  if (isLiking.value || !import.meta.client || liked.value || cooldownActive.value) return

  isLiking.value = true

  try {
    const likedPosts = JSON.parse(localStorage.getItem(LIKED_POSTS_KEY) || '[]')
    
    likedPosts.push(props.slug)
    localStorage.setItem(LIKED_POSTS_KEY, JSON.stringify(likedPosts))
    
    const lastLikeTimes = JSON.parse(localStorage.getItem(LAST_LIKE_TIME_KEY) || '{}')
    lastLikeTimes[props.slug] = Date.now().toString()
    localStorage.setItem(LAST_LIKE_TIME_KEY, JSON.stringify(lastLikeTimes))
    
    liked.value = true
    likeCount.value += 1
    
    trackLike(props.slug)
    
    showLikeAnimation.value = true
    showSparkle.value = true
    showFloatingHeart.value = true
    
    cooldownActive.value = true
    cooldownSecondsLeft.value = COOLDOWN_DURATION / 1000
    
    const timer = setInterval(() => {
      cooldownSecondsLeft.value--
      if (cooldownSecondsLeft.value <= 0) {
        cooldownActive.value = false
        clearInterval(timer)
      }
    }, 1000)
    
    setTimeout(() => {
      showLikeAnimation.value = false
      showSparkle.value = false
      showFloatingHeart.value = false
    }, 1000)
    
  } catch (error) {
    console.error('Error handling like:', error)
  } finally {
    isLiking.value = false
  }
}
</script>
