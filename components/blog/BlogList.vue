<template>
  <div>
    <ClientOnly>
      <div v-if="!posts" class="text-center py-12">
        <div class="neo-border bg-neo-bg p-8 relative">
          <div class="absolute inset-0 neo-shadow -z-10 bg-neo-black"></div>
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-neo-black/60 mx-auto mb-4"></div>
          <p class="text-lg text-neo-black">Loading posts...</p>
        </div>
      </div>
      
      <div v-else-if="filteredPosts.length === 0" class="text-center py-12">
        <div class="neo-border bg-neo-bg p-8 relative">
          <div class="absolute inset-0 neo-shadow -z-10 bg-neo-black"></div>
          <div class="text-4xl mb-4">🔍</div>
          <p class="text-lg text-neo-black mb-2">No posts found</p>
          <p class="text-sm text-neo-black/60">Try adjusting your search terms or browse all posts</p>
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
  filterTag: undefined
})

const filteredPosts = computed(() => {
  if (!props.posts) return []

  let filtered = [...props.posts]

  filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  if (props.filterTag) {
    filtered = filtered.filter(post =>
      post.tags && post.tags.includes(props.filterTag)
    )
  }
  return filtered
})
</script>
