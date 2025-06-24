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
        <h1 class="text-3xl font-bold text-light-text-strong dark:text-dark-text-strong mb-8">Latest Posts</h1>
        
        <BlogList :posts="finalPosts" />
      </main>
    </div>

  </div>
</template>

<script setup lang="ts">
// Just fetch posts - all logic moved to BlogList component

// Fetch all posts using queryCollection
const { data: finalPosts } = await useAsyncData('blog-posts', () => 
  queryCollection('blog').all()
)

// Use sidebar state for responsive layout
const { isExpanded, isMobile } = useSidebar()




// Head meta
useHead({
  title: 'Blog',
  meta: [
    { name: 'description', content: 'A modern blog built with Nuxt 3 and Nuxt Content' }
  ]
})
</script>