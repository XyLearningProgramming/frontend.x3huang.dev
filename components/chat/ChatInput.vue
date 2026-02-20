<template>
  <div class="w-full px-4 pb-4 pt-2">
    <div class="relative max-w-3xl mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden">
      <textarea
        ref="textareaRef"
        v-model="input"
        :maxlength="MAX_LENGTH"
        :disabled="disabled"
        placeholder="Ask me anything!"
        rows="1"
        class="w-full bg-transparent text-white text-sm placeholder-white/40 resize-none px-4 py-3 pr-20 outline-none max-h-32 overflow-y-auto"
        @keydown="handleKeydown"
        @input="autoResize"
      />
      <div class="absolute right-2 bottom-2 flex items-center gap-2">
        <span
          class="text-[10px] tabular-nums"
          :class="charCount >= MAX_LENGTH ? 'text-red-300/80' : 'text-white/30'"
        >{{ charCount }}/{{ MAX_LENGTH }}</span>
        <button
          :disabled="!canSend"
          class="p-1.5 rounded-lg transition-colors"
          :class="canSend
            ? 'bg-white/20 hover:bg-white/30 text-white'
            : 'bg-white/5 text-white/20 cursor-not-allowed'"
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

const charCount = computed(() => input.value.length)
const canSend = computed(() => input.value.trim().length > 0 && !props.disabled)

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
