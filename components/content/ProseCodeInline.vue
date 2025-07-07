<template>
  <code class="inline-code">
    <slot />
  </code>
</template>

<style scoped>
.inline-code {
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  background-color: rgba(30, 30, 30, 0.8);
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.9em;
  font-weight: 400;
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
}
</style>