<template>
  <div class="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text">
    <div class="flex">
      <!-- Sidebar -->
      <AppSidebar />

      <!-- Right Panel -->
      <main :class="[
        'flex-1 p-8 transition-all duration-300',
        isExpanded && !isMobile ? 'ml-64' : 'ml-0'
      ]">
        <div v-if="error" class="text-red-500">
          Error loading content: {{ error }}
        </div>
        <div v-else-if="!allPages" class="text-light-text dark:text-dark-text">
          Loading...
        </div>
        <div v-else-if="!aboutContent" class="text-red-500">
          About page not found. Available pages: {{allPages.map((p: any) => p.path || p).join(', ')}}
          <pre class="mt-2 text-xs">{{ JSON.stringify(allPages, null, 2) }}</pre>
        </div>
        <div v-else
          class="prose prose-lg max-w-none prose-headings:text-light-text-strong dark:prose-headings:text-dark-text-strong prose-p:text-light-text dark:prose-p:text-dark-text prose-li:text-light-text dark:prose-li:text-dark-text prose-strong:text-light-text-strong dark:prose-strong:text-dark-text-strong prose-a:text-light-accent dark:prose-a:text-dark-accent">
          <ContentRenderer :value="aboutContent" />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">

// Fetch about content using queryCollection from pages collection
const { data: allPages } = await useAsyncData('all-pages', () =>
  queryCollection('pages').all()
)

// Find the about page from all pages
const aboutContent = computed(() => {
  if (!allPages.value) return null
  return allPages.value.find((page: any) => page.path === '/pages/about')
})

const error = ref(null)

// Use sidebar state for responsive layout
const { isExpanded, isMobile } = useSidebar()


// Head meta
useHead({
  title: computed(() => aboutContent.value ? `${(aboutContent.value as any).title} - Blog` : 'About - Blog'),
  meta: [
    { name: 'description', content: computed(() => (aboutContent.value as any)?.description || 'Learn more about this blog and its author') }
  ]
})
</script>