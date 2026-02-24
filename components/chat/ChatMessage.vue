<script setup lang="ts">
import { marked } from 'marked'
import type { ChatMessage } from '~/composables/useChatty'
import ThinkingBlock from './ThinkingBlock.vue'

interface Props {
  message: ChatMessage
}

const props = defineProps<Props>()

const emit = defineEmits<{
  retry: []
}>()

const renderedContent = computed(() => {
  if (!props.message.content) return ''
  return marked.parse(props.message.content, { breaks: true }) as string
})

const hasError = computed(() => !!props.message.error && !props.message.isStreaming)

const bubbleClass = computed(() => {
  if (props.message.role === 'user') {
    return 'bg-neo-yellow border-2 border-neo-black shadow-neo-sm text-neo-black'
  }
  if (hasError.value) {
    return 'bg-neo-red/10 border-2 border-neo-red text-neo-black'
  }
  return 'bg-neo-white border-2 border-neo-black shadow-neo-sm text-neo-black'
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

<template>
  <div
    class="flex w-full mb-4"
    :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
  >
    <div
      class="max-w-[80%] md:max-w-[70%] px-4 py-3"
      :class="bubbleClass"
    >
      <!-- User message -->
      <p v-if="message.role === 'user'" class="text-sm whitespace-pre-wrap break-words font-medium">
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
            class="text-xs text-neo-text-muted flex items-center gap-1.5 py-0.5"
          >
            <span v-if="tool.status === 'started'" class="text-neo-orange">&#9881;</span>
            <span v-else-if="tool.status === 'completed'" class="text-neo-green">&#10003;</span>
            <span v-else class="text-neo-red">&#10007;</span>
            <span>{{ tool.name }}</span>
          </div>
        </div>

        <!-- Content -->
        <div
          v-if="message.content"
          class="chat-markdown text-sm break-words leading-relaxed"
          v-html="renderedContent"
        />
        <span v-if="message.isStreaming && message.content" class="streaming-dots" />

        <!-- Status indicator -->
        <div
          v-if="message.statusText"
          class="flex items-center gap-2 text-xs text-neo-text-muted"
        >
          <span class="inline-block w-3 h-3 border-2 border-neo-black/30 border-t-neo-black rounded-full animate-spin" />
          <span class="animate-pulse">{{ message.statusText }}</span>
        </div>

        <!-- Fallback streaming indicator -->
        <div
          v-else-if="message.isStreaming && !message.content && message.thinking.length === 0"
          class="flex items-center gap-1"
        >
          <span class="w-2 h-2 bg-neo-black rounded-full animate-bounce" style="animation-delay: 0ms" />
          <span class="w-2 h-2 bg-neo-black rounded-full animate-bounce" style="animation-delay: 150ms" />
          <span class="w-2 h-2 bg-neo-black rounded-full animate-bounce" style="animation-delay: 300ms" />
        </div>

        <!-- Error -->
        <div v-if="message.error" class="mt-2 text-xs text-neo-red bg-neo-red/10 border border-neo-red px-3 py-2">
          <span class="font-bold">{{ errorLabel }}</span>: {{ message.error.message }}
        </div>

        <!-- Retry button -->
        <button
          v-if="message.error && !message.isStreaming"
          class="neo-btn mt-2 flex items-center gap-1 text-xs px-2 py-1 bg-neo-white"
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

<style scoped>
.streaming-dots::after {
  content: ' ...';
  animation: dotPulse 1.4s ease-in-out infinite;
}

@keyframes dotPulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

.chat-markdown :deep(p) { margin-bottom: 0.5em; }
.chat-markdown :deep(p:last-child) { margin-bottom: 0; }
.chat-markdown :deep(strong) { font-weight: 700; }
.chat-markdown :deep(em) { font-style: italic; }
.chat-markdown :deep(code) {
  background: var(--color-neo-bg);
  border: 1px solid var(--color-neo-black);
  padding: 0.1em 0.4em;
  font-size: 0.85em;
  font-family: var(--font-neo-mono);
}
.chat-markdown :deep(pre) {
  background: var(--color-neo-bg);
  border: 2px solid var(--color-neo-black);
  padding: 0.75em;
  overflow-x: auto;
  margin-bottom: 0.5em;
}
.chat-markdown :deep(pre code) {
  background: none;
  border: none;
  padding: 0;
}
.chat-markdown :deep(a) {
  color: var(--color-light-accent);
  text-decoration: underline;
  font-weight: 600;
}
.chat-markdown :deep(ul),
.chat-markdown :deep(ol) {
  padding-left: 1.25em;
  margin-bottom: 0.5em;
}
.chat-markdown :deep(li) { margin-bottom: 0.2em; }
</style>
