<template>
  <div class="neo-card bg-neo-white p-6">
    <h3 class="text-lg font-bold text-neo-black mb-4">Continue Reading</h3>

    <div class="space-y-3">
      <template v-for="(other, index) in surround" :key="index">
        <div v-if="other" class="border-l-4 border-neo-black pl-3">
          <NuxtLink
            :to="other.path + '/'"
            class="text-neo-black hover:text-neo-blue transition-colors block font-bold"
            :aria-label="other.headline">
            {{ other.headline }}
          </NuxtLink>
          <p v-if="other.description" class="text-sm text-neo-black/60 mt-1 line-clamp-2">
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
