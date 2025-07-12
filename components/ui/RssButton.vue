<template>
  <div class="relative">
    <!-- RSS Button -->
    <button
      @click="showPopup = true"
      class="group inline-flex items-center gap-2 px-4 py-2 glass-primary rounded-lg border border-white/20 text-glass hover:text-white hover:border-white/40 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
    >
      <IconsRss class="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
      <span class="text-sm font-medium">RSS Feed</span>
    </button>

    <!-- Popup Modal -->
    <Teleport to="body">
      <div
        v-if="showPopup"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click="closePopup"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        
        <!-- Modal -->
        <div
          class="relative glass-primary rounded-2xl border border-white/20 p-6 max-w-md w-full shadow-2xl"
          @click.stop
        >
          <!-- Header -->
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-glass flex items-center gap-2">
              <IconsRss class="w-5 h-5" />
              RSS Feed
            </h3>
            <button
              @click="closePopup"
              class="text-glass-muted hover:text-glass transition-colors duration-200 p-1 rounded-lg hover:bg-white/10"
            >
              <IconsX class="w-5 h-5" />
            </button>
          </div>

          <!-- Description -->
          <p class="text-glass-muted text-sm mb-4">
            Subscribe to my blog posts with your favorite RSS reader.
          </p>

          <!-- RSS URL Input -->
          <div class="space-y-3">
            <label class="block text-sm font-medium text-glass">RSS Feed URL</label>
            <div class="relative">
              <input
                ref="urlInput"
                :value="rssUrl"
                readonly
                class="w-full px-3 py-2 pr-20 glass-secondary rounded-lg border border-white/20 text-glass text-sm focus:outline-none focus:ring-2 focus:ring-white/30 selection:bg-white/20"
              />
              <button
                @click="copyToClipboard"
                class="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 text-xs bg-white/20 hover:bg-white/30 rounded text-glass transition-colors duration-200"
              >
                {{ copied ? 'Copied!' : 'Copy' }}
              </button>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-2 mt-6">
            <a
              :href="rssUrl"
              target="_blank"
              class="flex-1 text-center px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-glass text-sm transition-colors duration-200"
            >
              Open RSS Feed
            </a>
            <button
              @click="closePopup"
              class="flex-1 px-4 py-2 glass-secondary border border-white/20 hover:border-white/40 rounded-lg text-glass text-sm transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import IconsRss from '~/components/icons/rss.vue'
import IconsX from '~/components/icons/x.vue'

const showPopup = ref(false)
const copied = ref(false)
const urlInput = ref<HTMLInputElement | null>(null)

const rssUrl = computed(() => {
  if (import.meta.client) {
    return `${window.location.origin}/blogs/rss.xml`
  }
  return '/blogs/rss.xml'
})

const closePopup = () => {
  showPopup.value = false
  copied.value = false
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(rssUrl.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    // Fallback for older browsers
    if (urlInput.value) {
      urlInput.value.select()
      urlInput.value.setSelectionRange(0, 99999)
      try {
        document.execCommand('copy')
        copied.value = true
        setTimeout(() => {
          copied.value = false
        }, 2000)
      } catch (fallbackErr) {
        console.warn('Copy to clipboard failed:', fallbackErr)
      }
    }
  }
}

// Close on escape key
onMounted(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closePopup()
    }
  }
  document.addEventListener('keydown', handleEscape)
  
  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape)
  })
})
</script>