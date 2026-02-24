<template>
  <article class="neo-card bg-neo-white overflow-hidden cursor-pointer" @click="selectPost">
    <div class="p-6">
      <!-- Title and date -->
      <div class="flex justify-between items-start">
        <h2 class="text-xl font-bold">{{ props.post.title }}</h2>
        <time class="text-xs font-bold text-neo-text-muted flex-shrink-0 ml-4 bg-neo-bg px-2 py-0.5 border border-neo-black">
          {{ formatDate(props.post.date) }}
        </time>
      </div>

      <!-- Analytics -->
      <div class="mb-3 mt-2">
        <AnalyticsDisplay
          :slug="generateSlug(props.post.title)"
          :analytics="analytics"
          :loading="analyticsLoading"
          :clickable="false"
        />
      </div>

      <!-- Description and image -->
      <div v-if="props.post.description || hasImage" class="flex gap-6">
        <div class="flex-1 flex flex-col justify-between min-h-28">
          <p v-if="props.post.description" class="text-sm text-neo-text-muted">{{ props.post.description }}</p>
          <div v-if="props.post.tags && props.post.tags.length" class="flex flex-wrap gap-1 mt-3">
            <NuxtLink
              v-for="tag in props.post.tags"
              :key="tag"
              :to="`/blogs/tags/${encodeURIComponent(tag)}`"
              class="text-[10px] font-bold px-2 py-0.5 bg-neo-yellow/40 border border-neo-black hover:bg-neo-yellow transition-colors"
              @click.stop
            >
              {{ tag }}
            </NuxtLink>
          </div>
        </div>
        <ClientOnly v-if="hasImage">
          <div class="w-40 h-28 flex-shrink-0 overflow-hidden border-2 border-neo-black">
            <nuxt-img
              :src="imageSrc"
              :alt="imageAlt"
              class="w-full h-full object-cover"
              format="webp"
              sizes="160px"
              loading="lazy"
              quality="80"
            />
          </div>
        </ClientOnly>
      </div>

      <!-- Tags only (no description or image) -->
      <div v-else-if="props.post.tags && props.post.tags.length" class="flex flex-wrap gap-1">
        <NuxtLink
          v-for="tag in props.post.tags"
          :key="tag"
          :to="`/blogs/tags/${encodeURIComponent(tag)}`"
          class="text-[10px] font-bold px-2 py-0.5 bg-neo-yellow/40 border border-neo-black hover:bg-neo-yellow transition-colors"
          @click.stop
        >
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

import { useSlug } from '~/composables/useSlug'
const { generateSlug } = useSlug()

const selectPost = () => {
  if (import.meta.client) {
    sessionStorage.setItem('blogReturnPath', useRoute().fullPath)
  }
  const slug = generateSlug(props.post.title)
  navigateTo(`/blogs/${slug}`)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

onMounted(async () => {
  if (!import.meta.client) return
  try {
    const { getBlogAnalytics } = useGoatCounter()
    const slug = generateSlug(props.post.title)
    analytics.value = await getBlogAnalytics(slug)
  }
  catch (error) {
    console.warn('Failed to load analytics for', props.post.title, error)
  }
  finally {
    analyticsLoading.value = false
  }
})
</script>
