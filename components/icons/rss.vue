<template>
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    :class="props.class"
  >
    <path 
      d="M4 11a9 9 0 0 1 9 9"
      stroke="currentColor" 
      stroke-width="2" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    />
    <path 
      d="M4 4a16 16 0 0 1 16 16" 
      stroke="currentColor" 
      stroke-width="2" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    />
    <circle 
      cx="5" 
      cy="19" 
      r="1" 
      fill="currentColor"
    />
  </svg>
</template>

<script setup lang="ts">
interface Props {
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  class: 'w-6 h-6'
})
</script>