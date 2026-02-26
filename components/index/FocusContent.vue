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
      <button
        class="text-xs font-bold text-dali-white/60 hover:text-dali-white px-2 py-1"
        @click="emit('close')"
      >
        ESC
      </button>
    </div>

    <!-- Focus content -->
    <div class="px-6 md:px-12 py-8 max-w-4xl mx-auto">
      <!-- ===== About ===== -->
      <template v-if="activePanel === 'about'">
        <div v-if="aboutContent" class="blog-content">
          <ContentRenderer :value="aboutContent" />
        </div>
        <div v-else class="flex items-center justify-center py-12">
          <div class="w-8 h-8 border-4 border-dali-red border-t-dali-gold rounded-full animate-spin" />
        </div>
      </template>

      <!-- ===== Contact ===== -->
      <template v-else-if="activePanel === 'contact'">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <a :href="`mailto:${siteConfig.social.email}`" class="block p-5 border-2 border-dali-white/20 bg-dali-white/5 text-center hover:border-dali-red transition-colors">
            <div class="text-4xl mb-3">📧</div>
            <h3 class="text-lg font-bold mb-1 text-dali-white">Email</h3>
            <p class="text-sm text-dali-white/60">{{ siteConfig.social.email }}</p>
          </a>
          <a :href="siteConfig.social.github" target="_blank" rel="noopener noreferrer" class="block p-5 border-2 border-dali-white/20 bg-dali-white/5 text-center hover:border-dali-red transition-colors">
            <div class="text-4xl mb-3">💻</div>
            <h3 class="text-lg font-bold mb-1 text-dali-white">GitHub</h3>
            <p class="text-sm text-dali-white/60">{{ siteConfig.social.github?.split('/').pop() }}</p>
          </a>
          <a :href="siteConfig.social.linkedin" target="_blank" rel="noopener noreferrer" class="block p-5 border-2 border-dali-white/20 bg-dali-white/5 text-center hover:border-dali-red transition-colors">
            <div class="text-4xl mb-3">💼</div>
            <h3 class="text-lg font-bold mb-1 text-dali-white">LinkedIn</h3>
            <p class="text-sm text-dali-white/60">{{ siteConfig.social.linkedin?.split('/').slice(-2).join('/') }}</p>
          </a>
          <a href="/resume/20260111.pdf" target="_blank" rel="noopener noreferrer" class="block p-5 border-2 border-dali-white/20 bg-dali-white/5 text-center hover:border-dali-red transition-colors">
            <div class="text-4xl mb-3">📄</div>
            <h3 class="text-lg font-bold mb-1 text-dali-white">Resume</h3>
            <p class="text-sm text-dali-white/60">Download CV</p>
          </a>
        </div>
      </template>

      <!-- ===== Gallery ===== -->
      <template v-else-if="activePanel === 'gallery' && selectedGalleryImage">
        <div class="flex flex-col items-center">
          <div class="overflow-hidden mb-4 max-w-3xl w-full border-2 border-dali-white/20">
            <NuxtImg
              :src="selectedGalleryImage.url"
              :alt="selectedGalleryImage.alt || selectedGalleryImage.title || 'Photo'"
              class="w-full object-contain max-h-[70vh]"
            />
          </div>
          <div v-if="selectedGalleryImage.title || selectedGalleryImage.note" class="text-center max-w-xl">
            <p v-if="selectedGalleryImage.title" class="font-bold text-lg mb-1 text-dali-white">{{ selectedGalleryImage.title }}</p>
            <p v-if="selectedGalleryImage.note" class="text-sm text-dali-white/60 italic">{{ selectedGalleryImage.note }}</p>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { siteConfig } from '~/site.config'
import type { GalleryImage } from '~/composables/useBackgroundGallery'
import type { PanelType } from '~/composables/useFocusPanel'

defineProps<{
  activePanel: PanelType | null
  panelPayload: any
  aboutContent: any
  selectedGalleryImage: GalleryImage | null
  focusPanelTitle: string
}>()

const emit = defineEmits<{
  back: []
  close: []
}>()
</script>
