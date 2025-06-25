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
  title: "Xinyu's Blog", // same as manifest short_name
  meta: [
    {
      name: 'description',
      content: 'Blog site of Xinyu Huang, x3huang, sharing tech insights, self-hosting experience, web development',
    }
  ],
  link: [
    { rel: "apple-touch-icon", sizes: "180x180", href: "/favicon/apple-touch-icon.png" },
    { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon/favicon-32x32.png' },
    { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon/favicon-16x16.png' },
    { rel: 'manifest', href: '/favicon/site.webmanifest' },
  ],
})
</script>