<template>
  <BackgroundLayout container-width="wide" overlay-intensity="heavy" blur-background>
        <!-- Header -->
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-white mb-4 drop-shadow-2xl text-shadow-strong">
            Developer Tools
          </h1>
          <div class="relative">
            <div class="absolute inset-0 bg-black/20 rounded-2xl blur-xl"></div>
            <p class="relative text-lg text-white max-w-2xl mx-auto leading-relaxed drop-shadow-xl text-shadow-medium px-6 py-4">
              A collection of useful utilities and converters for developers and everyday use.
            </p>
          </div>
        </div>

        <!-- Tools grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Base64 Tool -->
          <NuxtLink to="/tools/base64" class="block group">
            <Card 
              variant="default" 
              padding="lg" 
              radius="lg" 
              hover
              clickable
              class="bg-white/10 backdrop-blur-md border-white/20 text-center transition-all duration-300 group-hover:bg-white/20 group-hover:scale-105 h-full"
            >
              <div class="text-white">
                <div class="text-4xl mb-4">🔐</div>
                <h3 class="text-xl font-semibold mb-2">
                  Base64 Encoder/Decoder
                </h3>
                <p class="text-white/80">
                  Encode and decode Base64 strings quickly and easily.
                </p>
              </div>
            </Card>
          </NuxtLink>

          <!-- JSON Editor Tool -->
          <NuxtLink to="/tools/json" class="block group">
            <Card 
              variant="default" 
              padding="lg" 
              radius="lg" 
              hover
              clickable
              class="bg-white/10 backdrop-blur-md border-white/20 text-center transition-all duration-300 group-hover:bg-white/20 group-hover:scale-105 h-full"
            >
              <div class="text-white">
                <div class="text-4xl mb-4">📝</div>
                <h3 class="text-xl font-semibold mb-2">
                  JSON Editor
                </h3>
                <p class="text-white/80">
                  Edit, format, and validate JSON data with a powerful online editor.
                </p>
              </div>
            </Card>
          </NuxtLink>

          <!-- More tools can be added here -->
          <div class="block opacity-50">
            <Card 
              variant="outlined" 
              padding="lg" 
              radius="lg"
              class="bg-white/10 backdrop-blur-md border-white/20 text-center h-full"
            >
              <div class="text-white">
                <div class="text-4xl mb-4">🚧</div>
                <h3 class="text-xl font-semibold mb-2">
                  More Tools Coming Soon
                </h3>
                <p class="text-white/80">
                  Additional utilities are in development.
                </p>
              </div>
            </Card>
          </div>
        </div>

        <!-- Back to home -->
        <div class="text-center mt-12">
          <NuxtLink 
            to="/" 
            class="inline-flex items-center gap-2 text-white hover:text-white/80 transition-colors drop-shadow-lg"
          >
            <IconsArrowLeft class="w-4 h-4" />
            Back to Home
          </NuxtLink>
        </div>
  </BackgroundLayout>
</template>

<script setup lang="ts">
import Card from '~/components/ui/Card.vue'
import IconsArrowLeft from '~/components/icons/arrowLeft.vue'
import BackgroundLayout from '~/components/layouts/BackgroundLayout.vue'

useHead({
  title: 'Developer Tools - Xinyu Huang',
  meta: [
    { name: 'description', content: 'Collection of useful developer tools and utilities including Base64 encoder/decoder and more.' }
  ]
})
</script>

<style scoped>
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