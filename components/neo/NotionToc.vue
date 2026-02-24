<script setup lang="ts">
import type { ScrollSpySection } from '~/composables/useScrollSpy'

interface Props {
  sections: ScrollSpySection[]
}

const props = defineProps<Props>()

const sectionIds = computed(() => props.sections.map((s) => s.id))
const { activeId } = useScrollSpy(sectionIds)

function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<template>
  <nav
    class="hidden lg:block fixed right-8 top-1/2 -translate-y-1/2 z-40"
    aria-label="Page navigation"
  >
    <div class="neo-card bg-neo-white p-3 w-44">
      <p class="text-[10px] font-bold uppercase tracking-widest text-neo-text-muted mb-2">
        On this page
      </p>
      <ul class="space-y-1">
        <li
          v-for="section in props.sections"
          :key="section.id"
        >
          <button
            class="w-full text-left text-xs px-2 py-1 transition-all duration-150 font-medium border-l-2"
            :class="activeId === section.id
              ? 'border-neo-black text-neo-black bg-neo-yellow/30 font-bold'
              : 'border-transparent text-neo-text-muted hover:text-neo-black hover:border-neo-black/30'"
            @click="scrollTo(section.id)"
          >
            {{ section.label }}
          </button>
        </li>
      </ul>
    </div>
  </nav>
</template>
