<template>
  <component
    :is="tag"
    :class="cardClasses"
    v-bind="$attrs"
    @click="handleClick">
    <slot />
  </component>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'default' | 'elevated' | 'outlined' | 'minimal'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  hover?: boolean
  clickable?: boolean
  tag?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  padding: 'md',
  radius: 'lg',
  hover: false,
  clickable: false,
  tag: 'div'
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const cardClasses = computed(() => {
  const classes = ['card']
  
  // Base styles
  classes.push('transition-all duration-200')
  
  // Variants
  switch (props.variant) {
    case 'elevated':
      classes.push('bg-light-surface dark:bg-dark-surface shadow-md border border-light-border dark:border-dark-border')
      break
    case 'outlined':
      classes.push('bg-transparent border-2 border-light-border dark:border-dark-border')
      break
    case 'minimal':
      classes.push('bg-transparent')
      break
    default:
      classes.push('bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border')
  }
  
  // Padding
  switch (props.padding) {
    case 'none':
      break
    case 'sm':
      classes.push('p-3')
      break
    case 'md':
      classes.push('p-4')
      break
    case 'lg':
      classes.push('p-6')
      break
    case 'xl':
      classes.push('p-8')
      break
  }
  
  // Radius
  switch (props.radius) {
    case 'none':
      break
    case 'sm':
      classes.push('rounded-sm')
      break
    case 'md':
      classes.push('rounded-md')
      break
    case 'lg':
      classes.push('rounded-lg')
      break
    case 'xl':
      classes.push('rounded-xl')
      break
  }
  
  // Interactive states
  if (props.hover || props.clickable) {
    classes.push('hover:shadow-lg')
    if (props.variant === 'outlined') {
      classes.push('hover:border-light-accent dark:hover:border-dark-accent')
    }
  }
  
  if (props.clickable) {
    classes.push('cursor-pointer')
  }
  
  return classes.join(' ')
})

const handleClick = (event: MouseEvent) => {
  if (props.clickable) {
    emit('click', event)
  }
}
</script>

<style scoped>
.card {
  /* Additional custom styles can be added here */
}
</style>