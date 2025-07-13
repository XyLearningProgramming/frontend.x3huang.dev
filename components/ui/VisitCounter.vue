<template>
  <div 
    v-if="!loading"
    class="flex items-center justify-center gap-1 text-glass-muted text-sm"
  >
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 5.197v1M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
    <span>
      {{ formatCount(visitCount) }} {{ getPlural(visitCount) }}
    </span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  path: string
  singularText?: string
  pluralText?: string
}

const props = withDefaults(defineProps<Props>(), {
  singularText: 'visit',
  pluralText: 'visits'
})

const { getVisitCount } = useGoatCounter()

const visitCount = ref(0)
const loading = ref(true)

// Fetch visit count on mount
onMounted(async () => {
  try {
    visitCount.value = await getVisitCount(props.path)
  } catch (error) {
    console.warn('Failed to load visit count:', error)
  } finally {
    loading.value = false
  }
})

// Format large numbers with k/M suffixes
const formatCount = (count: number): string => {
  if (count === 0) return '0'
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`
  }
  return count.toString()
}

// Get plural text based on count
const getPlural = (count: number): string => {
  return count === 1 ? props.singularText : props.pluralText
}
</script>