<template>
  <div class="sub-page min-h-screen dali-focus-surface relative">
    <!-- Sticky top bar -->
    <div class="sticky top-0 z-30 sub-page-topbar">
      <div class="mx-auto flex items-center justify-between px-6 py-3" :class="maxWidthClass">
        <button
          class="dali-btn bg-transparent text-dali-white border-dali-white/40 px-3 py-1.5 text-sm font-bold flex items-center gap-2"
          @click="goBack"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          {{ backLabel }}
        </button>

        <span v-if="title" class="text-sm font-bold text-dali-white/60 truncate max-w-[50%]">
          {{ title }}
        </span>

        <div class="flex items-center gap-2">
          <slot name="topbar-right" />
        </div>
      </div>
    </div>

    <!-- Subtle top glow for depth -->
    <div class="sub-page-glow" />

    <!-- Page content -->
    <div class="px-6 md:px-12 py-8" :class="maxWidthClass + ' mx-auto'">
      <!-- Header slot -->
      <div v-if="$slots.header" class="mb-8">
        <slot name="header" />
      </div>

      <!-- Main content area (with optional sidebar) -->
      <div :class="hasSidebar ? 'sub-page-grid' : ''">
        <!-- Content column -->
        <div class="min-w-0">
          <slot />
        </div>

        <!-- Sidebar (TOC etc) — desktop only -->
        <aside v-if="$slots.sidebar" class="sub-page-sidebar hidden lg:block">
          <div class="sticky top-20">
            <slot name="sidebar" />
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePageTransition } from '~/composables/usePageTransition'

const { transitionTo } = usePageTransition()

interface Props {
  title?: string
  backTo?: string
  backLabel?: string
  maxWidth?: 'narrow' | 'default' | 'wide'
  hasSidebar?: boolean
  accentColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  backTo: '/',
  backLabel: 'Home',
  maxWidth: 'default',
  hasSidebar: false,
  accentColor: 'var(--color-dali-red)',
})

const maxWidthClass = computed(() => {
  switch (props.maxWidth) {
    case 'narrow': return 'max-w-3xl'
    case 'wide': return 'max-w-7xl'
    default: return 'max-w-5xl'
  }
})

// Override body background to dark while sub-page is mounted — prevents
// the light body (#F5E6B8) from flashing during page transitions.
useHead({
  bodyAttrs: {
    style: 'background-color: #161622',
  },
})

function goBack() {
  // Extract the section ID from backTo: '/#tools' → 'tools', '/#posts' → 'posts'
  const hashMatch = props.backTo.match(/#(\w+)/)
  const sectionId = hashMatch ? hashMatch[1] : 'hero'
  transitionTo(props.backTo, { sectionId, isBack: true })
}
</script>

<style scoped>
.sub-page-topbar {
  background: rgba(22, 22, 34, 0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(240, 237, 229, 0.06);
}

.sub-page-glow {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  max-width: 600px;
  height: 200px;
  background: radial-gradient(ellipse at center top, rgba(212, 168, 67, 0.06) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}

.sub-page-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 1024px) {
  .sub-page-grid {
    grid-template-columns: 1fr 220px;
    gap: 3rem;
  }
}

.sub-page-sidebar {
  font-size: 0.85rem;
}
</style>
