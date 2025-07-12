<template>
  <div class="repo-github-wrapper">
    <a :href="props.url" target="_blank" rel="noopener noreferrer" class="block no-underline">
      <GlassCard variant="subtle" hover clickable class="repo-github-card group cursor-pointer">
        <div class="flex items-center gap-2 pb-1">
          <!-- Repository Info -->
          <div class="flex-1 min-w-0">
            <!-- Repository Name -->
            <div class="flex items-center justify-between gap-2 mb-0.5">
              <h4 class="text-xs font-normal text-glass/90 truncate leading-tight">
                {{ repoOwner }}/{{ repoName }}
              </h4>
              <div class="opacity-0 group-hover:opacity-60 transition-opacity duration-200">
                <svg class="w-3 h-3 text-glass-muted flex-shrink-0" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </div>

            <!-- Description -->
            <p v-if="displayDescription" class="text-sm text-glass-muted/90 mb-1.5 line-clamp-2 leading-relaxed">
              {{ displayDescription }}
            </p>

            <!-- Repository Stats - Only show if mounted and we have data -->
            <div v-if="mounted && !loading && (language || stars !== null || forks !== null || lastUpdated)"
              class="flex items-center gap-3 text-xs text-glass-muted/70">
              <div v-if="language" class="flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: getLanguageColor(language) }"></span>
                <span>{{ language }}</span>
              </div>
              <div v-if="stars !== null" class="flex items-center gap-0.5">
                <span>⭐</span>
                <span>{{ formatNumber(stars) }}</span>
              </div>
              <div v-if="forks !== null" class="flex items-center gap-0.5">
                <span>🍴</span>
                <span>{{ formatNumber(forks) }}</span>
              </div>
              <div v-if="lastUpdated" class="text-glass-muted/60">
                {{ lastUpdated }}
              </div>
            </div>

            <!-- Placeholder for stats on SSR -->
            <div v-else-if="!mounted" class="h-4 pb-1"></div>
          </div>
        </div>
      </GlassCard>
    </a>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import GlassCard from '~/components/ui/GlassCard.vue'

interface Props {
  url: string
  description?: string
}

const props = defineProps<Props>()

const repoData = ref<any>(null)
const loading = ref(false)
const mounted = ref(false)

// Static parsing - always available for SSR
const urlMatch = props.url.match(/github\.com\/([^\/]+)\/([^\/]+)/)
const staticRepoOwner = urlMatch ? urlMatch[1] : ''
const staticRepoName = urlMatch ? urlMatch[2] : ''

// Dynamic data - computed properties that fallback to static
const repoOwner = computed(() => {
  return repoData.value?.owner?.login || staticRepoOwner
})

const repoName = computed(() => {
  return repoData.value?.name || staticRepoName
})

const displayDescription = computed(() => {
  // Prioritize GitHub API description, fallback to custom description
  return repoData.value?.description || props.description || ''
})

const language = computed(() => {
  return repoData.value?.language || null
})

const stars = computed(() => {
  return repoData.value?.stargazers_count ?? null
})

const forks = computed(() => {
  return repoData.value?.forks_count ?? null
})

const lastUpdated = computed(() => {
  if (!repoData.value?.updated_at) return null

  const date = new Date(repoData.value.updated_at)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 1) return '1d'
  if (diffDays < 30) return `${diffDays}d`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo`
  return `${Math.floor(diffDays / 365)}y`
})

const formatNumber = (num: number) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

const getLanguageColor = (lang: string): string => {
  const colors: Record<string, string> = {
    'JavaScript': '#f1e05a',
    'TypeScript': '#2b7489',
    'Python': '#3572A5',
    'Java': '#b07219',
    'C++': '#f34b7d',
    'C': '#555555',
    'Go': '#00ADD8',
    'Rust': '#dea584',
    'PHP': '#4F5D95',
    'Ruby': '#701516',
    'Swift': '#ffac45',
    'Kotlin': '#F18E33',
    'Scala': '#c22d40',
    'C#': '#239120',
    'Dart': '#00B4AB',
    'Vue': '#2c3e50',
    'HTML': '#e34c26',
    'CSS': '#1572B6',
    'Shell': '#89e051',
    'Dockerfile': '#384d54'
  }
  return colors[lang] || '#858585'
}

const fetchRepoData = async () => {
  if (!staticRepoOwner || !staticRepoName) return

  loading.value = true

  try {
    const response = await fetch(`https://api.github.com/repos/${staticRepoOwner}/${staticRepoName}`)
    if (response.ok) {
      repoData.value = await response.json()
    }
  } catch (err) {
    console.warn('Failed to fetch GitHub repo data:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  mounted.value = true
  fetchRepoData()
})
</script>

<style scoped>
.repo-github-wrapper {
  margin: 0.5rem 0 1.5rem 0;
}

.repo-github-card {
  transition: all 0.3s ease;
  padding: 0.5rem;
}

.no-underline {
  text-decoration: none !important;
}

.no-underline:hover {
  text-decoration: none !important;
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 1;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 2;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .repo-github-card {
    padding: 0.275rem;
  }

  .repo-github-wrapper {
    margin: 0.275rem 0;
  }
}
</style>