<template>
  <component 
    :is="props.type"
    :id="props.id"
    :class="[
      'px-6 py-8 sm:px-8 sm:py-12 relative',
      'bg-light-bg dark:bg-dark-bg',
      'text-light-text dark:text-dark-text',
      props.fullHeight ? 'min-h-screen' : '',
      props.surface ? 'bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg' : '',
      props.centered ? 'flex items-center justify-center' : ''
    ]"
  >
    <slot />
  </component>
</template>

<script setup>
const props = defineProps({
  id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'section'
  },
  fullHeight: {
    type: Boolean,
    default: false
  },
  surface: {
    type: Boolean,
    default: false
  },
  centered: {
    type: Boolean,
    default: false
  }
})
</script>
