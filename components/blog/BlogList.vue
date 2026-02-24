<template>
  <div>
    <ClientOnly>
      <div v-if="!posts" class="text-center py-12">
        <div class="dali-card p-8" style="border-color: var(--color-dali-muted);">
          <div class="w-8 h-8 border-4 border-dali-red border-t-dali-gold rounded-full animate-spin mx-auto mb-4" />
          <p class="text-lg text-dali-white">Loading posts...</p>
        </div>
      </div>

      <div v-else-if="filteredPosts.length === 0" class="text-center py-12">
        <div class="dali-card p-8" style="border-color: var(--color-dali-gold);">
          <div class="text-4xl mb-4">🔍</div>
          <p class="text-lg text-dali-white mb-2">No posts found</p>
          <p class="text-sm text-dali-muted">Try adjusting your search terms or browse all posts</p>
        </div>
      </div>

      <div v-else class="space-y-8">
        <BlogCard v-for="post in filteredPosts" :key="post.path" :post="post" />
      </div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
interface Props {
  posts: any[] | null
  filterTag?: string
}

const props = withDefaults(defineProps<Props>(), {
  filterTag: undefined,
})

const filteredPosts = computed(() => {
  if (!props.posts) return []

  let filtered = [...props.posts]

  filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  if (props.filterTag) {
    filtered = filtered.filter(post =>
      post.tags && post.tags.includes(props.filterTag),
    )
  }
  return filtered
})
</script>
