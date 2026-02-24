<template>
  <div class="mb-8">
    <h1 class="mb-2">{{ title }}</h1>
    <p v-if="description" class="text-lg text-neo-text-muted max-w-2xl leading-relaxed">
      {{ description }}
    </p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  description?: string
}

defineProps<Props>()
</script>
