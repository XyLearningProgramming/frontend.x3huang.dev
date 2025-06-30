<template>
  <!-- Toggle hint button when sidebar is hidden -->
  <Card
    v-if="!isExpanded"
    tag="button"
    @click="toggleSidebar"
    class="fixed left-4 top-4 z-50 shadow-lg hover:shadow-xl"
    variant="default"
    padding="sm"
    radius="lg"
    hover
    clickable
    title="Show sidebar"
  >
    <svg class="w-5 h-5 text-light-text dark:text-dark-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  </Card>

  <aside
    :class="[
      'fixed left-0 top-0 h-screen bg-light-surface dark:bg-dark-surface border-r border-light-border dark:border-dark-border overflow-y-auto flex flex-col transition-transform duration-300 z-30',
      isExpanded ? 'w-64 translate-x-0' : 'w-64 -translate-x-full'
    ]">
    <div class="p-6 flex-1">
      <!-- Close button for mobile -->
      <div v-if="isMobile" class="flex justify-end mb-4">
        <button 
          @click="toggleSidebar"
          class="p-1 text-light-text dark:text-dark-text hover:text-light-accent dark:hover:text-dark-accent transition-colors"
          title="Close sidebar"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="space-y-4">
        <NuxtLink to="/" :class="getLinkClass('/')">
          Home
        </NuxtLink>
        <NuxtLink to="/blogs" :class="getLinkClass('/blogs')">
          Blogs
        </NuxtLink>
        <NuxtLink to="/blogs/tags" :class="getLinkClass('/blogs/tags')">
          Tags
        </NuxtLink>
        <NuxtLink to="/blogs/timeline" :class="getLinkClass('/blogs/timeline')">
          Timeline
        </NuxtLink>
        <NuxtLink to="/tools" :class="getLinkClass('/tools')">
          Tools
        </NuxtLink>
        <NuxtLink to="/contact" :class="getLinkClass('/contact')">
          Contact
        </NuxtLink>
        <NuxtLink to="/about" :class="getLinkClass('/about')">
          About
        </NuxtLink>
      </nav>

      <!-- Additional content slot -->
      <div v-if="$slots.default" class="mt-6">
        <slot />
      </div>
    </div>

    <!-- Bottom section with icons and theme toggle -->
    <div class="p-6 border-t border-light-border dark:border-dark-border">
      <!-- Icons and Theme Toggle -->
      <div class="flex justify-between items-center">
        <!-- Theme Toggle -->
        <Card
          tag="button"
          @click="toggleTheme"
          class="bg-light-bg dark:bg-dark-bg hover:bg-light-border dark:hover:bg-dark-border"
          variant="minimal"
          padding="sm"
          radius="lg"
          hover
          clickable
          title="Toggle theme">
          <span v-if="isDark">🌞</span>
          <span v-else>🌙</span>
        </Card>

        <!-- Social Icons -->
        <div class="flex space-x-3">
          <a v-for="icon in socialIcons" :key="icon.name" :href="icon.url" target="_blank" rel="noopener noreferrer"
            class="w-6 h-6 text-light-text dark:text-dark-text hover:text-light-accent dark:hover:text-dark-accent transition-colors"
            :title="icon.name">
            <component :is="icon.component" />
          </a>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import Card from '~/components/ui/Card.vue'
import IconsGithub from './icons/github.vue'
import IconsLinkedin from './icons/linkedin.vue'
import IconsTwitter from './icons/twitter.vue'
import IconsInstagram from './icons/instagram.vue'

interface Props {
  activePage?: string
}

const props = withDefaults(defineProps<Props>(), {
  activePage: ''
})

const isDark = ref(false)
const route = useRoute()
const { isExpanded, isMobile, checkMobileSize, toggleSidebar } = useSidebar()

// Social icons configuration
const socialIcons = [
  {
    name: 'GitHub',
    url: 'https://github.com/username',
    component: IconsGithub
  },
  {
    name: 'LinkedIn',
    url: 'https://linkedin.com/in/username',
    component: IconsLinkedin
  },
  {
    name: 'Twitter',
    url: 'https://twitter.com/username',
    component: IconsTwitter
  },
  {
    name: 'Instagram',
    url: 'https://instagram.com/username',
    component: IconsInstagram
  }
]

// Get the current route path for active state
const currentPath = computed(() => {
  if (props.activePage) return props.activePage
  return route.path
})

// Generate class for navigation links
const getLinkClass = (path: string) => {
  const baseClasses = 'w-full text-left px-4 py-2 rounded-lg transition-colors block'
  const activeClasses = 'bg-light-accent dark:bg-dark-accent text-white'
  const inactiveClasses = 'hover:bg-light-border dark:hover:bg-dark-border'

  const isActive = currentPath.value === path ||
    (path === '/' && currentPath.value.startsWith('/?')) // Handle home page with query params

  return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  if (import.meta.client) {
    document.documentElement.classList.toggle('dark', isDark.value)
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  }
}


// Initialize theme and responsive behavior
onMounted(() => {
  if (import.meta.client) {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    isDark.value = savedTheme ? savedTheme === 'dark' : prefersDark
    document.documentElement.classList.toggle('dark', isDark.value)
    
    // Initialize mobile check
    checkMobileSize()
    
    // Listen for window resize
    window.addEventListener('resize', checkMobileSize)
  }
})

// Cleanup
onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener('resize', checkMobileSize)
  }
})
</script>