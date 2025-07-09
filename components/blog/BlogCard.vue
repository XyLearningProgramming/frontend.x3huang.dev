<template>
  <article 
    class="glass-primary rounded-lg overflow-hidden glass-hover cursor-pointer flex items-stretch"
    @click="selectPost">
    
    <!-- Content section -->
    <div class="p-6 flex-1">
      <div class="flex justify-between items-start mb-3">
        <h2 class="text-xl font-semibold text-glass">{{ props.post.title }}</h2>
        <time class="text-sm text-glass-muted flex-shrink-0 ml-4">
          {{ formatDate(props.post.date) }}
        </time>
      </div>

      <p v-if="props.post.description" class="text-glass-muted mb-4">{{ props.post.description }}</p>

      <div v-if="props.post.tags && props.post.tags.length" class="flex flex-wrap gap-2">
        <NuxtLink v-for="tag in props.post.tags" :key="tag" :to="`/blogs/tags/${encodeURIComponent(tag)}`"
          class="px-2 py-1 text-xs glass-secondary rounded-full hover:bg-white/30 text-glass-muted hover:text-glass transition-all duration-200"
          @click.stop>
          {{ tag }}
        </NuxtLink>
      </div>
    </div>

    <!-- Image thumbnail -->
    <ClientOnly v-if="hasImage">
      <div class="w-48 flex-shrink-0">
        <nuxt-img 
          :src="imageSrc" 
          :alt="imageAlt"
          class="w-full h-full object-cover"
          format="webp"
          sizes="192px"
          loading="lazy"
          quality="60"
        />
      </div>
    </ClientOnly>
  </article>
</template>

<script setup lang="ts">
import { withBase } from 'ufo'
import { useRuntimeConfig } from '#imports'

interface Props {
  post: any
}

const props = defineProps<Props>()

const hasImage = computed(() => !!props.post.image && !!props.post.image.src)
const imageSrc = computed(() => {
  if (!hasImage.value) return ''
  const src = props.post.image?.src
  if (src && src.startsWith('/') && !src.startsWith('//')) {
    return withBase(src, useRuntimeConfig().app.baseURL)
  }
  return src || ''
})
const imageAlt = computed(() => props.post.image?.alt || props.post.title || 'Blog post image')

const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// Navigation
const selectPost = () => {
  if (import.meta.client) {
    sessionStorage.setItem('blogReturnPath', useRoute().fullPath)
  }
  const slug = generateSlug(props.post.title)
  navigateTo(`/blogs/${slug}`)
}

// Formatting
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>
