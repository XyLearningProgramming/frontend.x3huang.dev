<template>
  <nav class="bg-light-surface dark:bg-dark-surface rounded-lg p-4 border border-light-border dark:border-dark-border">
    <header 
      class="flex flex-row justify-between items-center cursor-pointer mb-4" 
      @click="toggleToc" 
      aria-label="Expand the table of contents"
    >
      <h3 class="text-lg font-semibold text-light-text-strong dark:text-dark-text-strong">Table of Contents</h3>
      <IconsChevronDown 
        :class="['w-5 h-5 transform transition-transform text-light-text dark:text-dark-text', isVisible ? '' : 'rotate-180']" 
        width="20" 
        height="20"
      />
    </header>
    
    <ul v-if="links" :class="['space-y-2', isVisible ? 'block' : 'hidden']">
      <li 
        v-for="link of flattenLinks(links)" 
        :key="link.id" 
        :class="`toc-link_${link.depth}`"
      >
        <a 
          :href="`#${link.id}`" 
          class="text-light-text dark:text-dark-text hover:text-light-accent dark:hover:text-dark-accent hover:underline transition-colors block py-1"
        >
          {{ link.text }}
        </a>
      </li>
    </ul>
  </nav>
</template>

<script setup>
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

import {ref} from 'vue';
const isVisible = ref(true);
const toggleToc = () => {
    isVisible.value = !isVisible.value;
}
</script>

<style scoped>
.toc-link_3 {
    @apply pl-4;
}
.toc-link_3::before {
    @apply pr-2;
    content: "-"
}
</style>