<template>
  <div class="mb-2">
    <button
      @click="expanded = !expanded"
      class="flex items-center gap-1.5 text-xs transition-colors py-1 cursor-pointer group"
      style="color: var(--chat-muted, rgba(0,0,0,0.4));"
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
      <span v-if="isActive" class="flex items-center gap-1.5">
        <span class="thinking-brain">🧠</span>
        <span class="animate-pulse">Thinking... {{ elapsedLabel }}</span>
      </span>
      <span v-else class="group-hover:text-dali-teal transition-colors">Thought process</span>
    </button>
    <Transition name="expand">
      <div
        v-show="expanded"
        class="pl-4 mt-1 text-sm italic whitespace-pre-wrap leading-relaxed thinking-content"
      >
        <p v-for="(chunk, i) in chunks" :key="i">{{ chunk }}<span v-if="isActive && i === chunks.length - 1" class="thinking-dots" /></p>
      </div>
    </Transition>
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
.thinking-content {
  border-left: 2px solid var(--chat-border, rgba(0,0,0,0.1));
  color: var(--chat-muted, rgba(0,0,0,0.4));
}

.thinking-brain {
  display: inline-block;
  animation: brainPulse 1.5s ease-in-out infinite;
}

@keyframes brainPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

.thinking-dots::after {
  content: ' ...';
  animation: dotPulse 1.4s ease-in-out infinite;
}

@keyframes dotPulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

/* Expand transition */
.expand-enter-active {
  transition: all 0.3s ease;
  overflow: hidden;
}
.expand-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-4px);
}
.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 500px;
}
</style>
