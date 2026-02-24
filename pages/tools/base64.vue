<template>
  <div class="min-h-screen bg-neo-section-tools text-neo-black py-16 px-4">
    <div class="container mx-auto max-w-screen-xl">
      <!-- Back navigation -->
      <div class="mb-6">
        <button
          class="inline-flex items-center gap-2 text-neo-black/70 hover:text-neo-black transition-colors"
          @click="$router.push('/tools')">
          <IconsArrowLeft class="w-4 h-4" />
          Back to Tools
        </button>
      </div>

      <!-- Header -->
      <div class="mb-8">
        <h1 class="font-neo-heading text-h2-sm md:text-h2 font-bold mb-2">Base64 Encoder/Decoder</h1>
        <p class="text-lg text-neo-black/70 max-w-2xl leading-relaxed">
          Encode and decode Base64 strings quickly and easily.
        </p>
      </div>

      <!-- Tool interface -->
      <div class="space-y-6">
        <!-- Input section -->
        <div class="neo-border bg-neo-bg p-6 relative" style="box-shadow: 4px 4px 0px 0px #000;">
          <h3 class="text-lg font-bold text-neo-black mb-4">
            Input Text
          </h3>
          <textarea
            v-model="inputText" placeholder="Enter text to encode or Base64 string to decode..."
            class="w-full h-32 p-4 neo-border bg-neo-bg text-neo-black placeholder-neo-black/40 resize-none focus:outline-none rounded-none"
            style="box-shadow: 2px 2px 0px 0px #000;"
          />
        </div>

        <!-- Action buttons -->
        <div class="flex flex-wrap gap-4 justify-center">
          <button
            :disabled="!inputText.trim()"
            class="px-6 py-3 neo-border bg-neo-yellow text-neo-black font-bold hover:bg-neo-orange disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-none"
            style="box-shadow: 4px 4px 0px 0px #000;"
            @click="encodeText">
            Encode to Base64
          </button>
          <button
            :disabled="!inputText.trim()"
            class="px-6 py-3 neo-border bg-neo-blue text-neo-black font-bold hover:bg-neo-cyan disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-none"
            style="box-shadow: 4px 4px 0px 0px #000;"
            @click="decodeText">
            Decode from Base64
          </button>
          <button
            class="px-6 py-3 neo-border bg-neo-bg text-neo-black font-bold hover:bg-neo-yellow transition-colors rounded-none"
            style="box-shadow: 4px 4px 0px 0px #000;"
            @click="clearAll">
            Clear All
          </button>
        </div>

        <!-- Output section -->
        <div class="neo-border bg-neo-bg p-6 relative" style="box-shadow: 4px 4px 0px 0px #000;">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold text-neo-black">
              Output
            </h3>
            <button
              v-if="outputText"
              class="px-4 py-2 neo-border bg-neo-green text-neo-black font-bold hover:bg-neo-cyan transition-colors rounded-none text-sm"
              style="box-shadow: 2px 2px 0px 0px #000;"
              @click="copyOutput">
              {{ copied ? 'Copied!' : 'Copy' }}
            </button>
          </div>
          <textarea
            v-model="outputText" readonly placeholder="Output will appear here..."
            class="w-full h-32 p-4 neo-border bg-neo-bg text-neo-black/70 placeholder-neo-black/30 resize-none rounded-none"
          />
          <div v-if="errorMessage" class="mt-2 text-neo-red text-sm font-bold">
            {{ errorMessage }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconsArrowLeft from '~/components/icons/arrowLeft.vue'

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
    { name: 'description', content: 'Free online Base64 encoder and decoder tool. Convert text to Base64 or decode Base64 strings quickly and easily.' }
  ]
})
</script>
