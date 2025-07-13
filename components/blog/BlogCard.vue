<template>
  <article class="glass-primary rounded-lg overflow-hidden glass-hover cursor-pointer" @click="selectPost">

    <!-- Content section -->
    <div class="p-6">
      <!-- Title and date row -->
      <div class="flex justify-between items-start">
        <h2 class="text-xl font-semibold text-glass">{{ props.post.title }}</h2>
        <time class="text-sm text-glass-muted flex-shrink-0 ml-4">
          {{ formatDate(props.post.date) }}
        </time>
      </div>

      <!-- Analytics display -->
      <div class="mb-3">
        <AnalyticsDisplay :slug="generateSlug(props.post.title)" :analytics="analytics" :loading="analyticsLoading"
          :clickable="false" />
      </div>

      <!-- Description and image row -->
      <div class="flex gap-6" v-if="props.post.description || hasImage">
        <div class="flex-1 flex flex-col justify-between min-h-28">
          <p v-if="props.post.description" class="text-glass-muted">{{ props.post.description }}</p>

          <!-- Tags pushed to bottom -->
          <div v-if="props.post.tags && props.post.tags.length" class="flex flex-wrap gap-2 mt-4">
            <NuxtLink v-for="tag in props.post.tags" :key="tag" :to="`/blogs/tags/${encodeURIComponent(tag)}`"
              class="px-2 py-1 text-xs glass-secondary rounded-full hover:bg-white/30 text-glass-muted hover:text-glass transition-all duration-200"
              @click.stop>
              {{ tag }}
            </NuxtLink>
          </div>
        </div>

        <!-- Image thumbnail beside description -->
        <ClientOnly v-if="hasImage">
          <div class="w-40 h-28 flex-shrink-0 rounded-lg overflow-hidden shadow-lg">
            <nuxt-img :src="imageSrc" :alt="imageAlt"
              class="w-full h-full object-cover hover:scale-105 transition-transform duration-300" format="webp"
              sizes="160px" loading="lazy" quality="80" />
          </div>
        </ClientOnly>
      </div>

      <!-- Tags for posts without description or image -->
      <div v-else-if="props.post.tags && props.post.tags.length" class="flex flex-wrap gap-2">
        <NuxtLink v-for="tag in props.post.tags" :key="tag" :to="`/blogs/tags/${encodeURIComponent(tag)}`"
          class="px-2 py-1 text-xs glass-secondary rounded-full hover:bg-white/30 text-glass-muted hover:text-glass transition-all duration-200"
          @click.stop>
          {{ tag }}
        </NuxtLink>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { withBase } from 'ufo'
import { useRuntimeConfig } from '#imports'
import AnalyticsDisplay from './AnalyticsDisplay.vue'

interface Props {
  post: any
}

const props = defineProps<Props>()

// Analytics state
const analytics = ref({ visits: 0, likes: 0, shares: 0 })
const analyticsLoading = ref(true)

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

import { useSlug } from '~/composables/useSlug';

const { generateSlug } = useSlug();

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

// Load analytics data
onMounted(async () => {
  if (!import.meta.client) return

  try {
    const { getBlogAnalytics } = useGoatCounter()
    const slug = generateSlug(props.post.title)
    analytics.value = await getBlogAnalytics(slug)
  } catch (error) {
    console.warn('Failed to load analytics for', props.post.title, error)
  } finally {
    analyticsLoading.value = false
  }
})
</script>
