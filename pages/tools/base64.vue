<template>
  <LayoutsSubPageLayout
    title="Base64 Encoder/Decoder"
    back-to="/#tools"
    back-label="Tools"
    max-width="wide"
  >
    <template #header>
      <p class="text-lg text-dali-muted max-w-2xl leading-relaxed">
        Encode and decode Base64 strings quickly and easily.
      </p>
    </template>

    <!-- Tool interface -->
    <div class="space-y-6">
      <!-- Input section -->
      <div class="dali-card dali-card--static p-6" style="border-color: var(--color-dali-red);">
        <h3 class="text-lg font-bold text-dali-white mb-4">
          Input Text
        </h3>
        <textarea
          v-model="inputText"
          placeholder="Enter text to encode or Base64 string to decode..."
          class="dali-input w-full h-32 p-4 resize-none"
        />
      </div>

      <!-- Action buttons -->
      <div class="flex flex-wrap gap-4 justify-center">
        <button
          :disabled="!inputText.trim()"
          class="dali-btn px-6 py-3 bg-dali-red text-dali-white disabled:opacity-50 disabled:cursor-not-allowed"
          @click="encodeText"
        >
          Encode to Base64
        </button>
        <button
          :disabled="!inputText.trim()"
          class="dali-btn px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          style="border-color: var(--color-dali-teal);"
          @click="decodeText"
        >
          Decode from Base64
        </button>
        <button
          class="dali-btn px-6 py-3"
          style="border-color: var(--color-dali-muted);"
          @click="clearAll"
        >
          Clear All
        </button>
      </div>

      <!-- Output section -->
      <div class="dali-card dali-card--static p-6" style="border-color: var(--color-dali-red);">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold text-dali-white">
            Output
          </h3>
          <button
            v-if="outputText"
            class="dali-btn px-4 py-2 text-sm bg-dali-teal text-dali-void"
            style="border-color: var(--color-dali-teal);"
            @click="copyOutput"
          >
            {{ copied ? 'Copied!' : 'Copy' }}
          </button>
        </div>
        <textarea
          v-model="outputText"
          readonly
          placeholder="Output will appear here..."
          class="dali-input w-full h-32 p-4 resize-none opacity-80"
        />
        <div v-if="errorMessage" class="mt-2 text-dali-red text-sm font-bold">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  </LayoutsSubPageLayout>
</template>

<script setup lang="ts">

const inputText = ref('')
const outputText = ref('')
const errorMessage = ref('')
const copied = ref(false)

const encodeText = () => {
  try {
    errorMessage.value = ''
    outputText.value = btoa(unescape(encodeURIComponent(inputText.value)))
  } catch (error) {
    errorMessage.value = 'Error encoding text. Please check your input.'
    outputText.value = ''
  }
}

const decodeText = () => {
  try {
    errorMessage.value = ''
    outputText.value = decodeURIComponent(escape(atob(inputText.value)))
  } catch (error) {
    errorMessage.value = 'Error decoding Base64. Please check if the input is valid Base64.'
    outputText.value = ''
  }
}

const clearAll = () => {
  inputText.value = ''
  outputText.value = ''
  errorMessage.value = ''
  copied.value = false
}

const copyOutput = async () => {
  try {
    await navigator.clipboard.writeText(outputText.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (error) {
    console.error('Failed to copy text:', error)
  }
}

useHead({
  title: 'Base64 Encoder/Decoder - Tools - Xinyu Huang',
  meta: [
    { name: 'description', content: 'Free online Base64 encoder and decoder tool. Convert text to Base64 or decode Base64 strings quickly and easily.' },
  ],
})
</script>
