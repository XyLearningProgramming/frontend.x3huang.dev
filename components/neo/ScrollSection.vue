<script setup lang="ts">
/**
 * ScrollSection — Simplified section wrapper for the unified-canvas design.
 * No background color prop; the single cream background comes from the page.
 */
const props = withDefaults(
  defineProps<{
    id: string
    minHeight?: string
    padding?: string
  }>(),
  {
    minHeight: 'auto',
    padding: 'py-16 md:py-24 px-6 md:px-12',
  },
)
</script>

<template>
  <section
    :id="props.id"
    :class="['relative w-full', props.padding]"
    :style="{ minHeight: props.minHeight }"
  >
    <div class="mx-auto max-w-6xl">
      <slot />
    </div>
  </section>
</template>
