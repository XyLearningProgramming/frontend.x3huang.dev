<script setup lang="ts">
/**
 * BouncingDots — Animated bouncing dots for idle/loading states.
 * Used inside chatty input placeholder area.
 */
withDefaults(defineProps<{
  count?: number
  size?: string
  color?: string
}>(), {
  count: 3,
  size: '8px',
  color: 'var(--color-neo-black)',
})
</script>

<template>
  <span class="bouncing-dots inline-flex items-center gap-1.5" role="status" aria-label="Loading">
    <span
      v-for="i in count"
      :key="i"
      class="bouncing-dot rounded-full"
      :style="{
        width: size,
        height: size,
        backgroundColor: color,
        animationDelay: `${(i - 1) * 150}ms`,
      }"
    />
  </span>
</template>

<style scoped>
.bouncing-dot {
  display: inline-block;
  animation: bounceDot 1.4s ease-in-out infinite;
}

@keyframes bounceDot {
  0%, 80%, 100% {
    transform: translateY(0) scale(1);
    opacity: 0.4;
  }
  40% {
    transform: translateY(-8px) scale(1.1);
    opacity: 1;
  }
}
</style>
