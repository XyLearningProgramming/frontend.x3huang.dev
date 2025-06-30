<template>
  <Card
    v-bind="$attrs"
    :class="glassCardClasses"
    @click="handleClick">
    <slot />
  </Card>
</template>

<script setup lang="ts">
import Card from './Card.vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'subtle'
  hover?: boolean
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  hover: false,
  clickable: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const glassCardClasses = computed(() => {
  const baseClasses = []
  
  // Glass effect variants
  switch (props.variant) {
    case 'secondary':
      baseClasses.push('bg-white/20 backdrop-blur-sm border-white/30')
      break
    case 'subtle':
      baseClasses.push('bg-white/5 backdrop-blur-sm border-white/10')
      break
    default:
      baseClasses.push('bg-white/10 backdrop-blur-md border-white/20')
  }
  
  // Interactive states
  if (props.hover || props.clickable) {
    baseClasses.push('transition-all duration-300 hover:bg-white/20 hover:scale-105')
  }
  
  if (props.clickable) {
    baseClasses.push('cursor-pointer')
  }
  
  return baseClasses.join(' ')
})

const handleClick = (event: MouseEvent) => {
  // Always emit click event, regardless of clickable prop
  // The clickable prop just controls styling, not functionality
  emit('click', event)
}
</script>