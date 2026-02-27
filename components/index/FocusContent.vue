<template>
  <div class="min-h-screen dali-focus-surface">
    <!-- Back button bar -->
    <div class="sticky top-0 z-20 flex items-center justify-between px-6 py-4 backdrop-blur-sm" style="background: rgba(0,0,0,0.15);">
      <button
        class="dali-btn bg-transparent text-dali-white border-dali-white/40 px-3 py-1.5 text-sm font-bold flex items-center gap-2"
        @click="emit('back')"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>
      <span class="text-sm font-bold text-dali-white/60 truncate max-w-[60%]">
        {{ focusPanelTitle }}
      </span>
    </div>

    <!-- Focus content -->
    <div class="px-6 md:px-12 py-8 max-w-4xl mx-auto">
      <!-- Gallery is now handled by the lightbox overlay in SpaceSection -->
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PanelType } from '~/composables/useFocusPanel'

defineProps<{
  activePanel: PanelType | null
  panelPayload: any
  focusPanelTitle: string
}>()

const emit = defineEmits<{
  back: []
}>()
</script>
