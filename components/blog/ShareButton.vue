<template>
  <button
    class="relative flex items-center gap-1 transition-colors duration-200 font-bold"
    :class="justCopied
      ? 'text-neo-green'
      : 'text-neo-black/50 hover:text-neo-blue'"
    :aria-label="justCopied ? 'Link copied!' : 'Share this post'"
    :title="justCopied ? 'Link copied to clipboard!' : 'Share this post'"
    @click="handleShare"
  >
    <!-- Share icon -->
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
      />
    </svg>

    <span class="text-sm">
      <template v-if="justCopied">copied!</template>
      <template v-else>
        {{ formatCount(shareCount) }}
        {{ shareCount === 1 ? 'share' : 'shares' }}
      </template>
    </span>
  </button>
</template>

<script setup lang="ts">
import { siteConfig } from '~/site.config'

interface Props {
  slug: string
  initialCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  initialCount: 0,
})

const { trackShare } = useGoatCounter()

const shareCount = ref(props.initialCount)
const justCopied = ref(false)

const SHARED_POSTS_KEY = 'shared-blog-posts'

const formatCount = (count: number): string => {
  if (count === 0) return '0'
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`
  return count.toString()
}

const getShareUrl = (): string => {
  if (import.meta.client) {
    return window.location.href
  }
  return `${siteConfig.url}/blogs/${props.slug}`
}

const getShareTitle = (): string => {
  if (import.meta.client) {
    return document.title
  }
  return ''
}

const recordShare = (platform: string) => {
  if (!import.meta.client) return

  // Track via GoatCounter
  trackShare(props.slug, platform)

  // Record locally to increment displayed count
  try {
    const sharedPosts: Record<string, boolean> = JSON.parse(
      localStorage.getItem(SHARED_POSTS_KEY) || '{}',
    )
    if (!sharedPosts[props.slug]) {
      sharedPosts[props.slug] = true
      localStorage.setItem(SHARED_POSTS_KEY, JSON.stringify(sharedPosts))
      shareCount.value += 1
    }
  } catch {
    // Ignore localStorage errors
  }
}

const handleShare = async () => {
  if (!import.meta.client) return

  const url = getShareUrl()
  const title = getShareTitle()

  // Try Web Share API first (mobile / supported browsers)
  if (navigator.share) {
    try {
      await navigator.share({ title, url })
      recordShare('native')
      return
    } catch (err: any) {
      // User cancelled — don't fall through to clipboard
      if (err?.name === 'AbortError') return
    }
  }

  // Fallback: copy to clipboard
  try {
    await navigator.clipboard.writeText(url)
    recordShare('clipboard')
    justCopied.value = true
    setTimeout(() => {
      justCopied.value = false
    }, 2000)
  } catch {
    // Last resort: prompt-based copy
    window.prompt('Copy this link:', url)
    recordShare('prompt')
  }
}
</script>
