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
        <h1 class="text-3xl font-bold text-light-text-strong dark:text-dark-text-strong mb-8">All Tags</h1>

        <div v-if="!allTags" class="text-red-500 mb-4">Loading tags...</div>
        <div v-else-if="allTags.length === 0" class="text-red-500 mb-4">No tags found</div>

        <div v-else class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <NuxtLink v-for="tag in allTags" :key="tag" :to="`/tags/${encodeURIComponent(tag)}`"
            class="bg-light-surface dark:bg-dark-surface p-4 rounded-lg border border-light-border dark:border-dark-border hover:shadow-lg transition-shadow block">
            <h4 class="font-semibold text-light-text-strong dark:text-dark-text-strong">{{ tag }}</h4>
            <p class="text-sm text-light-text dark:text-dark-text">{{ getTagCount(tag) }} posts</p>
          </NuxtLink>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">

// Fetch all posts to get tags
const { data: finalPosts } = await useAsyncData('blog-posts-tags', () =>
  queryCollection('blog').all()
)

// Computed properties
const allTags = computed(() => {
  if (!finalPosts.value) return []

  const tags = new Set()
  finalPosts.value.forEach(post => {
    if (post.tags) {
      post.tags.forEach(tag => tags.add(tag))
    }
  })

  return Array.from(tags).sort()
})

// Methods
const getTagCount = (tag: string) => {
  if (!finalPosts.value) return 0
  return finalPosts.value.filter(post => post.tags && post.tags.includes(tag)).length
}

// Use sidebar state for responsive layout
const { isExpanded, isMobile } = useSidebar()



// Head meta
useHead({
  title: 'Tags - Blog',
  meta: [
    { name: 'description', content: 'Browse all blog post tags' }
  ]
})
</script>