<template>
  <div ref="wrapperRef" class="w-full px-4 pb-4 pt-2">
    <div class="relative mx-auto max-w-3xl overflow-hidden chat-input-wrapper">
      <!-- Bouncing dots shown when input is empty and not focused -->
      <div
        v-if="showDots"
        class="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1"
      >
        <span class="chat-dot" style="animation-delay: 0ms" />
        <span class="chat-dot" style="animation-delay: 150ms" />
        <span class="chat-dot" style="animation-delay: 300ms" />
        <span class="ml-2 text-sm" style="color: var(--chat-muted, var(--color-dali-muted));">Ask me anything!</span>
      </div>

      <textarea
        ref="textareaRef"
        v-model="input"
        :maxlength="MAX_LENGTH"
        :disabled="disabled"
        placeholder=""
        rows="1"
        class="w-full bg-transparent text-sm resize-none px-4 py-3 pr-20 outline-none max-h-32 overflow-y-auto chat-textarea"
        style="font-family: var(--font-dali-body, inherit);"
        @keydown="handleKeydown"
        @input="autoResize"
        @focus="isFocused = true"
        @blur="isFocused = false"
      />
      <div class="absolute right-2 bottom-2 flex items-center gap-2">
        <span
          class="text-[10px] tabular-nums"
          :style="charCount >= MAX_LENGTH
            ? 'color: var(--color-dali-red); font-weight: 700;'
            : 'color: var(--chat-muted, var(--color-dali-muted));'"
        >{{ charCount }}/{{ MAX_LENGTH }}</span>
        <button
          :disabled="!canSend"
          class="p-1.5 transition-all duration-200 border-2 rounded-lg cursor-pointer"
          :class="canSend
            ? 'send-btn-active'
            : 'cursor-not-allowed shadow-none'"
          :style="canSend
            ? 'background: var(--color-dali-red); color: white; border-color: var(--color-dali-red); box-shadow: var(--shadow-dali-void-sm);'
            : 'background: rgba(0,0,0,0.05); color: rgba(0,0,0,0.25); border-color: rgba(0,0,0,0.1);'"
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
const wrapperRef = ref<HTMLElement | null>(null)
const isFocused = ref(false)

defineExpose({
  getRect: () => wrapperRef.value?.querySelector('.chat-input-wrapper')?.getBoundingClientRect(),
})

const charCount = computed(() => input.value.length)
const canSend = computed(() => input.value.trim().length > 0 && !props.disabled)
const showDots = computed(() => input.value.length === 0)

function send() {
  if (!canSend.value) return
  emit('send', input.value.trim())
  input.value = ''
  nextTick(() => {
    autoResize()
    textareaRef.value?.focus()
  })
}

// Re-focus when streaming finishes (disabled goes false)
watch(() => props.disabled, (disabled, wasDis) => {
  if (wasDis && !disabled) {
    nextTick(() => textareaRef.value?.focus())
  }
})

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
  background: var(--chat-bubble-ai, rgba(255,255,255,0.8));
  border: 2px solid var(--chat-border, rgba(0,0,0,0.1));
  border-radius: 12px;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}
.chat-input-wrapper:focus-within {
  box-shadow: 0 0 0 3px rgba(237, 28, 36, 0.1);
  border-color: var(--color-dali-red);
}

.chat-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--chat-muted, var(--color-dali-muted));
  opacity: 0.4;
  animation: dotBounce 1.2s ease-in-out infinite;
}

@keyframes dotBounce {
  0%, 100% { transform: translateY(0); opacity: 0.4; }
  50% { transform: translateY(-4px); opacity: 1; }
}

.send-btn-active {
  border-radius: 8px;
}
.send-btn-active:hover {
  animation: sendPulse 0.6s ease-in-out;
}

@keyframes sendPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
}

/* Ensure text is always dark on the light input background */
.chat-textarea {
  color: var(--chat-text, #1A1A1A);
  caret-color: var(--color-dali-red, #ED1C24);
}
.chat-textarea::placeholder {
  color: var(--chat-muted, #6B6B7B);
  opacity: 0.7;
}
</style>
