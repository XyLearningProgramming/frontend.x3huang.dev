<template>
  <!-- Idle state: just the input bar, no messages yet -->
  <div v-if="!hasMessages" class="w-full max-w-3xl mx-auto">
    <p class="text-center text-white/40 text-sm mb-4">Ask me anything to start a conversation.</p>
    <ChatInput @send="handleSend" />
  </div>

  <!-- Active state: full chat with messages -->
  <div v-else class="flex flex-col w-full max-w-3xl mx-auto" style="height: calc(100vh - 12rem)">
    <!-- Message area -->
    <div ref="scrollContainer" class="flex-1 overflow-y-auto px-2 py-4 scroll-smooth chat-scroll">
      <ChatMessage v-for="msg in messages" :key="msg.id" :message="msg" @retry="handleRetry" />
    </div>

    <!-- Clear conversation button -->
    <div v-if="!isStreaming" class="flex justify-center pb-1">
      <button
        class="text-xs text-white/30 hover:text-white/60 transition-colors"
        @click="clearConversation"
      >
        Clear conversation
      </button>
    </div>

    <!-- Input bar -->
    <ChatInput @send="handleSend" />
  </div>
</template>

<script setup lang="ts">
import ChatMessage from './ChatMessage.vue'
import ChatInput from './ChatInput.vue'

const { messages, isStreaming, sendMessage, retryLast, clearConversation } = useChatty()

const hasMessages = computed(() => messages.value.length > 0)

const emit = defineEmits<{
  'active-change': [active: boolean]
}>()

watch(hasMessages, (val) => emit('active-change', val), { immediate: true })

const scrollContainer = ref<HTMLElement | null>(null)

onMounted(() => {
  if (hasMessages.value) nextTick(scrollToBottom)
})

function handleSend(message: string) {
  sendMessage(message)
}

function handleRetry() {
  retryLast()
}

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
  () => messages.value.length,
  () => nextTick(scrollToBottom),
)

watch(
  () => {
    const last = messages.value[messages.value.length - 1]
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
  background: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
}

.chat-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.chat-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
}
</style>
