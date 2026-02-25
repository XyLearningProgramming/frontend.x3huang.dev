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

const isQueued = computed(() => {
  return props.message.isStreaming
    && !props.message.content
    && props.message.thinking.length === 0
    && props.message.statusText?.includes('Queued')
})

const isConnecting = computed(() => {
  return props.message.isStreaming
    && !props.message.content
    && props.message.thinking.length === 0
    && (props.message.statusText?.includes('Connecting') || props.message.statusText?.includes('Connected'))
})

const errorLabel = computed(() => {
  const code = props.message.error?.code
  switch (code) {
    case 'RATE_LIMIT': return 'Rate limited'
    case 'RATE_LIMITED': return 'Rate limited'
    case 'INBOX_FULL': return 'Service busy'
    case 'TIMEOUT': return 'Timed out'
    case 'REQUEST_TIMEOUT': return 'Request timed out'
    case 'CONNECTION_ERROR': return 'Connection failed'
    case 'MODEL_UNAVAILABLE': return 'Model unavailable'
    case 'MODEL_BUSY': return 'Model busy'
    case 'MODEL_UNREACHABLE': return 'Model unreachable'
    case 'SERVICE_UNAVAILABLE': return 'Service unavailable'
    case 'PROCESSING_ERROR': return 'Processing error'
    default: return 'Error'
  }
})

const errorIcon = computed(() => {
  const code = props.message.error?.code
  switch (code) {
    case 'RATE_LIMIT':
    case 'RATE_LIMITED':
    case 'INBOX_FULL':
      return '⏳'
    case 'TIMEOUT':
    case 'REQUEST_TIMEOUT':
      return '⏱️'
    case 'CONNECTION_ERROR':
    case 'MODEL_UNREACHABLE':
    case 'SERVICE_UNAVAILABLE':
      return '🔌'
    case 'MODEL_BUSY':
    case 'MODEL_UNAVAILABLE':
      return '🤖'
    default:
      return '⚠️'
  }
})
</script>

