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
        <h1 class="font-neo-heading text-h2-sm md:text-h2 font-bold mb-4">Timeline</h1>
        <p class="text-lg text-neo-black/70">Browse blog posts chronologically</p>
      </div>

      <!-- Loading -->
      <div v-if="!timelineYears" class="text-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-neo-black/60 mx-auto mb-4"></div>
        <p class="text-neo-black/70">Loading timeline...</p>
      </div>

      <!-- Empty -->
      <div v-else-if="timelineYears.length === 0" class="text-center py-12">
        <div class="neo-card bg-neo-white p-8 max-w-md mx-auto">
          <p class="text-neo-black/70">No posts found.</p>
        </div>
      </div>

      <!-- Timeline -->
      <div v-else class="max-w-3xl mx-auto space-y-10">
        <div v-for="year in timelineYears" :key="year">
          <!-- Year heading -->
          <h2 class="inline-block bg-neo-yellow px-4 py-1 border-2 border-neo-black font-bold text-xl mb-4"
            style="box-shadow: 3px 3px 0px 0px #000;">
            {{ year }}
          </h2>

          <!-- Posts for this year -->
          <div class="space-y-3 border-l-4 border-neo-black pl-6 ml-2">
            <div
              v-for="post in getPostsByYear(year)"
              :key="post.path"
              class="neo-card bg-neo-white p-4 cursor-pointer"
              @click="selectPost(post)"
            >
              <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                <span class="font-bold text-neo-black">{{ post.title }}</span>
                <span class="text-sm text-neo-black/50 whitespace-nowrap">{{ formatDate(post.date) }}</span>
              </div>
              <p v-if="post.description" class="text-sm text-neo-black/60 mt-1 line-clamp-2">
                {{ post.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconsArrowLeft from '~/components/icons/arrowLeft.vue'

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
  if (import.meta.client) {
    sessionStorage.setItem('blogReturnPath', '/blogs/timeline')
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

useHead({
  title: 'Timeline - Blog - Xinyu Huang',
  meta: [
    { name: 'description', content: 'Browse blog posts by timeline' }
  ]
})
</script>
