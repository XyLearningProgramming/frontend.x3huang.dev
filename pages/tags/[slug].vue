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
        <div class="mb-8">
          <!-- Back to tags link -->
          <NuxtLink 
            to="/tags" 
            class="inline-flex items-center text-light-accent dark:text-dark-accent hover:underline mb-4"
          >
            ← Back to All Tags
          </NuxtLink>
          
          <h1 class="text-3xl font-bold text-light-text-strong dark:text-dark-text-strong">
            Posts tagged with "{{ decodedTag }}"
          </h1>
          
          <p v-if="filteredPostsCount > 0" class="text-light-text dark:text-dark-text mt-2">
            {{ filteredPostsCount }} {{ filteredPostsCount === 1 ? 'post' : 'posts' }} found
          </p>
        </div>
        
        <BlogList :posts="allPosts" :filter-tag="decodedTag" />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const tag = route.params.slug as string
const decodedTag = decodeURIComponent(tag || '')

// Fetch all posts
const { data: allPosts } = await useAsyncData('blog-posts-tag', () => 
  queryCollection('blog').all()
)

// Computed for filtered posts count
const filteredPostsCount = computed(() => {
  if (!allPosts.value) return 0
  return allPosts.value.filter(post => 
    post.tags && post.tags.includes(decodedTag)
  ).length
})

// If no posts found with this tag, show 404
watchEffect(() => {
  if (allPosts.value && filteredPostsCount.value === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: `No posts found with tag: ${decodedTag}`
    })
  }
})

// Use sidebar state for responsive layout
const { isExpanded, isMobile } = useSidebar()

// Head meta
useHead({
  title: `Posts tagged: ${decodedTag} - Blog`,
  meta: [
    { name: 'description', content: `Browse all blog posts tagged with ${decodedTag}` }
  ]
})
</script>