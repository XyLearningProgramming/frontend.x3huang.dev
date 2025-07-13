<template>
  <button
    @click="handleLike"
    :disabled="isLiking"
    class="flex items-center gap-1 text-glass-muted hover:text-red-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
    :class="{ 'animate-pulse': isLiking }"
    :aria-label="liked ? 'Unlike this post' : 'Like this post'"
    :title="liked ? 'Unlike this post' : 'Like this post'"
  >
    <div class="relative">
      <svg
        class="w-4 h-4 transition-all duration-300"
        :class="liked ? 'text-red-400 scale-110' : 'group-hover:text-red-400'"
        :fill="liked ? 'currentColor' : 'none'"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="2" 
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
        />
      </svg>
      
      <!-- Sparkle animation on like -->
      <div
        v-if="showSparkle"
        class="absolute -top-1 -right-1 pointer-events-none"
      >
        <div class="animate-ping text-yellow-300">
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
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

const { trackLike, trackUnlike } = useGoatCounter()

// Local storage key for liked posts
const LIKED_POSTS_KEY = 'liked-blog-posts'

// Reactive state
const isLiking = ref(false)
const likeCount = ref(props.initialCount)
const liked = ref(false)
const showSparkle = ref(false)

// Check if current post is liked (client-side only to prevent hydration mismatch)
onMounted(() => {
  if (!import.meta.client) return
  
  try {
    const likedPosts = JSON.parse(localStorage.getItem(LIKED_POSTS_KEY) || '[]')
    liked.value = likedPosts.includes(props.slug)
  } catch {
    liked.value = false
  }
})

// Format large numbers with k/M suffixes
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

// Handle like/unlike action
const handleLike = async () => {
  if (isLiking.value || !import.meta.client) return

  isLiking.value = true

  try {
    const likedPosts = JSON.parse(localStorage.getItem(LIKED_POSTS_KEY) || '[]')
    
    if (liked.value) {
      // Unlike: remove from liked posts and track unlike
      const updatedLikedPosts = likedPosts.filter((slug: string) => slug !== props.slug)
      localStorage.setItem(LIKED_POSTS_KEY, JSON.stringify(updatedLikedPosts))
      liked.value = false
      likeCount.value = Math.max(0, likeCount.value - 1)
      
      // Track the unlike event
      trackUnlike(props.slug)
    } else {
      // Like: add to liked posts and track
      likedPosts.push(props.slug)
      localStorage.setItem(LIKED_POSTS_KEY, JSON.stringify(likedPosts))
      liked.value = true
      likeCount.value += 1
      
      // Track the like event
      trackLike(props.slug)
      
      // Show sparkle animation
      showSparkle.value = true
      setTimeout(() => {
        showSparkle.value = false
      }, 1000)
    }
  } catch (error) {
    console.error('Error handling like:', error)
  } finally {
    isLiking.value = false
  }
}
</script>

