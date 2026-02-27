<script setup lang="ts">
import { marked, Renderer } from 'marked'
import type { ChatMessage } from '~/composables/useChatty'
import ThinkingBlock from './ThinkingBlock.vue'

interface Props {
  message: ChatMessage
}

const props = defineProps<Props>()

const emit = defineEmits<{
  retry: []
}>()

const router = useRouter()

// ── Internal link detection (domain-agnostic, SSR-safe) ──
const siteOrigin = useRequestURL().origin

function toInternalPath(href: string): string | null {
  // Relative paths starting with / are always internal
  if (href.startsWith('/')) return href
  // Absolute URLs — check if same origin
  try {
    const url = new URL(href)
    if (url.origin === siteOrigin) return url.pathname
  } catch { /* not a valid absolute URL */ }
  return null
}

function isPostPath(path: string): boolean {
  return path.startsWith('/posts/')
}

// ── Custom marked renderer ──
const chatRenderer = new Renderer()
chatRenderer.link = ({ href, text }: { href: string; text: string }) => {
  const internalPath = toInternalPath(href)
  if (internalPath && isPostPath(internalPath)) {
    // Post link — tagged for card upgrade in postProcessPostCards
    return `<a href="${internalPath}" data-chat-post-link title="${text}">${text}</a>`
  }
  if (internalPath) {
    // Other internal link — SPA navigation, no card
    return `<a href="${internalPath}" data-chat-internal-link>${text}</a>`
  }
  // External links: open in new tab
  return `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`
}

// ── Post-process: upgrade post-link anchors in <p> to card HTML ──
function postProcessPostCards(html: string): string {
  // Pattern: <p> containing a data-chat-post-link anchor, optionally followed by ": description"
  return html.replace(
    /<p>(<a href="(\/posts\/[^"]+)" data-chat-post-link title="([^"]*)">([^<]*)<\/a>)(?:\s*[:：]\s*([^<]*))?<\/p>/g,
    (_match, _fullLink, href, _title, linkText, description) => {
      const descHtml = description
        ? `<span class="chat-post-card__desc">${description.trim()}</span>`
        : ''
      return `<a href="${href}" class="chat-post-card" data-chat-post-link>`
        + `<span class="chat-post-card__body">`
        + `<span class="chat-post-card__title">${linkText}</span>`
        + descHtml
        + `</span>`
        + `<span class="chat-post-card__arrow">&rarr;</span>`
        + `</a>`
    },
  )
}

const renderedContent = computed(() => {
  if (!props.message.content) return ''
  const raw = marked.parse(props.message.content, { breaks: true, renderer: chatRenderer }) as string
  return postProcessPostCards(raw)
})

// ── Click interceptor for internal post cards (SPA navigation) ──
const markdownRef = ref<HTMLElement | null>(null)

function handleMarkdownClick(e: MouseEvent) {
  const target = (e.target as HTMLElement).closest(
    'a[data-chat-post-link], a[data-chat-internal-link]',
  ) as HTMLAnchorElement | null
  if (!target) return
  e.preventDefault()
  const href = target.getAttribute('href')
  if (href) router.push(href)
}

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
            ref="markdownRef"
            class="chat-markdown text-sm break-words leading-relaxed"
            :class="{ 'streaming-active': message.isStreaming }"
            v-html="renderedContent"
            @click="handleMarkdownClick"
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
  background: rgba(0,0,0,0.02);
  border: 1px solid rgba(0,0,0,0.06);
  transition: all 0.3s ease;
}

.tool-started {
  border-color: rgba(212, 168, 67, 0.3);
  background: rgba(212, 168, 67, 0.06);
}

.tool-completed {
  border-color: rgba(46, 196, 182, 0.3);
  background: rgba(46, 196, 182, 0.06);
}

.tool-error {
  border-color: rgba(237, 28, 36, 0.3);
  background: rgba(237, 28, 36, 0.06);
}

.tool-icon {
  font-size: 12px;
  line-height: 1;
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
  background: rgba(212, 168, 67, 0.15);
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
.chat-markdown { color: var(--chat-text, #1A1A1A); }
.chat-markdown :deep(*) { color: inherit; }
.chat-markdown :deep(p) { margin-bottom: 0.5em; }
.chat-markdown :deep(p:last-child) { margin-bottom: 0; }
.chat-markdown :deep(h1),
.chat-markdown :deep(h2),
.chat-markdown :deep(h3),
.chat-markdown :deep(h4) {
  font-weight: 700;
  margin-top: 0.75em;
  margin-bottom: 0.4em;
  color: var(--chat-text, #1A1A1A);
}
.chat-markdown :deep(h2) { font-size: 1.15em; }
.chat-markdown :deep(h3) { font-size: 1.05em; }
.chat-markdown :deep(strong) { font-weight: 700; color: var(--chat-text, #1A1A1A); }
.chat-markdown :deep(em) { font-style: italic; }
.chat-markdown :deep(code) {
  background: rgba(0,0,0,0.06);
  border: 1px solid rgba(0,0,0,0.1);
  padding: 0.1em 0.4em;
  font-size: 0.85em;
  border-radius: 4px;
  color: var(--color-dali-red);
}
.chat-markdown :deep(pre) {
  background: rgba(0,0,0,0.05);
  color: var(--chat-text, #1A1A1A);
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

/* ============= Internal Post Link Card ============= */
.chat-markdown :deep(.chat-post-card) {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  margin: 0.5em 0;
  background: #FFF8E7;
  border: 2px solid var(--color-dali-red, #ED1C24);
  box-shadow: 2px 2px 0 0 rgba(0,0,0,0.08);
  border-radius: 12px;
  text-decoration: none !important;
  color: var(--chat-text, #1A1A1A) !important;
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 0.2s ease;
}

.chat-markdown :deep(.chat-post-card:hover) {
  transform: translate(-2px, -2px);
  box-shadow: 4px 4px 0 0 rgba(0,0,0,0.1);
}

.chat-markdown :deep(.chat-post-card:active) {
  transform: translate(0, 0);
  box-shadow: 1px 1px 0 0 rgba(0,0,0,0.06);
}

.chat-markdown :deep(.chat-post-card__body) {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
  flex: 1;
}

.chat-markdown :deep(.chat-post-card__title) {
  font-family: var(--font-dali-heading, 'Space Grotesk', sans-serif);
  font-weight: 700;
  font-size: 0.8rem;
  line-height: 1.3;
  color: var(--chat-text, #1A1A1A) !important;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.chat-markdown :deep(.chat-post-card__desc) {
  font-size: 0.7rem;
  line-height: 1.4;
  color: var(--chat-muted, #6B6B7B) !important;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.chat-markdown :deep(.chat-post-card__arrow) {
  flex-shrink: 0;
  font-family: var(--font-dali-mono, monospace);
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-dali-red, #ED1C24) !important;
  transition: transform 0.2s ease;
}

.chat-markdown :deep(.chat-post-card:hover .chat-post-card__arrow) {
  transform: translateX(3px);
}
</style>
