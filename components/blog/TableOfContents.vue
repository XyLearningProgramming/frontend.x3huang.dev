<template>
  <GlassCard tag="nav" variant="primary" padding="lg" radius="lg" class="w-60 shadow-lg">
    <header class="flex items-center justify-between cursor-pointer mb-4" @click="toggleToc"
      aria-label="Expand the table of contents">
      <h3 class="text-lg font-semibold text-glass">Contents</h3>
      <svg
        :class="['w-5 h-5 transform transition-transform text-glass', isVisible ? '' : 'rotate-180']"
        fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </header>

    <nav v-if="links" :class="['space-y-2', isVisible ? 'block' : 'hidden']">
      <a v-for="link of flattenLinks(links)" :key="link.id" :href="`#${link.id}`" :class="[
        'text-sm text-glass-muted hover:text-glass transition-all duration-200 block py-2 px-3 rounded-lg hover:bg-white/20 leading-relaxed border-l-2 border-transparent hover:border-white/60',
        `toc-link_${link.depth}`
      ]">
        {{ link.text }}
      </a>
    </nav>
  </GlassCard>
</template>

<script setup>
import GlassCard from '~/components/ui/GlassCard.vue'
import { ref } from 'vue';

defineProps({
  links: {
    type: Array,
    required: true
  }
});

// flatten TOC links nested arrays to one array
const flattenLinks = (links) => {
  let _links = links
    .map((link) => {
      let _link = [link];
      if (link.children) {
        // recursively flatten children links
        let flattened = flattenLinks(link.children);
        _link = [link, ...flattened];
      }
      return _link;
    })
    .flat(1);
  return _links;
};

const isVisible = ref(true);
const toggleToc = () => {
  isVisible.value = !isVisible.value;
}
</script>

<style scoped>
.toc-link_1 {
  font-weight: 600;
}

.toc-link_2 {
  padding-left: 1rem;
  font-weight: 500;
}

.toc-link_3 {
  padding-left: 1.75rem;
  font-weight: 400;
  opacity: 0.9;
}

.toc-link_4 {
  padding-left: 2.5rem;
  font-weight: 400;
  opacity: 0.8;
  font-size: 0.875rem;
}

.toc-link_5 {
  padding-left: 3.25rem;
  font-weight: 400;
  opacity: 0.7;
  font-size: 0.875rem;
}

.toc-link_6 {
  padding-left: 4rem;
  font-weight: 400;
  opacity: 0.6;
  font-size: 0.8125rem;
}
</style>