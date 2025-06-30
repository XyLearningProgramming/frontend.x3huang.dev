<template>
  <article 
    class="glass-primary rounded-lg p-6 glass-hover cursor-pointer"
    @click="selectPost">
    <div class="flex justify-between items-start mb-3">
      <h2 class="text-xl font-semibold text-glass">{{ props.post.title }}</h2>
      <time class="text-sm text-glass-muted">{{ formatDate(props.post.date) }}</time>
    </div>

    <p v-if="props.post.description" class="text-glass-muted mb-4">{{ props.post.description }}</p>

    <div v-if="props.post.tags && props.post.tags.length" class="flex flex-wrap gap-2">
      <NuxtLink v-for="tag in props.post.tags" :key="tag" :to="`/blogs/tags/${encodeURIComponent(tag)}`"
        class="px-2 py-1 text-xs glass-secondary rounded-full hover:bg-white/30 text-glass-muted hover:text-glass transition-all duration-200"
        @click.stop>
        {{ tag }}
      </NuxtLink>
    </div>
  </article>
</template>

<script setup lang="ts">
// Removed GlassCard import - using direct element with glass classes

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

const selectPost = () => {
  console.log('BlogCard clicked, navigating to post:', props.post.title)
  
  // Save current page to history stack before navigating
  if (import.meta.client) {
    const currentPath = useRoute().fullPath
    const currentTitle = getCurrentPageTitle()
    sessionStorage.setItem('blogReturnPath', currentPath)
    sessionStorage.setItem('blogReturnTitle', currentTitle)
  }

  const slug = generateSlug(props.post.title)
  console.log('Generated slug:', slug)
  navigateTo(`/blogs/${slug}`)
}

const getCurrentPageTitle = () => {
  const route = useRoute()
  if (route.path === '/') return 'Latest Posts'
  if (route.path === '/blogs' || route.path === '/blogs/') return 'Latest Posts'
  if (route.path === '/blogs/timeline') return 'Timeline'
  if (route.path === '/blogs/tags') return 'Tags'
  if (route.path === '/about') return 'About'
  if (route.path.startsWith('/blogs/tags/')) {
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