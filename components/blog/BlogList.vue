<template>
  <div>
    <div v-if="!posts" class="text-red-500 mb-4">Loading posts...</div>
    <div v-else-if="filteredPosts.length === 0" class="text-red-500 mb-4">No posts found</div>

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