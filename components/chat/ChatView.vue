<template>
  <div class="flex flex-col w-full h-full min-h-[100dvh]">
    <!-- Chat header -->
    <div class="flex flex-col items-center justify-center px-4 py-2.5 border-b shrink-0 gap-0.5" style="border-color: var(--chat-border, rgba(0,0,0,0.08));">
      <span class="text-xs" style="color: var(--chat-muted, #6B6B7B);">
        Powered by
        <a
          href="https://github.com/XyLearningProgramming/chatty"
          target="_blank"
          rel="noopener noreferrer"
          class="underline font-bold text-dali-teal"
        >chatty</a>
        <span class="text-[10px] opacity-60 ml-1">— responses may take 10-60 s</span>
      </span>
      <span class="text-[10px] opacity-40" style="color: var(--chat-muted, #6B6B7B);">
        Responses are AI-generated and may not always be accurate.
      </span>
    </div>

    <!-- Message area -->
    <div
      ref="scrollContainer"
      class="flex-1 overflow-y-auto px-4 py-6 scroll-smooth chat-scroll"
    >
      <div class="max-w-3xl mx-auto">
        <ChatMessage
          v-for="msg in messages"
          :key="msg.id"
          :message="msg"
          @retry="emit('retry')"
        />
      </div>
    </div>

    <!-- Clear conversation (just above input) -->
    <div
      v-if="!isStreaming && messages.length > 1"
      class="flex justify-center pb-1 shrink-0"
    >
      <button
        class="text-[10px] px-3 py-1 uppercase tracking-wider font-mono transition-all duration-200 cursor-pointer border border-transparent hover:border-dali-red/30 hover:text-dali-red"
        style="color: var(--chat-muted, #6B6B7B);"
        @click="emit('clear')"
      >
        Clear conversation
      </button>
    </div>

    <!-- Input bar -->
    <div class="shrink-0 max-w-3xl mx-auto w-full">
      <ChatInput ref="chatInputComp" :disabled="isStreaming" @send="(msg: string) => emit('send', msg)" />
    </div>

    <!-- Scroll to explore (below input, at very bottom) -->
    <div class="flex justify-center items-center gap-1.5 py-3 shrink-0">
      <svg class="w-3 h-3 animate-bounce-gentle" style="color: var(--chat-muted, #6B6B7B); opacity: 0.5;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
      <span class="text-[10px] uppercase tracking-widest font-mono" style="color: var(--chat-muted, #6B6B7B); opacity: 0.5;">
        Scroll to explore site
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import ChatMessage from './ChatMessage.vue'
import ChatInput from './ChatInput.vue'
import type { ChatMessage as ChatMessageType } from '~/composables/useChatty'

const props = defineProps<{
  messages: readonly ChatMessageType[]
  isStreaming: boolean
}>()

const emit = defineEmits<{
  send: [message: string]
  retry: []
  clear: []
}>()

const scrollContainer = ref<HTMLElement | null>(null)
const chatInputComp = ref<InstanceType<typeof ChatInput> | null>(null)

defineExpose({
  /** Return the ChatInput root DOM element */
  getInputEl: () => chatInputComp.value?.$el as HTMLElement | undefined,
})

onMounted(() => {
  if (props.messages.length > 0) nextTick(scrollToBottom)
})

function scrollToBottom() {
  const el = scrollContainer.value
  if (!el) return
  el.scrollTop = el.scrollHeight
}

function scrollIfNearBottom() {
  const el = scrollContainer.value
  if (!el) return
  const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150
  if (isNearBottom) nextTick(scrollToBottom)
}

watch(
  () => props.messages.length,
  () => nextTick(scrollToBottom),
)

watch(
  () => {
    const last = props.messages[props.messages.length - 1]
    if (!last) return 0
    return (last.content?.length ?? 0)
      + (last.thinking?.length ?? 0)
      + (last.statusText?.length ?? 0)
  },
  () => scrollIfNearBottom(),
)
</script>

<style scoped>
.chat-scroll::-webkit-scrollbar {
  width: 4px;
}
.chat-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.chat-scroll::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
}
.chat-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}
.chat-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.1) transparent;
}

@keyframes bounceGentle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(4px); }
}
.animate-bounce-gentle {
  animation: bounceGentle 2s ease-in-out infinite;
}
</style>
