<template>
  <div v-if="isDev" class="chat-preview-page">
    <div class="chat-preview-header">
      <h1>Chat Message Rendering Preview</h1>
      <p>Dev-only page · background matches homepage chat surface</p>
    </div>
    <div class="chat-preview-messages">
      <ChatMessage
        v-for="msg in fixtures"
        :key="msg.id"
        :message="msg"
        @retry="() => {}"
      />
    </div>
  </div>
  <div v-else class="min-h-screen flex items-center justify-center">
    <p>Not available in production.</p>
  </div>
</template>

<script setup lang="ts">
import ChatMessage from '~/components/chat/ChatMessage.vue'
import type { ChatMessage as ChatMessageType } from '~/composables/useChatty'

const isDev = import.meta.dev

const fixtures: ChatMessageType[] = [
  // ── Basic user message ──
  {
    id: '1',
    role: 'user',
    content: 'Tell me about your blog posts on self-hosting',
    thinking: [],
    toolCalls: [],
    error: null,
    isStreaming: false,
    statusText: '',
  },

  // ── AI response with thinking, tool calls, markdown, and post card ──
  {
    id: '2',
    role: 'ai',
    content: [
      'Here are some posts you might like:\n',
      '[Self-Hosting with K3s](/posts/20250702_self_hosting_k3s): A comprehensive guide to running your own Kubernetes cluster at home.\n',
      '[Layout Tutorial](http://localhost:3000/posts/20250626_layout_tutorial): Learn modern CSS layouts (full URL, LLM-style).\n',
      '## Markdown rendering test\n',
      '**Bold text**, *italic text*, and `inline code`.\n',
      '```yaml\napiVersion: v1\nkind: Pod\nmetadata:\n  name: test\n```\n',
      '> A blockquote for emphasis.\n',
      '- Bullet point one\n- Bullet point two\n- Bullet point three\n',
      'Internal non-post link: [About me](/about) | External link: [Nuxt docs](https://nuxt.com)',
    ].join('\n'),
    thinking: ['Let me search for relevant posts about self-hosting...', 'Found several matches in the blog collection.'],
    toolCalls: [
      { name: 'search_posts', status: 'completed', result: 'Found 3 posts' },
    ],
    error: null,
    isStreaming: false,
    statusText: '',
  },

  // ── User follow-up ──
  {
    id: '3',
    role: 'user',
    content: 'What about the layout tutorial?',
    thinking: [],
    toolCalls: [],
    error: null,
    isStreaming: false,
    statusText: '',
  },

  // ── AI with multiple tool calls ──
  {
    id: '4',
    role: 'ai',
    content: 'I found the layout tutorial:\n\n[Layout Tutorial](/posts/20250626_layout_tutorial): Learn how to build responsive layouts with modern CSS.',
    thinking: ['Searching for layout-related content...'],
    toolCalls: [
      { name: 'search_posts', status: 'completed' },
      { name: 'fetch_metadata', status: 'completed' },
    ],
    error: null,
    isStreaming: false,
    statusText: '',
  },

  // ── Rate limit error ──
  {
    id: '5',
    role: 'user',
    content: 'Tell me more',
    thinking: [],
    toolCalls: [],
    error: null,
    isStreaming: false,
    statusText: '',
  },
  {
    id: '6',
    role: 'ai',
    content: '',
    thinking: [],
    toolCalls: [],
    error: { message: 'Too many requests. Please try again later.', code: 'RATE_LIMIT' },
    isStreaming: false,
    statusText: '',
  },

  // ── Connection error ──
  {
    id: '7',
    role: 'ai',
    content: '',
    thinking: [],
    toolCalls: [],
    error: { message: 'Could not connect to chat service.', code: 'CONNECTION_ERROR' },
    isStreaming: false,
    statusText: '',
  },

  // ── Timeout error ──
  {
    id: '8',
    role: 'ai',
    content: '',
    thinking: [],
    toolCalls: [],
    error: { message: 'Request timed out. Please try again.', code: 'TIMEOUT' },
    isStreaming: false,
    statusText: '',
  },

  // ── Partial content with streaming active ──
  {
    id: '9',
    role: 'ai',
    content: 'Here is a partial response that is still streaming',
    thinking: ['Still thinking about this...'],
    toolCalls: [{ name: 'deep_search', status: 'started' }],
    error: null,
    isStreaming: true,
    statusText: '',
  },

  // ── Queued state ──
  {
    id: '10',
    role: 'ai',
    content: '',
    thinking: [],
    toolCalls: [],
    error: null,
    isStreaming: true,
    statusText: 'Queued (position 3)...',
  },

  // ── Connecting state ──
  {
    id: '11',
    role: 'ai',
    content: '',
    thinking: [],
    toolCalls: [],
    error: null,
    isStreaming: true,
    statusText: 'Connecting...',
  },
]
</script>

<style scoped>
/* Match the homepage chat-surface exactly (pages/index.vue .chat-surface) */
.chat-preview-page {
  min-height: 100vh;
  padding: 2rem;
  background: #FEFBF2;
  --chat-bg: #FEFBF2;
  --chat-text: #1A1A1A;
  --chat-muted: #6B6B7B;
  --chat-border: rgba(0, 0, 0, 0.08);
  --chat-bubble-user: #FFF8E7;
  --chat-bubble-ai: #FFFFFF;
  --chat-accent: var(--color-dali-red);
  color: var(--chat-text);
}

.chat-preview-header {
  max-width: 48rem;
  margin: 0 auto 2rem;
}

.chat-preview-header h1 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--chat-text);
  margin-bottom: 0.25rem;
}

.chat-preview-header p {
  font-size: 0.75rem;
  color: var(--chat-muted);
}

.chat-preview-messages {
  max-width: 48rem;
  margin: 0 auto;
}
</style>
