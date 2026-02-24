<template>
  <div class="video-embed-container my-4">
    <div class="neo-border bg-neo-bg relative overflow-hidden" style="box-shadow: 4px 4px 0px 0px #000;">
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
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 neo-border bg-neo-yellow flex items-center justify-center hover:bg-neo-orange transition-colors"
              style="box-shadow: 4px 4px 0px 0px #000;">
              <svg class="w-6 h-6 text-neo-black ml-1" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
          
          <!-- Video Player when playing -->
          <div v-else class="relative w-full h-full bg-neo-black">
            <div class="absolute top-0 right-0 z-10 p-2">
              <button
                class="neo-border bg-neo-bg text-neo-black p-1 hover:bg-neo-yellow transition-colors"
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
        <div class="p-3 border-t-2 border-neo-black">
          <div class="flex items-start justify-between gap-2 mb-1">
            <h4 class="text-base font-bold text-neo-black line-clamp-2">{{ title }}</h4>
            <a 
              :href="url" 
              target="_blank" 
              rel="noopener noreferrer"
              class="flex items-center justify-center w-6 h-6 neo-border bg-neo-bg hover:bg-neo-yellow transition-colors flex-shrink-0"
              title="Open in new tab"
            >
              <svg class="w-3.5 h-3.5 text-neo-black" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z"/>
              </svg>
            </a>
          </div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs font-bold text-neo-black/70">{{ platform }}</span>
            <span v-if="duration" class="text-[10px] font-bold px-2 py-0.5 bg-neo-yellow/40 border border-neo-black">{{ duration }}</span>
          </div>
          <p v-if="description" class="text-xs text-neo-black/70 line-clamp-2">{{ description }}</p>
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
