<template>
  <div class="w-full px-4 pb-4 pt-2">
    <div class="relative mx-auto max-w-3xl neo-input overflow-hidden chat-input-wrapper">
      <!-- Bouncing dots shown when input is empty and not focused -->
      <div
        v-if="showDots"
        class="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
      >
        <NeoBouncingDots :size="'6px'" :color="'var(--color-neo-text-muted)'" />
        <span class="ml-2 text-sm text-neo-text-muted">Ask me anything!</span>
      </div>

      <textarea
        ref="textareaRef"
        v-model="input"
        :maxlength="MAX_LENGTH"
        :disabled="disabled"
        :placeholder="isFocused ? 'Ask me anything!' : ''"
        rows="1"
        class="w-full bg-transparent text-sm resize-none px-4 py-3 pr-20 outline-none max-h-32 overflow-y-auto font-[family-name:var(--font-neo-body)]"
        @keydown="handleKeydown"
        @input="autoResize"
        @focus="isFocused = true"
        @blur="isFocused = false"
      />
      <div class="absolute right-2 bottom-2 flex items-center gap-2">
        <span
          class="text-[10px] tabular-nums"
          :class="charCount >= MAX_LENGTH ? 'text-neo-red font-bold' : 'text-neo-text-muted'"
        >{{ charCount }}/{{ MAX_LENGTH }}</span>
        <button
          :disabled="!canSend"
          class="neo-btn p-1.5 transition-all duration-200"
          :class="canSend
            ? 'bg-neo-yellow text-neo-black send-btn-active'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300 shadow-none'"
          @click="send"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const MAX_LENGTH = 512

interface Props {
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), { disabled: false })

const emit = defineEmits<{
  send: [message: string]
}>()

const input = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const isFocused = ref(false)

const charCount = computed(() => input.value.length)
const canSend = computed(() => input.value.trim().length > 0 && !props.disabled)
const showDots = computed(() => !isFocused.value && input.value.length === 0)

function send() {
  if (!canSend.value) return
  emit('send', input.value.trim())
  input.value = ''
  nextTick(() => autoResize())
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    send()
  }
}

function autoResize() {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${Math.min(el.scrollHeight, 128)}px`
}
</script>

<style scoped>
.chat-input-wrapper {
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}
.chat-input-wrapper:focus-within {
  box-shadow: var(--shadow-neo);
  transform: translate(-1px, -1px);
}

/* Send button pulse on hover when active */
.send-btn-active:hover {
  animation: sendPulse 0.6s ease-in-out;
}

@keyframes sendPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
}
</style>