<template>
  <div
    class="flex w-full mb-4 chat-message-enter"
    :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
  >
    <div
      class="max-w-[85%] md:max-w-[70%] px-4 py-3 rounded-2xl transition-all duration-300"
      :class="[
        message.role === 'user'
          ? 'chat-bubble-user'
          : hasError
            ? 'chat-bubble-error'
            : 'chat-bubble-ai',
      ]"
    >
      <!-- User message -->
      <p v-if="message.role === 'user'" class="text-sm whitespace-pre-wrap break-words font-medium">
        {{ message.content }}
      </p>

      <!-- AI message -->
      <template v-else>
        <!-- Queued state — animated position indicator -->
        <div v-if="isQueued" class="flex items-center gap-3 py-1">
          <div class="queued-indicator">
            <div class="queued-ring" />
            <span class="queued-number">{{ message.statusText?.match(/\d+/)?.[0] || '?' }}</span>
          </div>
          <div>
            <p class="text-xs font-medium" style="color: var(--chat-text, inherit);">In queue</p>
            <p class="text-[10px] animate-pulse" style="color: var(--chat-muted, #6B6B7B);">
              {{ message.statusText }}
            </p>
          </div>
        </div>

        <!-- Connecting state — wave animation -->
        <div v-else-if="isConnecting" class="flex items-center gap-2 py-1">
          <div class="connecting-waves">
            <span class="wave" style="animation-delay: 0ms" />
            <span class="wave" style="animation-delay: 100ms" />
            <span class="wave" style="animation-delay: 200ms" />
            <span class="wave" style="animation-delay: 300ms" />
          </div>
          <span class="text-xs animate-pulse" style="color: var(--chat-muted, #6B6B7B);">
            {{ message.statusText }}
          </span>
        </div>

        <template v-else>
          <!-- Thinking block -->
          <ThinkingBlock
            v-if="message.thinking.length > 0"
            :chunks="message.thinking"
            :is-active="message.isStreaming && !message.content"
          />

          <!-- Tool calls — animated cards -->
          <div v-if="message.toolCalls.length > 0" class="mb-3 space-y-1.5">
            <div
              v-for="(tool, i) in message.toolCalls"
              :key="i"
              class="tool-call-card flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs"
              :class="{
                'tool-started': tool.status === 'started',
                'tool-completed': tool.status === 'completed',
                'tool-error': tool.status === 'error',
              }"
            >
              <span v-if="tool.status === 'started'" class="tool-icon tool-icon--spin">⚙️</span>
              <span v-else-if="tool.status === 'completed'" class="tool-icon tool-icon--pop">✅</span>
              <span v-else class="tool-icon">❌</span>
              <span class="font-medium" style="color: var(--chat-text, inherit);">{{ tool.name }}</span>
              <span v-if="tool.status === 'started'" class="tool-progress" />
            </div>
          </div>

          <!-- Content with streaming cursor -->
          <div
            v-if="message.content"
            class="chat-markdown text-sm break-words leading-relaxed"
            :class="{ 'streaming-active': message.isStreaming }"
            v-html="renderedContent"
          />

          <!-- Streaming cursor -->
          <span v-if="message.isStreaming && message.content" class="streaming-cursor" />

          <!-- Status indicator (generic) -->
          <div
            v-if="message.statusText && !isQueued && !isConnecting"
            class="flex items-center gap-2 text-xs mt-1"
            style="color: var(--chat-muted, #6B6B7B);"
          >
            <span class="inline-block w-3 h-3 border-2 rounded-full animate-spin" style="border-color: rgba(0,0,0,0.15); border-top-color: var(--color-dali-red);" />
            <span class="animate-pulse">{{ message.statusText }}</span>
          </div>

          <!-- Fallback streaming indicator -->
          <div
            v-else-if="message.isStreaming && !message.content && message.thinking.length === 0 && !isQueued && !isConnecting"
            class="flex items-center gap-1.5 py-1"
          >
            <span class="stream-dot" style="animation-delay: 0ms" />
            <span class="stream-dot" style="animation-delay: 200ms" />
            <span class="stream-dot" style="animation-delay: 400ms" />
          </div>
        </template>

        <!-- Error — rich error card -->
        <div v-if="message.error" class="mt-3 error-card rounded-xl px-4 py-3">
          <div class="flex items-start gap-3">
            <span class="text-xl">{{ errorIcon }}</span>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold mb-0.5" style="color: var(--color-dali-red);">
                {{ errorLabel }}
              </p>
              <p class="text-xs" style="color: var(--chat-muted, #6B6B7B);">
                {{ message.error.message }}
              </p>
            </div>
          </div>
        </div>

        <!-- Retry button -->
        <button
          v-if="message.error && !message.isStreaming"
          class="mt-2 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-200 retry-btn"
          @click="emit('retry')"
        >
          <svg class="w-3 h-3 retry-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0115.36-6.36M20 15a9 9 0 01-15.36 6.36" />
          </svg>
          Try again
        </button>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* ============= Message entry animation ============= */
