<template>
  <BackgroundLayout container-width="normal" overlay-intensity="heavy" blur-background>
    <!-- Back navigation -->
    <div class="mb-6">
      <button
class="inline-flex items-center gap-2 text-glass hover:text-glass-muted transition-colors"
        @click="$router.push('/tools')">
        <IconsArrowLeft class="w-4 h-4" />
        Back to Tools
      </button>
    </div>

    <PageHeader title="Base64 Encoder/Decoder" description="Encode and decode Base64 strings quickly and easily." />

    <!-- Tool interface -->
    <div class="space-y-6">
      <!-- Input section -->
      <GlassCard variant="primary" padding="lg" radius="lg">
        <h3 class="text-lg font-semibold text-glass mb-4">
          Input Text
        </h3>
        <textarea
v-model="inputText" placeholder="Enter text to encode or Base64 string to decode..."
          class="w-full h-32 p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/60 resize-none focus:outline-none focus:ring-2 focus:ring-white/40"/>
      </GlassCard>

      <!-- Action buttons -->
      <div class="flex flex-wrap gap-4 justify-center">
        <button
:disabled="!inputText.trim()" class="px-6 py-3 glass-secondary rounded-lg hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-glass font-medium"
          @click="encodeText">
          Encode to Base64
        </button>
        <button
:disabled="!inputText.trim()" class="px-6 py-3 glass-secondary rounded-lg hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-glass font-medium"
          @click="decodeText">
          Decode from Base64
        </button>
        <button
class="px-6 py-3 glass-subtle rounded-lg hover:bg-white/20 transition-all text-glass-muted font-medium"
          @click="clearAll">
          Clear All
        </button>
      </div>

      <!-- Output section -->
      <GlassCard variant="primary" padding="lg" radius="lg">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-glass">
            Output
          </h3>
          <button
v-if="outputText" class="px-4 py-2 glass-subtle rounded-lg hover:bg-white/20 transition-all text-glass-muted text-sm font-medium"
            @click="copyOutput">
            {{ copied ? 'Copied!' : 'Copy' }}
          </button>
        </div>
        <textarea
v-model="outputText" readonly placeholder="Output will appear here..."
          class="w-full h-32 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-glass-muted placeholder-white/40 resize-none"/>
        <div v-if="errorMessage" class="mt-2 text-red-400 text-sm drop-shadow-lg">
          {{ errorMessage }}
        </div>
      </GlassCard>
    </div>

    <!-- Back navigation -->
    <!-- <div class="text-center mt-8">
      <NuxtLink 
        to="/tools" 
        class="inline-flex items-center gap-2 text-glass hover:text-glass-muted transition-colors"
      >
        <IconsArrowLeft class="w-4 h-4" />
        Back to Tools
      </NuxtLink>
    </div> -->
  </BackgroundLayout>
</template>

<script setup lang="ts">
import GlassCard from '~/components/ui/GlassCard.vue'
import BackgroundLayout from '~/components/layouts/BackgroundLayout.vue'
import PageHeader from '~/components/ui/PageHeader.vue'
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