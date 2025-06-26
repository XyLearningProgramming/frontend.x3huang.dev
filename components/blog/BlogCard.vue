<template>
  <article
    class="bg-light-surface dark:bg-dark-surface rounded-lg p-6 border border-light-border dark:border-dark-border hover:shadow-lg transition-shadow cursor-pointer"
    @click="selectPost(post)">
    <div class="flex justify-between items-start mb-3">
      <h2 class="text-xl font-semibold text-light-text-strong dark:text-dark-text-strong">{{ post.title }}</h2>
      <time class="text-sm text-light-text dark:text-dark-text">{{ formatDate(post.date) }}</time>
    </div>

    <p v-if="post.description" class="text-light-text dark:text-dark-text mb-4">{{ post.description }}</p>

    <div v-if="post.tags && post.tags.length" class="flex flex-wrap gap-2">
      <NuxtLink v-for="tag in post.tags" :key="tag" :to="`/tags/${encodeURIComponent(tag)}`"
        class="px-2 py-1 text-xs bg-light-border dark:bg-dark-border rounded-full hover:bg-light-accent dark:hover:bg-dark-accent hover:text-white transition-colors"
        @click.stop>
        {{ tag }}
      </NuxtLink>
    </div>
  </article>
</template>

<script setup lang="ts">
interface Props {
  post: any
}

const props = defineProps<Props>()

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
    const currentPath = useRoute().fullPath
    const currentTitle = getCurrentPageTitle()
    sessionStorage.setItem('blogReturnPath', currentPath)
    sessionStorage.setItem('blogReturnTitle', currentTitle)
  }

  const slug = generateSlug(post.title)
  navigateTo(`/blogs/${slug}`)
}

const getCurrentPageTitle = () => {
  const route = useRoute()
  if (route.path === '/') return 'Latest Posts'
  if (route.path === '/timeline') return 'Timeline'
  if (route.path === '/tags') return 'Tags'
  if (route.path === '/about') return 'About'
  if (route.path.startsWith('/tags/')) {
    const tag = route.params.tag as string
    return `Posts tagged: ${decodeURIComponent(tag)}`
  }
  return 'Blog'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>