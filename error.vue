<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps({
  error: Object as () => NuxtError
})

const getErrorEmoji = (statusCode: number) => {
  switch (statusCode) {
    case 404: return '🔍'
    case 403: return '🚫'
    case 500: return '💥'
    case 503: return '🔧'
    default: return '❌'
  }
}

const getErrorDescription = (statusCode: number) => {
  switch (statusCode) {
    case 404: return "The page you're looking for doesn't exist or has been moved."
    case 403: return "You don't have permission to access this resource."
    case 500: return "Something went wrong on our end. We're working to fix it."
    case 503: return "The service is temporarily unavailable. Please try again later."
    default: return "An unexpected error occurred. Please try again."
  }
}

const getErrorMessage = (statusCode: number) => {
  switch (statusCode) {
    case 404: return "You've reached no man's land..."
    case 403: return "Access denied to this area."
    case 500: return "Our servers are having trouble."
    case 503: return "We're temporarily down for maintenance."
    default: return "Something unexpected happened."
  }
}

const handleError = () => clearError({ redirect: '/' })

// SEO meta
useHead({
  title: computed(() => `${props.error?.statusCode} - Error | Xinyu Huang`),
  meta: [
    { name: 'description', content: computed(() => getErrorDescription(props.error?.statusCode || 500)) },
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})
</script>

<template>
  <div class="min-h-screen bg-neo-bg flex flex-col items-center justify-center text-center px-8">
    <!-- Error Header -->
    <div class="text-center mb-8">
      <h1 class="font-neo-heading text-6xl md:text-8xl font-bold text-neo-black mb-4">
        {{ error?.statusCode }}
      </h1>
      <p class="text-xl md:text-2xl font-bold text-neo-black mb-2">
        {{ error?.statusMessage }}
      </p>
      <p class="text-lg text-neo-black/70 max-w-2xl mx-auto leading-relaxed">
        {{ getErrorDescription(error?.statusCode || 500) }}
      </p>
    </div>

    <!-- Error Content -->
    <div class="neo-border bg-neo-bg p-8 max-w-md w-full relative" style="box-shadow: 6px 6px 0px 0px #000;">
      <div class="text-6xl mb-4">
        {{ getErrorEmoji(error?.statusCode || 500) }}
      </div>
      <p class="text-neo-black/70 mb-6">
        {{ getErrorMessage(error?.statusCode || 500) }}
      </p>

      <div class="space-y-3">
        <button @click="handleError"
          class="inline-flex items-center justify-center gap-2 w-full px-6 py-3 neo-border bg-neo-yellow text-neo-black font-bold hover:bg-neo-orange transition-colors rounded-none"
          style="box-shadow: 4px 4px 0px 0px #000;">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </button>
      </div>
    </div>
  </div>
</template>
