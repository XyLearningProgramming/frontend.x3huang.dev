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
  <div
    class="min-h-screen bg-gradient-to-br from-light-accent/20 to-dark-accent/20 dark:from-dark-accent/30 dark:to-light-accent/30 relative">
    <!-- Background overlay -->
    <div class="fixed inset-0 bg-black/40 dark:bg-black/60"></div>

    <!-- Main content -->
    <div class="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-8">
      <!-- Error Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-white mb-4 drop-shadow-2xl text-shadow-strong">
          {{ error?.statusCode }} - {{ error?.statusMessage }}
        </h1>
        <div class="relative">
          <div class="absolute inset-0 bg-black/20 rounded-2xl blur-xl"></div>
          <p
            class="relative text-lg text-white max-w-2xl mx-auto leading-relaxed drop-shadow-xl text-shadow-medium px-6 py-4">
            {{ getErrorDescription(error?.statusCode || 500) }}
          </p>
        </div>
      </div>

      <!-- Error Content -->
      <div class="relative">
        <div class="absolute inset-0 bg-black/20 rounded-2xl blur-xl"></div>
        <div class="relative glass-primary rounded-lg p-8 max-w-md">
          <div class="text-6xl mb-4">
            {{ getErrorEmoji(error?.statusCode || 500) }}
          </div>
          <p class="text-glass-muted mb-6">
            {{ getErrorMessage(error?.statusCode || 500) }}
          </p>

          <div class="space-y-3">
            <button @click="handleError"
              class="inline-flex items-center justify-center gap-2 w-full px-6 py-3 glass-secondary rounded-lg text-glass hover:text-white hover:bg-white/30 transition-all duration-200">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </button>

            <!-- <button 
              @click="clearError"
              class="inline-flex items-center justify-center gap-2 w-full px-6 py-3 glass-primary rounded-lg text-glass-muted hover:text-glass hover:bg-white/20 transition-all duration-200"
            >
              Clear Error
            </button> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.glass-primary {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.glass-secondary {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.text-glass {
  color: rgba(255, 255, 255, 0.9);
}

.text-glass-muted {
  color: rgba(255, 255, 255, 0.7);
}

.text-shadow-strong {
  text-shadow:
    0 2px 4px rgba(0, 0, 0, 0.8),
    0 4px 8px rgba(0, 0, 0, 0.6),
    0 8px 16px rgba(0, 0, 0, 0.4);
}

.text-shadow-medium {
  text-shadow:
    0 1px 2px rgba(0, 0, 0, 0.8),
    0 2px 4px rgba(0, 0, 0, 0.6),
    0 4px 8px rgba(0, 0, 0, 0.3);
}
</style>