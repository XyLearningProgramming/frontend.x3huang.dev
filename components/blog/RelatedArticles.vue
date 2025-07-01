<template>
  <div class="bg-light-surface dark:bg-dark-surface rounded-lg p-4 border border-light-border dark:border-dark-border">
    <h3 class="text-lg font-semibold text-light-text-strong dark:text-dark-text-strong mb-4">Continue Reading</h3>

    <div class="space-y-3">
      <template v-for="(other, index) in surround" :key="index">
        <div v-if="other" class="border-l-2 border-light-accent dark:border-dark-accent pl-3">
          <NuxtLink :to="other.path + '/'"
            class="text-light-text-strong dark:text-dark-text-strong hover:text-light-accent dark:hover:text-dark-accent hover:underline transition-colors block font-medium"
            :aria-label="other.headline">
            {{ other.headline }}
          </NuxtLink>
          <p v-if="other.description" class="text-sm text-light-text dark:text-dark-text mt-1 line-clamp-2">
            {{ other.description }}
          </p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
defineProps({
  surround: {
    type: Array,
    required: true
  }
});
</script>
