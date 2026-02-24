<template>
  <div class="flex items-center gap-4 text-sm">
    <!-- Visit count -->
    <div v-if="showVisits && (analytics.visits > 0 || !loading)" class="flex items-center gap-1 text-neo-text-muted">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 5.197v1M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
      <span class="font-bold">
        {{ loading ? '...' : formatCount(analytics.visits) }}
        {{ analytics.visits === 1 ? 'visit' : 'visits' }}
      </span>
    </div>

    <!-- Like count -->
    <div v-if="showLikes" class="flex items-center gap-1 text-neo-text-muted">
      <template v-if="clickable && slug">
        <LikeButton :slug="slug" :initial-count="analytics.likes" />
      </template>
      <template v-else>
        <svg
          class="w-4 h-4"
          :class="isLiked ? 'text-neo-red' : 'text-neo-text-muted'"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            :fill="isLiked ? 'rgba(255, 107, 107, 0.2)' : 'none'"
          />
        </svg>
        <span class="font-bold">
          {{ loading ? '...' : formatCount(analytics.likes) }}
          {{ analytics.likes === 1 ? 'like' : 'likes' }}
        </span>
      </template>
    </div>

    <!-- Share count -->
    <div v-if="showShares" class="flex items-center gap-1 text-neo-text-muted">
      <template v-if="clickable">
        <button
          class="flex items-center gap-1 text-neo-text-muted hover:text-neo-blue transition-colors font-bold cursor-pointer"
          @click="highlightShareIcons"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
          <span>
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
        <span class="font-bold">
          {{ loading ? '...' : formatCount(analytics.shares) }}
          {{ analytics.shares === 1 ? 'share' : 'shares' }}
        </span>
      </template>
    </div>

    <!-- Loading indicator -->
    <div v-if="loading" class="flex items-center gap-1 text-neo-text-muted">
      <div class="w-4 h-4 animate-spin rounded-full border-2 border-neo-black border-t-neo-yellow" />
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
  clickable: true,
})

const LIKED_POSTS_KEY = 'liked-blog-posts'
const isLiked = ref(false)

onMounted(() => {
  if (!import.meta.client || !props.slug) return
  try {
    const likedPosts = JSON.parse(localStorage.getItem(LIKED_POSTS_KEY) || '[]')
    isLiked.value = likedPosts.includes(props.slug)
  }
  catch { isLiked.value = false }
})

const formatCount = (count: number): string => {
  if (count === 0) return '0'
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`
  return count.toString()
}

const highlightShareIcons = () => {
  if (!import.meta.client) return
  const shareContainer = document.querySelector('.fixed.right-4.bottom-4') as HTMLElement
  if (shareContainer) {
    shareContainer.style.outline = '3px solid var(--color-neo-yellow)'
    shareContainer.style.transition = 'outline 0.3s ease'
    shareContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    setTimeout(() => { shareContainer.style.outline = '' }, 3000)
  }
}
</script>
