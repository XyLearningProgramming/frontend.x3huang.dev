<template>
  <div
    class="min-h-screen bg-gradient-to-br from-light-accent/20 to-dark-accent/20 dark:from-dark-accent/30 dark:to-light-accent/30 bg-cover bg-center bg-no-repeat relative"
    :style="{ backgroundImage: currentBackground ? `url(${currentBackground.url})` : 'none' }">
    <!-- Background overlay for better readability -->
    <div class="absolute inset-0 bg-black/20 dark:bg-black/40"></div>

    <!-- Photo notes -->
    <div v-if="currentBackground?.note" class="absolute bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md">
      <div class="bg-black/30 backdrop-blur-sm rounded-lg p-3 text-white border border-white/20">
        <h4 v-if="currentBackground.title" class="font-medium text-sm mb-1">{{ currentBackground.title }}</h4>
        <p class="text-xs text-white/90">{{ currentBackground.note }}</p>
      </div>
    </div>

    <!-- Main content -->
    <div class="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
      <!-- Profile section -->
      <div class="text-center mb-12">
        <!-- Profile photo -->
        <div class="mb-6">
          <div
            class="w-32 h-32 rounded-full mx-auto shadow-2xl border-4 border-white/30 overflow-hidden bg-gradient-to-br from-light-accent to-dark-accent flex items-center justify-center ring-4 ring-white/10">
            <img :src="profile.image" :alt="profile.name" class="w-full h-full object-cover"
              @error="showFallback = true" v-show="!showFallback" />
            <span v-show="showFallback" class="text-4xl text-white font-bold drop-shadow-lg">{{ profile.initials
              }}</span>
          </div>
        </div>

        <!-- Name and title -->
        <h1 class="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-2xl text-shadow-strong">
          {{ profile.name }}
        </h1>

        <!-- Motto/Introduction -->
        <div class="relative">
          <div class="absolute inset-0 bg-black/20 rounded-2xl blur-xl"></div>
          <p
            class="relative text-xl md:text-2xl text-white max-w-2xl mx-auto leading-relaxed drop-shadow-xl text-shadow-medium px-6 py-4">
            {{ profile.motto }}<br>
            <!-- {{ profile.subtitle }} -->
          </p>
        </div>
      </div>

      <!-- Navigation cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl w-full">
        <NuxtLink v-for="card in navigationCards" :key="card.title" :to="card.route" class="block group h-full">
          <Card variant="default" padding="lg" radius="lg" hover clickable
            class="bg-white/10 backdrop-blur-md border-white/20 text-center transition-all duration-300 group-hover:bg-white/20 group-hover:scale-105 h-full flex flex-col justify-between">
            <div class="text-white">
              <div class="text-3xl mb-4">{{ card.icon }}</div>
              <h3 class="text-xl font-semibold mb-2">{{ card.title }}</h3>
              <p class="text-white/80 text-sm">{{ card.description }}</p>
            </div>
          </Card>
        </NuxtLink>
      </div>

      <!-- Footer note -->
      <div class="mt-12 text-center">
        <p class="text-white/60 text-sm">
          {{ profile.welcomeMessage }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Card from '~/components/ui/Card.vue'

// ========== CUSTOMIZABLE CONTENT ==========
// Profile Information
const profile = {
  name: 'Xinyu Huang',
  initials: 'XH',
  image: '/images/profile.png',
  motto: 'Software developer hit by joys and woes of the craft.',
  // subtitle: 'Building digital experiences one line of code at a time.',
  welcomeMessage: 'Welcome to my digital space powered by vue, nuxt, and nuxt content'
}

// Navigation Cards
const navigationCards = [
  {
    title: 'Blogs',
    icon: '📝',
    description: 'Technical articles and thoughts',
    route: '/blogs'
  },
  {
    title: 'Tools',
    icon: '🛠️',
    description: 'Useful utilities and converters',
    route: '/tools'
  },
  {
    title: 'About',
    icon: '👋',
    description: 'Learn more about me',
    route: '/about'
  },
  {
    title: 'Contact',
    icon: '💬',
    description: 'Get in touch with me',
    route: '/contact'
  },
]

// SEO Configuration
const seoConfig = {
  title: 'Xinyu Huang - Developer & Tech Enthusiast',
  description: 'Welcome to Xinyu Huang\'s digital space x3huang.dev. Passionate developer, lifelong learner, and tech enthusiast sharing insights on web development, technology, and more.',
  keywords: 'Xinyu Huang, developer, full-stack, technology, blog, tools, x3huang.dev',
  ogTitle: 'Xinyu Huang - Developer & Tech Enthusiast',
  ogDescription: 'Welcome to my digital space. Passionate developer sharing insights on software development and technology.'
}
// ========== END CUSTOMIZABLE CONTENT ==========

const { currentBackground, initializeBackground } = useBackgroundGallery()
const showFallback = ref(false)

// Initialize background on mount
onMounted(() => {
  initializeBackground()
})

// SEO meta
useHead({
  title: seoConfig.title,
  meta: [
    { name: 'description', content: seoConfig.description },
    { name: 'keywords', content: seoConfig.keywords },
    { property: 'og:title', content: seoConfig.ogTitle },
    { property: 'og:description', content: seoConfig.ogDescription },
    { property: 'og:type', content: 'website' }
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