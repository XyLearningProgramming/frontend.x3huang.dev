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
        <h1 class="text-3xl font-bold text-light-text-strong dark:text-dark-text-strong mb-8">Timeline</h1>

        <div v-if="!timelineYears" class="text-red-500 mb-4">Loading timeline...</div>
        <div v-else-if="timelineYears.length === 0" class="text-red-500 mb-4">No posts found</div>

        <div v-else class="space-y-6">
          <div v-for="year in timelineYears" :key="year"
            class="border-l-2 border-light-accent dark:border-dark-accent pl-6">
            <h2 class="text-2xl font-bold text-light-text-strong dark:text-dark-text-strong mb-4">{{ year }}</h2>
            <div class="space-y-3">
              <div v-for="post in getPostsByYear(year)" :key="post.path"
                class="cursor-pointer hover:text-light-accent dark:hover:text-dark-accent transition-colors"
                @click="selectPost(post)">
                <div class="flex justify-between">
                  <span class="font-medium">{{ post.title }}</span>
                  <span class="text-sm text-light-text dark:text-dark-text">{{ formatDate(post.date) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">

// Fetch all posts
const { data: finalPosts } = await useAsyncData('blog-posts-timeline', () =>
  queryCollection('blogs').all()
)

// Computed properties
const timelineYears = computed(() => {
  if (!finalPosts.value) return []

  const years: Set<number> = new Set()
  finalPosts.value.forEach(post => {
    const year = new Date(post.date).getFullYear()
    years.add(year)
  })

  return Array.from(years).sort((a: any, b: any) => b - a)
})

// Methods
const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

const selectPost = (post: any) => {
  // Save current page to history stack before navigating
  if (import.meta.client) {
    sessionStorage.setItem('blogReturnPath', '/timeline')
    sessionStorage.setItem('blogReturnTitle', 'Timeline')
  }

  const slug = generateSlug(post.title)
  navigateTo(`/blogs/${slug}`)
}

const getPostsByYear = (year: number) => {
  if (!finalPosts.value) return []
  const posts = finalPosts.value.filter(post => new Date(post.date).getFullYear() === year)
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Use sidebar state for responsive layout
const { isExpanded, isMobile } = useSidebar()


// Head meta
useHead({
  title: 'Timeline - Blog',
  meta: [
    { name: 'description', content: 'Browse blog posts by timeline' }
  ]
})
</script>