<template>
  <div
    class="min-h-screen bg-gradient-to-br from-light-accent/20 to-dark-accent/20 dark:from-dark-accent/30 dark:to-light-accent/30 bg-cover bg-center bg-no-repeat relative"
    :style="{ backgroundImage: currentBackground ? `url(${currentBackground.url})` : 'none' }">
    <!-- Background overlay for better readability -->
    <div class="absolute inset-0 bg-black/20 dark:bg-black/40"></div>
    
    <!-- Main content -->
    <div class="relative z-10 min-h-screen">
      <div class="max-w-4xl mx-auto py-8 px-8">
        <!-- Loading state -->
        <div v-if="!allPages" class="text-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white/60 mx-auto mb-4"></div>
          <p class="text-white drop-shadow-lg">Loading...</p>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="text-center py-12">
          <div class="bg-white/10 backdrop-blur-md border-white/20 rounded-lg p-6 mb-4">
            <h2 class="text-2xl font-bold mb-2 text-white drop-shadow-lg">Error Loading Content</h2>
            <p class="text-white/80 drop-shadow-lg">{{ error }}</p>
          </div>
          <NuxtLink to="/" class="inline-flex items-center gap-2 text-white hover:text-white/80 transition-colors drop-shadow-lg">
            <IconsArrowLeft class="w-4 h-4" />
            Back to Home
          </NuxtLink>
        </div>

        <!-- About content not found -->
        <div v-else-if="!aboutContent" class="text-center py-12">
          <div class="bg-white/10 backdrop-blur-md border-white/20 rounded-lg p-6 mb-6">
            <h2 class="text-2xl font-bold text-white mb-4 drop-shadow-lg">
              About Page Not Found
            </h2>
            <p class="text-white/80 mb-4 drop-shadow-lg">
              The about page content could not be loaded.
            </p>
            <details class="text-left max-w-2xl mx-auto mb-6">
              <summary class="cursor-pointer text-white/80 hover:text-white transition-colors">
                Debug Information
              </summary>
              <div class="mt-2 p-4 bg-black/20 backdrop-blur-sm rounded-lg">
                <p class="text-sm mb-2 text-white/80">Available pages:</p>
                <p class="text-xs font-mono text-white/60">{{allPages?.map((p: any) => p.path || p).join(', ')}}</p>
                <pre class="mt-2 text-xs overflow-auto text-white/60">{{ JSON.stringify(allPages, null, 2) }}</pre>
              </div>
            </details>
          </div>
          <NuxtLink to="/" class="inline-flex items-center gap-2 text-white hover:text-white/80 transition-colors drop-shadow-lg">
            <IconsArrowLeft class="w-4 h-4" />
            Back to Home
          </NuxtLink>
        </div>

        <!-- About content -->
        <div v-else>
          <!-- Content with blog-style layout -->
          <article class="prose prose-lg max-w-none">
            <header class="mb-8 text-center">
              <h1 class="text-4xl font-bold text-white mb-4 drop-shadow-2xl text-shadow-strong">
                {{ aboutContent.title || 'About' }}
              </h1>
              <div v-if="aboutContent.description" class="relative">
                <div class="absolute inset-0 bg-black/20 rounded-2xl blur-xl"></div>
                <p class="relative text-lg text-white max-w-2xl mx-auto leading-relaxed drop-shadow-xl text-shadow-medium px-6 py-4">
                  {{ aboutContent.description }}
                </p>
              </div>
            </header>

            <div class="bg-white/10 backdrop-blur-md border-white/20 rounded-lg p-6 mb-8">
              <div class="text-white prose-white">
                <ContentRenderer :value="aboutContent" />
              </div>
            </div>
          </article>

        <!-- Resume section
        <div class="mt-12 p-6 bg-light-surface dark:bg-dark-surface rounded-lg border border-light-border dark:border-dark-border">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-light-text-strong dark:text-dark-text-strong mb-2">
                Resume / CV
              </h3>
              <p class="text-light-text dark:text-dark-text text-sm">
                Download my latest resume to learn more about my experience and skills.
              </p>
            </div>
            <a 
              href="/resume.pdf" 
              target="_blank" 
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 px-4 py-2 bg-light-accent dark:bg-dark-accent text-white rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </a>
          </div>
        </div> -->

          <!-- Back navigation -->
          <div class="text-center mt-8">
            <NuxtLink to="/"
              class="inline-flex items-center gap-2 text-white hover:text-white/80 transition-colors drop-shadow-lg">
              <IconsArrowLeft class="w-4 h-4" />
              Back to Home
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconsArrowLeft from '~/components/icons/arrowLeft.vue'

const { currentBackground, initializeBackground } = useBackgroundGallery()

// Initialize background on mount
onMounted(() => {
  initializeBackground()
})

// Fetch about content using queryCollection from pages collection
const { data: allPages, error } = await useAsyncData('all-pages', () =>
  queryCollection('pages').all()
)

// Find the about page from all pages
const aboutContent = computed(() => {
  if (!allPages.value) return null
  return allPages.value.find((page: any) => page.path === '/pages/about')
})

// SEO meta
useHead({
  title: computed(() => aboutContent.value ? `${(aboutContent.value as any).title} - Xinyu Huang` : 'About - Xinyu Huang'),
  meta: [
    { name: 'description', content: computed(() => (aboutContent.value as any)?.description || 'Learn more about Xinyu Huang and this blog') }
  ]
})
</script>

<style scoped>
.text-shadow-strong {
  text-shadow:
    0 2px 4px rgba(0, 0, 0, 0.8),
    0 4px 8px rgba(0, 0, 0, 0.6),
    0 8px 16px rgba(0, 0, 0, 0.4);
}

.text-shadow-medium {
  text-shadow:
    0 1px 2px rgba(0, 0, 0, 0.8),
    0 2px 4px rgba(0, 0, 0, 0.6),
    0 4px 8px rgba(0, 0, 0, 0.3);
}

.prose-white {
  --tw-prose-body: rgba(255, 255, 255, 0.9);
  --tw-prose-headings: rgba(255, 255, 255, 1);
  --tw-prose-links: rgba(255, 255, 255, 0.8);
  --tw-prose-bold: rgba(255, 255, 255, 1);
  --tw-prose-counters: rgba(255, 255, 255, 0.7);
  --tw-prose-bullets: rgba(255, 255, 255, 0.7);
  --tw-prose-hr: rgba(255, 255, 255, 0.3);
  --tw-prose-quotes: rgba(255, 255, 255, 0.9);
  --tw-prose-quote-borders: rgba(255, 255, 255, 0.3);
  --tw-prose-code: rgba(255, 255, 255, 0.9);
  --tw-prose-pre-code: rgba(255, 255, 255, 0.9);
  --tw-prose-pre-bg: rgba(0, 0, 0, 0.5);
}
</style>