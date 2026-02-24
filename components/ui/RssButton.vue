<template>
  <div class="relative">
    <!-- RSS Button -->
    <button
      @click="showPopup = true"
      class="group inline-flex items-center gap-2 px-4 py-2 neo-border bg-neo-yellow text-neo-black hover:bg-neo-orange transition-all duration-200 hover:scale-[1.02] font-bold rounded-none"
      style="box-shadow: 4px 4px 0px 0px #000;"
    >
      <IconsRss class="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
      <span class="text-sm font-bold">RSS Feed</span>
    </button>

    <!-- Popup Modal -->
    <Teleport to="body">
      <div
        v-if="showPopup"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click="closePopup"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-neo-black/60"></div>
        
        <!-- Modal -->
        <div
          class="relative neo-border bg-neo-bg p-6 max-w-md w-full rounded-none"
          style="box-shadow: 8px 8px 0px 0px #000;"
          @click.stop
        >
          <!-- Header -->
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold font-neo-heading text-neo-black flex items-center gap-2">
              <IconsRss class="w-5 h-5" />
              RSS Feed
            </h3>
            <button
              @click="closePopup"
              class="text-neo-black/50 hover:text-neo-black transition-colors duration-200 p-1 neo-border hover:bg-neo-yellow"
            >
              <IconsX class="w-5 h-5" />
            </button>
          </div>

          <!-- Description -->
          <p class="text-neo-black/70 text-sm mb-4">
            Subscribe to my blog posts with your favorite RSS reader.
          </p>

          <!-- RSS URL Input -->
          <div class="space-y-3">
            <label class="block text-sm font-bold text-neo-black">RSS Feed URL</label>
            <div class="relative">
              <input
                ref="urlInput"
                :value="rssUrl"
                readonly
                class="w-full px-3 py-2 pr-20 neo-border bg-neo-bg text-neo-black text-sm focus:outline-none rounded-none"
              />
              <button
                @click="copyToClipboard"
                class="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 text-xs neo-border bg-neo-yellow hover:bg-neo-orange text-neo-black transition-colors duration-200 rounded-none font-bold"
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
              class="flex-1 text-center px-4 py-2 neo-border bg-neo-blue hover:bg-neo-cyan text-neo-black text-sm transition-colors duration-200 rounded-none font-bold"
            >
              Open RSS Feed
            </a>
            <button
              @click="closePopup"
              class="flex-1 px-4 py-2 neo-border bg-neo-bg hover:bg-neo-yellow text-neo-black text-sm transition-all duration-200 rounded-none font-bold"
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
