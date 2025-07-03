<template>
  <div>
    <div v-if="!posts" class="text-center py-12">
      <div class="relative">
        <div class="absolute inset-0 bg-black/20 rounded-2xl blur-xl"></div>
        <div class="relative text-glass px-8 py-6">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white/60 mx-auto mb-4"></div>
          <p class="text-lg">Loading posts...</p>
        </div>
      </div>
    </div>
    
    <div v-else-if="filteredPosts.length === 0" class="text-center py-12">
      <div class="relative">
        <div class="absolute inset-0 bg-black/20 rounded-2xl blur-xl"></div>
        <div class="relative text-glass px-8 py-6">
          <div class="text-4xl mb-4">🔍</div>
          <p class="text-lg mb-2">No posts found</p>
          <p class="text-sm opacity-75">Try adjusting your search terms or browse all posts</p>
        </div>
      </div>
    </div>

    <div v-else class="space-y-8">
      <BlogCard v-for="post in filteredPosts" :key="post.path" :post="post" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  posts: any[] | null
  filterTag?: string
}

const props = withDefaults(defineProps<Props>(), {
  filterTag: undefined
})

// Computed properties
const filteredPosts = computed(() => {
  if (!props.posts) return []

  let filtered = [...props.posts]

  // Sort by date descending
  filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Filter by tag if specified
  if (props.filterTag) {
    filtered = filtered.filter(post =>
      post.tags && post.tags.includes(props.filterTag)
    )
  }
  return filtered
})
</script>