.chat-message-enter {
  animation: messageSlideIn 0.35s ease-out;
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ============= Bubbles ============= */
.chat-bubble-user {
  background: var(--chat-bubble-user, #FFF8E7);
  border: 1px solid rgba(212, 168, 67, 0.3);
  color: var(--chat-text, #1A1A1A);
  border-radius: 20px 20px 4px 20px;
}

.chat-bubble-ai {
  background: var(--chat-bubble-ai, #FFFFFF);
  border: 1px solid var(--chat-border, rgba(0,0,0,0.06));
  color: var(--chat-text, #1A1A1A);
  border-radius: 20px 20px 20px 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.chat-bubble-error {
  background: rgba(237, 28, 36, 0.04);
  border: 1px solid rgba(237, 28, 36, 0.2);
  color: var(--chat-text, #1A1A1A);
  border-radius: 20px 20px 20px 4px;
}

/* ============= Queued indicator ============= */
.queued-indicator {
  position: relative;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.queued-ring {
  position: absolute;
  inset: 0;
  border: 2px solid rgba(212, 168, 67, 0.2);
  border-top-color: var(--color-dali-gold);
  border-radius: 50%;
  animation: spin 1.5s linear infinite;
}

.queued-number {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-dali-gold);
}

/* ============= Connecting waves ============= */
.connecting-waves {
  display: flex;
  align-items: end;
  gap: 2px;
  height: 16px;
}

.wave {
  width: 3px;
  border-radius: 1.5px;
  background: var(--color-dali-teal);
  animation: waveAnim 1s ease-in-out infinite;
}

@keyframes waveAnim {
  0%, 100% { height: 4px; opacity: 0.3; }
  50% { height: 14px; opacity: 1; }
}

/* ============= Tool call cards ============= */
.tool-call-card {
  background: rgba(0,0,0,0.03);
  border: 1px solid rgba(0,0,0,0.06);
  transition: all 0.3s ease;
}

.tool-started {
  border-color: rgba(212, 168, 67, 0.3);
  background: rgba(212, 168, 67, 0.05);
}

.tool-completed {
  border-color: rgba(46, 196, 182, 0.3);
  background: rgba(46, 196, 182, 0.05);
}

.tool-error {
  border-color: rgba(237, 28, 36, 0.3);
  background: rgba(237, 28, 36, 0.05);
}

.tool-icon--spin {
  animation: spin 2s linear infinite;
}

.tool-icon--pop {
  animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes popIn {
  from { transform: scale(0); }
  to { transform: scale(1); }
}

.tool-progress {
  flex: 1;
  height: 2px;
  background: rgba(212, 168, 67, 0.2);
  border-radius: 1px;
  position: relative;
  overflow: hidden;
}

.tool-progress::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--color-dali-gold);
  border-radius: 1px;
  animation: progressSlide 2s ease-in-out infinite;
}

@keyframes progressSlide {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* ============= Streaming cursor ============= */
.streaming-cursor::after {
  content: '▍';
  display: inline;
  color: var(--color-dali-red);
  animation: cursorBlink 0.8s ease-in-out infinite;
  font-weight: 300;
}

@keyframes cursorBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* ============= Streaming content shimmer ============= */
.streaming-active :deep(*:last-child) {
  position: relative;
}

/* ============= Stream dots ============= */
.stream-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-dali-red);
  animation: streamPulse 1.4s ease-in-out infinite;
}

@keyframes streamPulse {
  0%, 100% { opacity: 0.2; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

/* ============= Error card ============= */
.error-card {
  background: rgba(237, 28, 36, 0.04);
  border: 1px solid rgba(237, 28, 36, 0.15);
}

/* ============= Retry button ============= */
.retry-btn {
  background: rgba(237, 28, 36, 0.08);
  color: var(--color-dali-red);
  border: 1px solid rgba(237, 28, 36, 0.2);
}

.retry-btn:hover {
  background: rgba(237, 28, 36, 0.15);
  transform: translateY(-1px);
}

.retry-btn:hover .retry-icon {
  animation: retryRotate 0.5s ease;
}

@keyframes retryRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(-360deg); }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ============= Markdown ============= */
.chat-markdown :deep(p) { margin-bottom: 0.5em; }
.chat-markdown :deep(p:last-child) { margin-bottom: 0; }
.chat-markdown :deep(strong) { font-weight: 700; }
.chat-markdown :deep(em) { font-style: italic; }
.chat-markdown :deep(code) {
  background: rgba(0,0,0,0.05);
  border: 1px solid rgba(0,0,0,0.1);
  padding: 0.1em 0.4em;
  font-size: 0.85em;
  border-radius: 4px;
  color: var(--color-dali-red);
}
.chat-markdown :deep(pre) {
  background: #1A1A2E;
  color: #F0EDE5;
  border: 1px solid rgba(0,0,0,0.1);
  padding: 0.75em;
  overflow-x: auto;
  margin-bottom: 0.5em;
  border-radius: 8px;
}
.chat-markdown :deep(pre code) {
  background: none;
  border: none;
  padding: 0;
  color: inherit;
}
.chat-markdown :deep(a) {
  color: var(--color-dali-teal);
  text-decoration: underline;
  font-weight: 600;
}
.chat-markdown :deep(ul),
.chat-markdown :deep(ol) {
  padding-left: 1.25em;
  margin-bottom: 0.5em;
}
.chat-markdown :deep(li) { margin-bottom: 0.2em; }
.chat-markdown :deep(blockquote) {
  border-left: 3px solid var(--color-dali-gold);
  padding-left: 0.75em;
  margin: 0.5em 0;
  font-style: italic;
  color: var(--chat-muted, #6B6B7B);
}
</style>
