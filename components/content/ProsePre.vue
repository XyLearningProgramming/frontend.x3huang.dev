<template>
  <div class="prose-pre-wrapper">
    <div class="code-block">
      <!-- Header bar -->
      <div class="header">
        <div class="file-info">
          <span v-if="language" class="lang-badge">{{ language }}</span>
          <span v-if="filename" class="filename">{{ filename }}</span>
        </div>
        <button type="button" class="copy-btn" @click="copyCode" :title="copied ? 'Copied!' : 'Copy code'">
          <svg v-if="!copied" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
          </svg>
          <svg v-else class="w-4 h-4 text-neo-green" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </button>
      </div>

      <!-- Code content - rendered by Nuxt Content's Shiki -->
      <div class="code-content">
        <pre :class="$attrs.class"><slot /></pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    code?: string
    language?: string | null
    filename?: string | null
    highlights?: Array<number>
  }>(),
  { code: '', language: null, filename: null, highlights: () => [] },
)

const copied = ref(false)

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(props.code || '')
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
  catch (err) {
    console.error('Failed to copy code:', err)
  }
}
</script>

<style scoped>
.prose-pre-wrapper {
  margin-top: 1.25rem;
  margin-bottom: 1.25rem;
}

.code-block {
  border: 2px solid var(--color-neo-black);
  box-shadow: var(--shadow-neo-sm);
  overflow: hidden;
  background: #1e1e2e;
}

.header {
  background: #181825;
  border-bottom: 2px solid var(--color-neo-black);
  padding: 6px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.lang-badge {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-neo-cyan);
  font-family: var(--font-neo-mono);
}

.filename {
  font-size: 12px;
  color: #a6adc8;
  font-family: var(--font-neo-mono);
}

.copy-btn {
  background: #313244;
  border: 1px solid #45475a;
  color: #cdd6f4;
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.15s;
}

.copy-btn:hover {
  background: #45475a;
}

.code-content {
  overflow-x: auto;
}

.code-content :deep(pre) {
  margin: 0 !important;
  padding: 1rem !important;
  background: #1e1e2e !important;
  border: none !important;
  border-radius: 0 !important;
  font-family: var(--font-neo-mono) !important;
  font-size: 0.875rem !important;
  line-height: 1.6 !important;
}

.code-content :deep(code) {
  font-family: var(--font-neo-mono) !important;
  font-size: inherit !important;
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
}

/* Line styles from Shiki */
.code-content :deep(.line) {
  display: block !important;
  min-height: 1rem;
  white-space: pre-wrap;
  padding-left: 1rem;
  margin-left: -1rem;
  margin-right: -1rem;
  padding-right: 1rem;
}

/* Highlighted lines (```lang{1-3,5} syntax) */
.code-content :deep(.line.highlight) {
  background-color: rgba(255, 255, 255, 0.06);
  border-left: 3px solid var(--color-dali-gold, #D4A843);
  padding-left: calc(1rem - 3px);
}
</style>
