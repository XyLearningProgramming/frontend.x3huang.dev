<template>
  <div class="min-h-screen bg-neo-bg">
    <div class="mx-auto max-w-5xl px-6 py-12 md:py-16">
      <!-- Back -->
      <div class="mb-6">
        <NuxtLink to="/" class="neo-btn inline-flex items-center gap-2 bg-neo-white px-3 py-1.5 text-sm font-bold">
          <IconsArrowLeft class="w-4 h-4" />
          Home
        </NuxtLink>
      </div>

      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="mb-4">
          <span class="bg-neo-orange px-3 py-1 border-2 border-neo-black inline-block -rotate-1">
            Developer Tools
          </span>
        </h1>
        <p class="text-lg text-neo-text-muted max-w-2xl mx-auto">
          A collection of useful utilities and converters for developers and everyday use.
        </p>
      </div>

      <!-- Tools grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <NuxtLink to="/tools/base64" class="neo-card bg-neo-white p-6 text-center">
          <div class="text-4xl mb-4">🔐</div>
          <h3 class="text-xl font-bold mb-2">Base64 Encoder/Decoder</h3>
          <p class="text-sm text-neo-text-muted">Encode and decode Base64 strings quickly and easily.</p>
        </NuxtLink>

        <NuxtLink to="/tools/json" class="neo-card bg-neo-white p-6 text-center">
          <div class="text-4xl mb-4">📝</div>
          <h3 class="text-xl font-bold mb-2">JSON Editor</h3>
          <p class="text-sm text-neo-text-muted">Edit, format, and validate JSON data with a powerful online editor.</p>
        </NuxtLink>

        <NuxtLink to="/tools/jwt" class="neo-card bg-neo-white p-6 text-center">
          <div class="text-4xl mb-4">🔑</div>
          <h3 class="text-xl font-bold mb-2">JWT</h3>
          <p class="text-sm text-neo-text-muted">Decode, verify, and analyze JSON Web Tokens (JWT) securely.</p>
        </NuxtLink>

        <div class="neo-card bg-neo-bg p-6 text-center opacity-60">
          <div class="text-4xl mb-4">🚧</div>
          <h3 class="text-xl font-bold mb-2">More Coming Soon</h3>
          <p class="text-sm text-neo-text-muted">Additional utilities are in development.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconsArrowLeft from '~/components/icons/arrowLeft.vue'

useHead({
  title: 'Developer Tools - Xinyu Huang',
  meta: [
    { name: 'description', content: 'Collection of useful developer tools and utilities including Base64 encoder/decoder and more.' },
  ],
})
</script>
