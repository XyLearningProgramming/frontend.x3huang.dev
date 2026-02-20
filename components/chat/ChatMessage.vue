<template>
  <div
    class="flex w-full mb-4"
    :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
  >
    <div
      class="max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3"
      :class="bubbleClass"
    >
      <!-- User message -->
      <p v-if="message.role === 'user'" class="text-sm text-white whitespace-pre-wrap break-words">
        {{ message.content }}
      </p>

      <!-- AI message -->
      <template v-else>
        <!-- Thinking block -->
        <ThinkingBlock
          v-if="message.thinking.length > 0"
          :chunks="message.thinking"
          :is-active="message.isStreaming && !message.content"
        />

        <!-- Tool calls -->
        <div v-if="message.toolCalls.length > 0" class="mb-2 space-y-1">
          <div
            v-for="(tool, i) in message.toolCalls"
            :key="i"
            class="text-xs text-white/50 flex items-center gap-1.5 py-0.5"
          >
            <span v-if="tool.status === 'started'" class="text-yellow-400/70">&#9881;</span>
            <span v-else-if="tool.status === 'completed'" class="text-green-400/70">&#10003;</span>
            <span v-else class="text-red-400/70">&#10007;</span>
            <span>{{ tool.name }}</span>
          </div>
        </div>

        <!-- Content -->
        <p
          v-if="message.content"
          class="text-sm text-white/90 whitespace-pre-wrap break-words leading-relaxed"
        >{{ message.content }}<span v-if="message.isStreaming" class="streaming-dots" /></p>

        <!-- Status indicator (queued, connecting, waiting) -->
        <div
          v-if="message.statusText"
          class="flex items-center gap-2 text-xs text-white/50"
        >
          <span class="inline-block w-3 h-3 border-2 border-white/30 border-t-white/70 rounded-full animate-spin" />
          <span class="animate-pulse">{{ message.statusText }}</span>
        </div>

        <!-- Fallback streaming indicator (no status, no content, no thinking) -->
        <div
          v-else-if="message.isStreaming && !message.content && message.thinking.length === 0"
          class="flex items-center gap-1"
        >
          <span class="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style="animation-delay: 0ms" />
          <span class="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style="animation-delay: 150ms" />
          <span class="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style="animation-delay: 300ms" />
        </div>

        <!-- Error -->
        <div v-if="message.error" class="mt-2 text-xs text-red-300/90 bg-red-500/10 rounded-lg px-3 py-2">
          <span class="font-medium">{{ errorLabel }}</span>: {{ message.error.message }}
        </div>

        <!-- Retry button -->
        <button
          v-if="message.error && !message.isStreaming"
          class="mt-2 flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors"
          @click="emit('retry')"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0115.36-6.36M20 15a9 9 0 01-15.36 6.36" />
          </svg>
          Retry
        </button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChatMessage } from '~/composables/useChatty'
import ThinkingBlock from './ThinkingBlock.vue'

interface Props {
  message: ChatMessage
}

const props = defineProps<Props>()

const emit = defineEmits<{
  retry: []
}>()

const hasError = computed(() => !!props.message.error && !props.message.isStreaming)

const bubbleClass = computed(() => {
  if (props.message.role === 'user') {
    return 'bg-white/20 backdrop-blur-sm border border-white/10'
  }
  if (hasError.value) {
    return 'bg-red-500/5 backdrop-blur-sm border border-red-400/30'
  }
  return 'bg-white/10 backdrop-blur-sm border border-white/10'
})

const errorLabel = computed(() => {
  const code = props.message.error?.code
  switch (code) {
    case 'RATE_LIMIT': return 'Rate limited'
    case 'TIMEOUT': return 'Timed out'
    case 'CONNECTION_ERROR': return 'Connection failed'
    case 'MODEL_UNAVAILABLE': return 'Model unavailable'
    default: return 'Error'
  }
})
</script>

<style scoped>
.streaming-dots::after {
  content: ' ...';
  animation: dotPulse 1.4s ease-in-out infinite;
}

@keyframes dotPulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}
</style>
