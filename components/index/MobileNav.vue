<template>
  <!-- Mobile nav FAB — uses explicit bg/color instead of dali-btn
       so the button is always visible regardless of scroll-driven color flow -->
  <button
    class="mobile-nav-fab lg:hidden fixed bottom-6 right-6 z-50 p-3 rounded-full"
    aria-label="Open navigation"
    @click="open = true"
  >
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  </button>

  <!-- Mobile nav overlay -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="open"
        class="lg:hidden fixed inset-0 z-50 bg-black/70"
        @click.self="open = false"
      >
        <div class="absolute bottom-0 left-0 right-0 bg-dali-smoke border-t-2 border-dali-red p-6">
          <div class="flex justify-between items-center mb-4">
            <p class="text-xs font-bold uppercase tracking-widest text-dali-muted font-mono">Navigate</p>
            <button class="dali-btn px-2 py-1 text-xs" @click="open = false">
              Close
            </button>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <button
              v-for="section in visibleSections"
              :key="section.id"
              class="dali-btn px-4 py-3 text-sm text-left"
              @click="scrollTo(section.id)"
            >
              {{ section.label }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  scrollTo: [sectionId: string]
}>()

const open = ref(false)

const baseSections = [
  { id: 'main', label: 'Home' },
  { id: 'posts', label: 'Posts' },
  { id: 'space', label: 'Space' },
  { id: 'tools', label: 'Tools' },
]

// Injected from index.vue — reactively tracks whether chat messages exist.
// Falls back to false when rendered outside the index page (shouldn't happen,
// but keeps the component resilient).
const chatHasMessages = inject<Ref<boolean>>('chatHasMessages', ref(false))

// Dynamically add chat to the front when there's chat history
const visibleSections = computed(() => {
  if (chatHasMessages.value) {
    return [{ id: 'chat', label: 'Chat' }, ...baseSections]
  }
  return baseSections
})

function scrollTo(id: string) {
  open.value = false
  emit('scrollTo', id)
}
</script>

<style scoped>
/* Mobile FAB — solid red bg (the brand identifier), void shadow for depth,
   gold shadow on hover for a warm surrealist glow. */
.mobile-nav-fab {
  background-color: var(--color-dali-red);
  color: var(--color-dali-white);
  border: none;
  box-shadow: var(--shadow-dali-void-sm);
  cursor: pointer;
  transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 0.15s ease;
}
.mobile-nav-fab:hover {
  transform: translate(-2px, -2px) scale(1.05);
  box-shadow: var(--shadow-dali-void);
}
.mobile-nav-fab:active {
  transform: translate(1px, 1px) scale(0.97);
  box-shadow: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
