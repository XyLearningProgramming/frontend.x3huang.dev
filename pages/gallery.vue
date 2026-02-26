<template>
  <LayoutsSubPageLayout
    :title="pageTitle"
    back-to="/#space"
    back-label="Home"
    max-width="default"
  >
    <!-- Single image lightbox view (when ?img=N) -->
    <div v-if="selectedImage" class="flex flex-col items-center">
      <div class="overflow-hidden mb-6 max-w-3xl w-full border-2 border-dali-white/20">
        <NuxtImg
          :src="selectedImage.url"
          :alt="selectedImage.alt || selectedImage.title || 'Photo'"
          class="w-full object-contain max-h-[70vh]"
        />
      </div>

      <div v-if="selectedImage.title || selectedImage.note" class="text-center max-w-xl mb-8">
        <p v-if="selectedImage.title" class="font-bold text-lg mb-1 text-dali-white">
          {{ selectedImage.title }}
        </p>
        <p v-if="selectedImage.note" class="text-sm text-dali-white/60 italic">
          {{ selectedImage.note }}
        </p>
      </div>

      <!-- Prev / Next navigation (if more than 1 image) -->
      <div v-if="images.length > 1" class="flex items-center gap-4">
        <button
          v-if="selectedIndex > 0"
          class="dali-btn bg-transparent text-dali-white border-dali-white/40 px-4 py-2 text-sm font-bold"
          @click="navigateImage(selectedIndex - 1)"
        >
          &larr; Previous
        </button>
        <span class="text-sm text-dali-white/40">
          {{ selectedIndex + 1 }} / {{ images.length }}
        </span>
        <button
          v-if="selectedIndex < images.length - 1"
          class="dali-btn bg-transparent text-dali-white border-dali-white/40 px-4 py-2 text-sm font-bold"
          @click="navigateImage(selectedIndex + 1)"
        >
          Next &rarr;
        </button>
      </div>
    </div>

    <!-- Gallery grid (no specific image selected) -->
    <div v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div
          v-for="(image, index) in images"
          :key="index"
          class="cursor-pointer border-2 border-dali-white/20 overflow-hidden hover:border-dali-gold/50 transition-colors"
          @click="navigateImage(index)"
        >
          <NuxtImg
            :src="image.url"
            :alt="image.alt || image.title || 'Gallery image'"
            class="w-full h-56 object-cover"
            loading="lazy"
          />
          <div v-if="image.title || image.note" class="p-4 border-t border-dali-white/10">
            <p v-if="image.title" class="font-bold text-sm text-dali-white">{{ image.title }}</p>
            <p v-if="image.note" class="text-xs text-dali-muted mt-1 italic">{{ image.note }}</p>
          </div>
        </div>
      </div>
    </div>
  </LayoutsSubPageLayout>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const { images } = usePhotoGallery()

const selectedIndex = computed(() => {
  const imgParam = route.query.img
  if (imgParam == null) return -1
  const idx = parseInt(String(imgParam), 10)
  return Number.isFinite(idx) && idx >= 0 && idx < images.length ? idx : -1
})

const selectedImage = computed(() => {
  return selectedIndex.value >= 0 ? images[selectedIndex.value] : null
})

const pageTitle = computed(() => {
  if (selectedImage.value?.title) return selectedImage.value.title
  return 'Gallery'
})

function navigateImage(index: number) {
  router.replace({ path: '/gallery', query: { img: String(index) } })
}

onMounted(() => {
  if (!import.meta.client) return
  const { initializeTracking, trackVisit } = useGoatCounter()
  initializeTracking()
  trackVisit('/gallery')
})

useHead({
  title: computed(() => `${pageTitle.value} - Xinyu Huang`),
  meta: [
    { name: 'description', content: 'Photo gallery — Xinyu Huang' },
  ],
})
</script>
