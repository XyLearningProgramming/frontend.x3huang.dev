<template>
  <div class="mb-2">
    <button
      @click="expanded = !expanded"
      class="flex items-center gap-1.5 text-xs text-white/50 hover:text-white/70 transition-colors py-1"
    >
      <svg
        class="w-3 h-3 transition-transform duration-200"
        :class="{ 'rotate-90': expanded }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
      <span v-if="isActive" class="flex items-center gap-1 animate-pulse">
        Thinking... {{ elapsedLabel }}
      </span>
      <span v-else>Thought process</span>
    </button>
    <div
      v-show="expanded"
      class="pl-4 border-l border-white/10 mt-1 text-sm text-white/40 italic whitespace-pre-wrap leading-relaxed"
    >
      <p v-for="(chunk, i) in chunks" :key="i">{{ chunk }}<span v-if="isActive && i === chunks.length - 1" class="thinking-dots" /></p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  chunks: string[]
  isActive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isActive: false,
})

const expanded = ref(false)
const elapsed = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

function startTimer() {
  elapsed.value = 0
  timer = setInterval(() => { elapsed.value++ }, 1000)
}

function stopTimer() {
  if (timer) { clearInterval(timer); timer = null }
}

const elapsedLabel = computed(() => {
  if (elapsed.value < 1) return ''
  return `${elapsed.value}s`
})

watch(() => props.isActive, (active) => {
  if (active) startTimer()
  else stopTimer()
}, { immediate: true })

onUnmounted(() => stopTimer())
</script>

<style scoped>
.thinking-dots::after {
  content: ' ...';
  animation: dotPulse 1.4s ease-in-out infinite;
}

@keyframes dotPulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}
</style>
