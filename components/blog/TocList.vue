<template>
  <nav class="toc-list" aria-label="Table of contents">
    <ul class="space-y-1">
      <li
        v-for="item in items"
        :key="item.id"
        :class="{ 'pl-4': item.level === 3 }"
      >
        <button
          class="toc-link w-full text-left text-sm py-1 px-2 transition-all duration-150"
          :class="{
            'toc-link--active': item.id === activeId,
            'toc-link--h3': item.level === 3,
          }"
          @click="emit('navigate', item.id)"
        >
          {{ item.label }}
        </button>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
interface TocItem {
  id: string
  label: string
  level: number
}

defineProps<{
  items: TocItem[]
  activeId: string
}>()

const emit = defineEmits<{
  navigate: [id: string]
}>()
</script>

<style scoped>
.toc-link {
  color: rgba(240, 237, 229, 0.5);
  border-left: 2px solid transparent;
  font-weight: 500;
  line-height: 1.4;
}

.toc-link:hover {
  color: rgba(240, 237, 229, 0.85);
  border-left-color: rgba(240, 237, 229, 0.3);
}

.toc-link--active {
  color: var(--color-dali-red) !important;
  border-left-color: var(--color-dali-red) !important;
  font-weight: 700;
}

.toc-link--h3 {
  font-size: 0.8rem;
}
</style>
