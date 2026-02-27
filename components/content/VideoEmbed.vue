<template>
  <div class="video-embed-container my-4">
    <div class="video-card relative overflow-hidden">
      <div class="video-content">
        <!-- Video Display -->
        <div class="relative w-full aspect-video overflow-hidden">
          <!-- Thumbnail when not playing -->
          <div v-if="!isPlaying" class="relative w-full h-full cursor-pointer" @click="handlePlay(url)">
            <img
              :src="thumbnailUrl"
              :alt="title"
              class="w-full h-full object-cover"
            >
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 video-play-btn flex items-center justify-center transition-colors">
              <svg class="w-6 h-6 ml-1 video-play-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
          
          <!-- Video Player when playing -->
          <div v-else class="relative w-full h-full" style="background: #0B0B0F;">
            <div class="absolute top-0 right-0 z-10 p-2">
              <button
                class="video-close-btn p-1 transition-colors"
                aria-label="Close video"
                @click="handleClose"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
            <iframe
              :src="embedUrl"
              class="w-full h-full border-none"
              frameborder="0"
              allowfullscreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            />
          </div>
        </div>
        
        <!-- Video Info -->
        <div class="video-info p-3">
          <div class="flex items-start justify-between gap-2 mb-1">
            <h4 class="video-title text-base font-bold line-clamp-2">{{ title }}</h4>
            <a 
              :href="url" 
              target="_blank" 
              rel="noopener noreferrer"
              class="video-external-link flex items-center justify-center w-6 h-6 transition-colors flex-shrink-0"
              title="Open in new tab"
            >
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z"/>
              </svg>
            </a>
          </div>
          <div class="flex items-center gap-2 mb-1">
            <span class="video-platform text-xs font-bold">{{ platform }}</span>
            <span v-if="duration" class="video-duration text-[10px] font-bold px-2 py-0.5">{{ duration }}</span>
          </div>
          <p v-if="description" class="video-desc text-xs line-clamp-2">{{ description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  url: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  duration: {
    type: String,
    default: ''
  },
  thumbnail: {
    type: String,
    default: ''
  },
  autoplay: {
    type: Boolean,
    default: false
  }
})

const isPlaying = ref(props.autoplay)
const embedUrl = ref('')

const videoInfo = computed(() => {
  const url = props.url
  
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const youtubeMatch = url.match(youtubeRegex)
  
  if (youtubeMatch) {
    return {
      platform: 'YouTube',
      id: youtubeMatch[1],
      embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1`
    }
  }
  
  const bilibiliRegex = /(?:bilibili\.com\/video\/)([^\/\?]+)/
  const bilibiliMatch = url.match(bilibiliRegex)
  
  if (bilibiliMatch) {
    return {
      platform: 'Bilibili',
      id: bilibiliMatch[1],
      embedUrl: `https://player.bilibili.com/player.html?bvid=${bilibiliMatch[1]}&autoplay=1`
    }
  }
  
  const vimeoRegex = /(?:vimeo\.com\/)([0-9]+)/
  const vimeoMatch = url.match(vimeoRegex)
  
  if (vimeoMatch) {
    return {
      platform: 'Vimeo',
      id: vimeoMatch[1],
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`
    }
  }
  
  return {
    platform: 'Video',
    id: '',
    embedUrl: url
  }
})

const platform = computed(() => videoInfo.value.platform)

const thumbnailUrl = computed(() => {
  if (props.thumbnail) {
    return props.thumbnail
  }
  
  if (videoInfo.value.platform === 'YouTube' && videoInfo.value.id) {
    return `https://img.youtube.com/vi/${videoInfo.value.id}/maxresdefault.jpg`
  }
  
  if (videoInfo.value.platform === 'Bilibili' && videoInfo.value.id) {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiBmaWxsPSIjRkI3Mjk5Ii8+Cjx0ZXh0IHg9IjE2MCIgeT0iOTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5CaWxpYmlsaTwvdGV4dD4KPC9zdmc+'
  }
  
  if (videoInfo.value.platform === 'Vimeo' && videoInfo.value.id) {
    return `https://vumbnail.com/${videoInfo.value.id}.jpg`
  }
  
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiBmaWxsPSIjMzMzIi8+CjxwYXRoIGQ9Ik0xNDAgMTAwTDE4MCA4MFYxMjBMMTQwIDEwMFoiIGZpbGw9IiM2NjYiLz4KPC9zdmc+'
})

const handlePlay = (url) => {
  embedUrl.value = videoInfo.value.embedUrl
  isPlaying.value = true
}

const handleClose = () => {
  isPlaying.value = false
  embedUrl.value = ''
}

onMounted(() => {
  const handleEscape = (event) => {
    if (event.key === 'Escape' && isPlaying.value) {
      handleClose()
    }
  }
  
  document.addEventListener('keydown', handleEscape)
  
  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape)
  })
})
</script>

<style scoped>
/* Dark-native video card — works on the dali-focus-surface dark bg */
.video-card {
  background: rgba(240, 237, 229, 0.05) !important;
  border: 1px solid rgba(240, 237, 229, 0.12) !important;
  box-shadow: 4px 4px 0px 0px rgba(240, 237, 229, 0.08);
}

.video-card:hover {
  background: rgba(240, 237, 229, 0.08) !important;
  border-color: rgba(240, 237, 229, 0.2) !important;
}

.video-info {
  border-top: 1px solid rgba(240, 237, 229, 0.12) !important;
}

.video-title {
  color: #F0EDE5 !important;
}

.video-platform {
  color: rgba(240, 237, 229, 0.55) !important;
}

.video-duration {
  color: #F0EDE5 !important;
  background: rgba(212, 168, 67, 0.25) !important;
  border: 1px solid rgba(212, 168, 67, 0.4) !important;
}

.video-desc {
  color: rgba(240, 237, 229, 0.65) !important;
}

.video-external-link {
  border: 1px solid rgba(240, 237, 229, 0.15) !important;
  background: rgba(240, 237, 229, 0.05) !important;
  color: rgba(240, 237, 229, 0.6) !important;
}

.video-external-link:hover {
  background: rgba(212, 168, 67, 0.3) !important;
  border-color: rgba(212, 168, 67, 0.5) !important;
  color: #F0EDE5 !important;
}

.video-play-btn {
  background: var(--color-dali-red, #ED1C24) !important;
  border: 2px solid rgba(240, 237, 229, 0.9) !important;
  box-shadow: 4px 4px 0px 0px rgba(0, 0, 0, 0.4);
}

.video-play-btn:hover {
  background: var(--color-dali-gold, #D4A843) !important;
}

.video-play-icon {
  color: #F0EDE5 !important;
}

.video-close-btn {
  border: 1px solid rgba(240, 237, 229, 0.2) !important;
  background: rgba(11, 11, 15, 0.7) !important;
  color: rgba(240, 237, 229, 0.8) !important;
}

.video-close-btn:hover {
  background: var(--color-dali-red, #ED1C24) !important;
  color: #F0EDE5 !important;
}
</style>
