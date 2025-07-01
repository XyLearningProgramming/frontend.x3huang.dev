<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-900 dark:to-black relative">
    
    <!-- Main content -->
    <div class="relative z-10 min-h-screen">
      <div :class="containerClass">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  containerWidth?: 'normal' | 'wide' | 'full'
}

const props = withDefaults(defineProps<Props>(), {
  containerWidth: 'normal'
})

const containerClass = computed(() => {
  const base = 'mx-auto py-8 px-8'
  switch (props.containerWidth) {
    case 'wide': return `${base} max-w-6xl`
    case 'full': return `${base} max-w-full`
    default: return `${base} max-w-4xl`
  }
})
</script>