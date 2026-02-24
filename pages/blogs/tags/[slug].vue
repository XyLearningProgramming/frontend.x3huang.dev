<template>
  <div class="min-h-screen bg-neo-section-posts text-neo-black py-16 px-4">
    <div class="container mx-auto max-w-screen-xl">
      <!-- Back navigation -->
      <div class="mb-6">
        <NuxtLink to="/blogs/tags"
          class="inline-flex items-center gap-2 text-neo-black/70 hover:text-neo-black transition-colors">
          <IconsArrowLeft class="w-4 h-4" />
          Back to All Tags
        </NuxtLink>
      </div>

      <!-- Header -->
      <div class="mb-8">
        <h1 class="font-neo-heading text-h2-sm md:text-h2 font-bold mb-2">
          Posts tagged with
          <span class="inline-block bg-neo-yellow px-3 py-1 border-2 border-neo-black -rotate-1"
            style="box-shadow: 3px 3px 0px 0px #000;">
            {{ decodedTag }}
          </span>
        </h1>
        <p v-if="filteredPostsCount > 0" class="text-neo-black/70 mt-4">
          {{ filteredPostsCount }} {{ filteredPostsCount === 1 ? 'post' : 'posts' }} found
        </p>
      </div>

      <!-- Posts -->
      <BlogList :posts="allPosts" :filter-tag="decodedTag" />
    </div>
  </div>
</template>

<script setup lang="ts">
import IconsArrowLeft from '~/components/icons/arrowLeft.vue'

const route = useRoute()
const tag = route.params.slug as string
const decodedTag = decodeURIComponent(tag || '')

// Fetch all posts
const { data: allPosts } = await useAsyncData('blog-posts-tag', () =>
  queryCollection('blogs').all()
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

useHead({
  title: `Posts tagged: ${decodedTag} - Blog - Xinyu Huang`,
  meta: [
    { name: 'description', content: `Browse all blog posts tagged with ${decodedTag}` }
  ]
})
</script>
