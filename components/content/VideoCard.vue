<template>
  <div class="video-card-wrapper">
    <GlassCard
      variant="primary"
      class="video-card"
    >
      <div class="video-content">
        <!-- Video Thumbnail -->
        <div class="video-thumbnail" @click="handleClick">
          <img
            :src="thumbnailUrl"
            :alt="title"
            class="thumbnail-image"
          />
          <div class="play-overlay">
            <svg class="play-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
        
        <!-- Video Info -->
        <div class="video-info">
          <div class="video-header">
            <h4 class="video-title text-glass">{{ title }}</h4>
            <a 
              :href="url" 
              target="_blank" 
              rel="noopener noreferrer"
              class="external-link"
              title="Open in new tab"
            >
              <svg class="external-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z"/>
              </svg>
            </a>
          </div>
          <div class="video-meta">
            <span class="video-platform text-glass-muted">{{ platform }}</span>
            <span v-if="duration" class="video-duration text-glass-subtle">{{ duration }}</span>
          </div>
          <p v-if="description" class="video-description text-glass-muted">{{ description }}</p>
        </div>
      </div>
    </GlassCard>
  </div>
</template>

<script setup>
import GlassCard from '../ui/GlassCard.vue'

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
  }
})

const emit = defineEmits(['play'])

// Extract video platform and ID from URL
const videoInfo = computed(() => {
  const url = props.url
  
  // YouTube patterns
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const youtubeMatch = url.match(youtubeRegex)
  
  if (youtubeMatch) {
    return {
      platform: 'YouTube',
      id: youtubeMatch[1],
      embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1`
    }
  }
  
  // Vimeo patterns
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
  
  // Generate thumbnail URL based on platform
  if (videoInfo.value.platform === 'YouTube' && videoInfo.value.id) {
    return `https://img.youtube.com/vi/${videoInfo.value.id}/maxresdefault.jpg`
  }
  
  if (videoInfo.value.platform === 'Vimeo' && videoInfo.value.id) {
    // For Vimeo, we'd need to make an API call to get the thumbnail
    // For now, return a placeholder
    return `https://vumbnail.com/${videoInfo.value.id}.jpg`
  }
  
  // Default placeholder
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiBmaWxsPSIjMzMzIi8+CjxwYXRoIGQ9Ik0xNDAgMTAwTDE4MCA4MFYxMjBMMTQwIDEwMFoiIGZpbGw9IiM2NjYiLz4KPC9zdmc+'
})

const handleClick = () => {
  emit('play', videoInfo.value.embedUrl)
}
</script>

<style scoped>
.video-card-wrapper {
  margin: 1rem 0;
}

.video-card {
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid;
  transition: all 0.2s ease;
}

.video-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.video-content {
  position: relative;
}

.video-thumbnail {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  overflow: hidden;
  cursor: pointer;
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s ease;
}

.video-thumbnail:hover .thumbnail-image {
  transform: scale(1.02);
}

.play-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50px;
  height: 50px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(5px);
  transition: all 0.2s ease;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.video-thumbnail:hover .play-overlay {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translate(-50%, -50%) scale(1.05);
}

.play-icon {
  width: 20px;
  height: 20px;
  color: white;
  margin-left: 2px;
}

.video-info {
  padding: 12px;
  background: rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(3px);
}

.video-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}

.video-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  line-height: 1.3;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  overflow: hidden;
}

.external-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  transition: all 0.2s ease;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  flex-shrink: 0;
}

.external-link:hover {
  background: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.9);
  transform: translateY(-1px);
}

.external-icon {
  width: 14px;
  height: 14px;
}

.video-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.video-platform {
  font-size: 13px;
  font-weight: 500;
}

.video-duration {
  font-size: 11px;
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 3px;
  backdrop-filter: blur(3px);
}

.video-description {
  font-size: 13px;
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  overflow: hidden;
}
</style>