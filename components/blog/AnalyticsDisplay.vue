<template>
  <div class="flex items-center gap-4 text-sm">
    <!-- Visit count -->
    <div v-if="showVisits && (analytics.visits > 0 || !loading)" class="flex items-center gap-1 text-glass-muted">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 5.197v1M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
      <span>
        {{ loading ? '...' : formatCount(analytics.visits) }}
        {{ analytics.visits === 1 ? 'visit' : 'visits' }}
      </span>
    </div>

    <!-- Like count/button -->
    <div v-if="showLikes" class="flex items-center gap-1 text-glass-muted">
      <template v-if="clickable && slug">
        <LikeButton :slug="slug" :initial-count="analytics.likes" />
      </template>
      <template v-else>
        <svg 
          class="w-4 h-4 transition-all duration-300"
          :class="isLiked ? 'text-rose-400' : 'text-glass-muted'"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          viewBox="0 0 24 24"
        >
          <path 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
            :fill="isLiked ? 'rgba(251, 113, 133, 0.1)' : 'none'"
            :stroke="isLiked ? 'rgba(251, 113, 133, 0.6)' : 'currentColor'"
          />
        </svg>
        <span class="text-sm">
          {{ loading ? '...' : formatCount(analytics.likes) }}
          {{ analytics.likes === 1 ? 'like' : 'likes' }}
        </span>
      </template>
    </div>

    <!-- Share count/button -->
    <div v-if="showShares" class="flex items-center gap-1 text-glass-muted">
      <template v-if="clickable">
        <button 
          @click="highlightShareIcons"
          class="flex items-center gap-1 text-glass-muted hover:text-blue-400 transition-all duration-300 group cursor-pointer"
          :title="analytics.shares > 0 ? 'Click to share this post' : 'Share this post using the icons in bottom right'"
        >
          <svg class="w-4 h-4 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
          <span class="text-sm">
            {{ loading ? '...' : formatCount(analytics.shares) }}
            {{ analytics.shares === 1 ? 'share' : 'shares' }}
          </span>
        </button>
      </template>
      <template v-else>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
        </svg>
        <span class="text-sm">
          {{ loading ? '...' : formatCount(analytics.shares) }}
          {{ analytics.shares === 1 ? 'share' : 'shares' }}
        </span>
      </template>
    </div>

    <!-- Loading indicator -->
    <div v-if="loading" class="flex items-center gap-1 text-glass-muted">
      <div class="w-4 h-4 animate-spin rounded-full border-2 border-glass-muted border-t-transparent"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LikeButton from './LikeButton.vue'

interface Analytics {
  visits: number
  likes: number
  shares: number
}

interface Props {
  slug?: string
  analytics: Analytics
  loading?: boolean
  showVisits?: boolean
  showLikes?: boolean
  showShares?: boolean
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  analytics: () => ({ visits: 0, likes: 0, shares: 0 }),
  loading: false,
  showVisits: true,
  showLikes: true,
  showShares: true,
  clickable: true
})

// Like status tracking
const LIKED_POSTS_KEY = 'liked-blog-posts'
const isLiked = ref(false)

// Check if current post is liked
onMounted(() => {
  if (!import.meta.client || !props.slug) return
  
  try {
    const likedPosts = JSON.parse(localStorage.getItem(LIKED_POSTS_KEY) || '[]')
    isLiked.value = likedPosts.includes(props.slug)
  } catch {
    isLiked.value = false
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

// Highlight share icons in bottom right
const highlightShareIcons = () => {
  if (!import.meta.client) return

  // Find the share icons container
  const shareContainer = document.querySelector('.fixed.right-4.bottom-4') as HTMLElement
  if (shareContainer) {
    // Add subtle glow effect to the background only
    shareContainer.style.background = 'rgba(251, 191, 36, 0.2)'
    shareContainer.style.backdropFilter = 'blur(6px)'
    shareContainer.style.transition = 'all 0.3s ease-in-out'

    // Scroll to make sure it's visible
    shareContainer.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest'
    })

    // Remove highlight after animation
    setTimeout(() => {
      shareContainer.style.background = ''
      shareContainer.style.backdropFilter = ''
      shareContainer.style.transition = ''
    }, 3000)
  }
}
</script>