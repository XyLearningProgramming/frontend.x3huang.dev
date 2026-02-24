<template>
  <div class="min-h-screen bg-neo-section-posts text-neo-black py-16 px-4">
    <div class="container mx-auto max-w-screen-xl">
      <!-- Back navigation -->
      <div class="mb-6">
        <NuxtLink to="/blogs"
          class="inline-flex items-center gap-2 text-neo-black/70 hover:text-neo-black transition-colors">
          <IconsArrowLeft class="w-4 h-4" />
          Back to Blog
        </NuxtLink>
      </div>

      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="font-neo-heading text-h2-sm md:text-h2 font-bold mb-4">All Tags</h1>
        <p class="text-lg text-neo-black/70">Browse blog posts by topic</p>
      </div>

      <!-- Loading -->
      <div v-if="!allTags" class="text-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-neo-black/60 mx-auto mb-4"></div>
        <p class="text-neo-black/70">Loading tags...</p>
      </div>

      <!-- Empty -->
      <div v-else-if="allTags.length === 0" class="text-center py-12">
        <div class="neo-card bg-neo-white p-8 max-w-md mx-auto">
          <p class="text-neo-black/70">No tags found.</p>
        </div>
      </div>

      <!-- Tags grid -->
      <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
        <NuxtLink
          v-for="tag in allTags"
          :key="tag"
          :to="`/blogs/tags/${encodeURIComponent(tag)}`"
          class="neo-card bg-neo-white p-4 text-center"
        >
          <h4 class="font-bold text-neo-black mb-1">{{ tag }}</h4>
          <p class="text-sm text-neo-black/60">{{ getTagCount(tag) }} {{ getTagCount(tag) === 1 ? 'post' : 'posts' }}</p>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconsArrowLeft from '~/components/icons/arrowLeft.vue'

// Fetch all posts to get tags
const { data: finalPosts } = await useAsyncData('blog-posts-tags', () =>
  queryCollection('blogs').all()
)

// Computed properties
const allTags = computed(() => {
  if (!finalPosts.value) return []

  const tags: Set<string> = new Set()
  finalPosts.value.forEach(post => {
    if (post.tags) {
      post.tags.forEach((tag: string) => tags.add(tag))
    }
  })

  return Array.from(tags).sort()
})

// Methods
const getTagCount = (tag: string) => {
  if (!finalPosts.value) return 0
  return finalPosts.value.filter(post => post.tags && post.tags.includes(tag)).length
}

useHead({
  title: 'Tags - Blog - Xinyu Huang',
  meta: [
    { name: 'description', content: 'Browse all blog post tags' }
  ]
})
</script>
