<template>
  <main>
    <BlogHero />
    <Section id="main" class="!pt-0">
      <!-- Ensure posts is defined before rendering -->
      <BlogList v-if="posts" :data="posts" />

      <BlogPagination v-if="totalPages && totalPages > 1" class="mt-8" :currentPage="1" :totalPages="totalPages"
        :nextPage="totalPages > 1" baseUrl="/blog/" pageUrl="/blog/page/" />
    </Section>
  </main>
</template>

<script setup lang="ts">
// Find the number of blogs present
const blogCountLimit = 6

// 1. Total pages
const { data: totalPages } = await useAsyncData('blog-total-pages', async () => {
  const allPosts = await queryCollection('blog').find()
  return Math.ceil(allPosts.length / blogCountLimit)
})

// 2. First page posts, sorted by date descending
const { data: posts } = await useAsyncData('blog-page-1', async () => {
  return queryCollection('blog')
    .sort({ date: 'desc' })
    .limit(blogCountLimit)
    .find()
})
</script>
