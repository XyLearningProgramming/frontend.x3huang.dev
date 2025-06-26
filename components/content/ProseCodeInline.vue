<template>
  <code class="inline-code">
    <slot />
  </code>
</template>

<style scoped>
.inline-code {
  @apply px-1.5 py-0.5 bg-light-border dark:bg-dark-border text-light-text-strong dark:text-dark-text-strong rounded text-sm font-mono;
}
</style>