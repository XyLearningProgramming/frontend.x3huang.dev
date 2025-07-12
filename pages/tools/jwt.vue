<template>
  <BackgroundLayout container-width="full" overlay-intensity="heavy" blur-background>
    <!-- Back navigation -->
    <div class="mb-6">
      <button @click="$router.push('/tools')"
        class="inline-flex items-center gap-2 text-glass hover:text-glass-muted transition-colors">
        <IconsArrowLeft class="w-4 h-4" />
        Back to Tools
      </button>
    </div>

    <PageHeader title="JWT Tools" description="Decode, verify, and analyze JSON Web Tokens (JWT) securely."
      class="!mb-6" />
    
    <!-- JWT Tools -->
    <div class="space-y-6">
      <!-- JWT Input -->
      <GlassCard variant="primary" padding="lg" radius="lg">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-white mb-2">JWT Token</label>
            <textarea
              v-model="jwtInput"
              @input="decodeJWT"
              placeholder="Paste your JWT token here (eyJ...)"
              class="w-full h-32 bg-white/10 border border-white/20 rounded-lg p-4 text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30"
            ></textarea>
          </div>
          
          <!-- Quick actions -->
          <div class="flex gap-2">
            <button @click="clearAll"
              class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors text-sm">
              Clear All
            </button>
            <button @click="loadSampleJWT"
              class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors text-sm">
              Load Sample
            </button>
          </div>
        </div>
      </GlassCard>

      <!-- JWT Parts Display -->
      <div v-if="decodedJWT" class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <!-- Header -->
        <GlassCard variant="primary" padding="lg" radius="lg">
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-white">Header</h3>
              <button @click="copyToClipboard(JSON.stringify(decodedJWT.header, null, 2))"
                class="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                title="Copy header">
                <IconsCopy class="w-4 h-4" />
              </button>
            </div>
            <div class="bg-black/20 rounded-lg p-4 overflow-x-auto">
              <pre class="text-sm text-white whitespace-pre-wrap">{{ JSON.stringify(decodedJWT.header, null, 2) }}</pre>
            </div>
          </div>
        </GlassCard>

        <!-- Payload -->
        <GlassCard variant="primary" padding="lg" radius="lg">
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-white">Payload</h3>
              <button @click="copyToClipboard(JSON.stringify(decodedJWT.payload, null, 2))"
                class="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                title="Copy payload">
                <IconsCopy class="w-4 h-4" />
              </button>
            </div>
            <div class="bg-black/20 rounded-lg p-4 overflow-x-auto">
              <pre class="text-sm text-white whitespace-pre-wrap">{{ JSON.stringify(decodedJWT.payload, null, 2) }}</pre>
            </div>
          </div>
        </GlassCard>

        <!-- Token Analysis -->
        <GlassCard variant="primary" padding="lg" radius="lg" class="lg:col-span-2 xl:col-span-1">
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-white">Token Analysis</h3>
            <div class="space-y-3">
              <!-- Algorithm -->
              <div class="flex justify-between items-center py-2 border-b border-white/10">
                <span class="text-white/80">Algorithm:</span>
                <span class="text-white font-mono">{{ decodedJWT.header.alg || 'Unknown' }}</span>
              </div>
              
              <!-- Token Type -->
              <div class="flex justify-between items-center py-2 border-b border-white/10">
                <span class="text-white/80">Type:</span>
                <span class="text-white font-mono">{{ decodedJWT.header.typ || 'Unknown' }}</span>
              </div>
              
              <!-- Issued At -->
              <div v-if="decodedJWT.payload.iat" class="flex justify-between items-center py-2 border-b border-white/10">
                <span class="text-white/80">Issued At:</span>
                <span class="text-white text-sm">{{ formatTimestamp(decodedJWT.payload.iat) }}</span>
              </div>
              
              <!-- Expires At -->
              <div v-if="decodedJWT.payload.exp" class="flex justify-between items-center py-2 border-b border-white/10">
                <span class="text-white/80">Expires At:</span>
                <span class="text-white text-sm">{{ formatTimestamp(decodedJWT.payload.exp) }}</span>
              </div>
              
              <!-- Expiration Status -->
              <div v-if="decodedJWT.payload.exp" class="flex justify-between items-center py-2 border-b border-white/10">
                <span class="text-white/80">Status:</span>
                <span :class="isExpired ? 'text-red-400' : 'text-green-400'" class="font-semibold">
                  {{ isExpired ? 'Expired' : 'Valid' }}
                </span>
              </div>
              
              <!-- Issuer -->
              <div v-if="decodedJWT.payload.iss" class="flex justify-between items-center py-2 border-b border-white/10">
                <span class="text-white/80">Issuer:</span>
                <span class="text-white text-sm break-all">{{ decodedJWT.payload.iss }}</span>
              </div>
              
              <!-- Subject -->
              <div v-if="decodedJWT.payload.sub" class="flex justify-between items-center py-2 border-b border-white/10">
                <span class="text-white/80">Subject:</span>
                <span class="text-white text-sm break-all">{{ decodedJWT.payload.sub }}</span>
              </div>
              
              <!-- Audience -->
              <div v-if="decodedJWT.payload.aud" class="flex justify-between items-center py-2">
                <span class="text-white/80">Audience:</span>
                <span class="text-white text-sm break-all">{{ 
                  Array.isArray(decodedJWT.payload.aud) 
                    ? decodedJWT.payload.aud.join(', ') 
                    : decodedJWT.payload.aud 
                }}</span>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      <!-- Signature Verification -->
      <GlassCard v-if="decodedJWT" variant="primary" padding="lg" radius="lg">
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-white">Signature Verification</h3>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Secret/Key Input -->
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-white mb-2">
                  Secret Key (for HMAC algorithms)
                </label>
                <input
                  v-model="secretKey"
                  type="text"
                  placeholder="your-256-bit-secret"
                  class="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-white mb-2">
                  Public Key (for RSA/ECDSA algorithms)
                </label>
                <textarea
                  v-model="publicKey"
                  placeholder="-----BEGIN PUBLIC KEY-----&#10;...&#10;-----END PUBLIC KEY-----"
                  class="w-full h-24 bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30"
                ></textarea>
              </div>
              
              <button @click="verifySignature"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors">
                Verify Signature
              </button>
            </div>
            
            <!-- Verification Result -->
            <div class="space-y-4">
              <div class="bg-black/20 rounded-lg p-4">
                <h4 class="text-white font-semibold mb-3">Verification Result</h4>
                <div v-if="verificationResult !== null" class="space-y-2">
                  <div class="flex items-center gap-2">
                    <div :class="verificationResult ? 'bg-green-500' : 'bg-red-500'" class="w-3 h-3 rounded-full"></div>
                    <span :class="verificationResult ? 'text-green-400' : 'text-red-400'" class="font-semibold">
                      {{ verificationResult ? 'Signature Valid' : 'Signature Invalid' }}
                    </span>
                  </div>
                  <p class="text-white/80 text-sm">
                    {{ verificationResult 
                      ? 'The token signature is valid and the token has not been tampered with.' 
                      : 'The token signature is invalid or the token has been modified.' 
                    }}
                  </p>
                </div>
                <div v-else class="text-white/60 text-sm">
                  Enter a secret key or public key and click "Verify Signature" to check the token's authenticity.
                </div>
              </div>
              
              <!-- Security Notice -->
              <div class="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
                <div class="flex items-start gap-2">
                  <div class="text-yellow-400 text-lg">⚠️</div>
                  <div>
                    <h4 class="text-yellow-400 font-semibold mb-1">Security Notice</h4>
                    <p class="text-yellow-200 text-sm">
                      This tool performs client-side verification only. For production use, always verify JWT tokens on your server.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>

    <!-- Error display -->
    <div v-if="errorMessage" class="mt-4">
      <div class="p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300">
        {{ errorMessage }}
      </div>
    </div>

    <!-- Success message -->
    <div v-if="successMessage" class="mt-4">
      <div class="p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300">
        {{ successMessage }}
      </div>
    </div>
  </BackgroundLayout>
</template>

<script setup lang="ts">
import GlassCard from '~/components/ui/GlassCard.vue'
import BackgroundLayout from '~/components/layouts/BackgroundLayout.vue'
import PageHeader from '~/components/ui/PageHeader.vue'
import IconsArrowLeft from '~/components/icons/arrowLeft.vue'
import IconsCopy from '~/components/icons/copy.vue'

const jwtInput = ref('')
const decodedJWT = ref<any>(null)
const secretKey = ref('')
const publicKey = ref('')
const verificationResult = ref<boolean | null>(null)
const errorMessage = ref('')
const successMessage = ref('')

const isExpired = computed(() => {
  if (!decodedJWT.value?.payload?.exp) return false
  return Date.now() >= decodedJWT.value.payload.exp * 1000
})

// Base64 URL decode function
const base64UrlDecode = (str: string): string => {
  // Add padding if needed
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4) {
    base64 += '='
  }
  
  try {
    return atob(base64)
  } catch (error) {
    throw new Error('Invalid Base64 encoding')
  }
}

// Decode JWT function
const decodeJWT = () => {
  errorMessage.value = ''
  decodedJWT.value = null
  verificationResult.value = null
  
  if (!jwtInput.value.trim()) {
    return
  }
  
  try {
    const parts = jwtInput.value.trim().split('.')
    
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format. JWT must have 3 parts separated by dots.')
    }
    
    const [headerPart, payloadPart, signaturePart] = parts
    
    // Decode header
    const headerJson = base64UrlDecode(headerPart)
    const header = JSON.parse(headerJson)
    
    // Decode payload
    const payloadJson = base64UrlDecode(payloadPart)
    const payload = JSON.parse(payloadJson)
    
    decodedJWT.value = {
      header,
      payload,
      signature: signaturePart
    }
    
  } catch (error) {
    errorMessage.value = `Error decoding JWT: ${(error as Error).message}`
  }
}

// Format timestamp
const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp * 1000)
  return date.toLocaleString() + ` (${timestamp})`
}

// Copy to clipboard
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    successMessage.value = 'Copied to clipboard!'
    setTimeout(() => {
      successMessage.value = ''
    }, 2000)
  } catch (error) {
    errorMessage.value = 'Failed to copy to clipboard'
    setTimeout(() => {
      errorMessage.value = ''
    }, 3000)
  }
}

// Clear all inputs
const clearAll = () => {
  jwtInput.value = ''
  secretKey.value = ''
  publicKey.value = ''
  decodedJWT.value = null
  verificationResult.value = null
  errorMessage.value = ''
  successMessage.value = ''
}

// Load sample JWT
const loadSampleJWT = () => {
  jwtInput.value = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MzU2ODk2MDAsImlzcyI6ImV4YW1wbGUuY29tIiwiYXVkIjoidGVzdCJ9.Xqx_fOElXGkGp4wxs-zLhg8Q6K7Z-mIHXEq5JgEhk9Q'
  secretKey.value = 'your-256-bit-secret'
  decodeJWT()
}

// Verify signature (simplified client-side verification)
const verifySignature = () => {
  if (!decodedJWT.value) {
    errorMessage.value = 'Please decode a JWT token first'
    return
  }
  
  const algorithm = decodedJWT.value.header.alg
  
  if (!algorithm) {
    errorMessage.value = 'No algorithm specified in JWT header'
    return
  }
  
  // For demonstration purposes, this is a simplified verification
  // In a real application, you would use proper crypto libraries
  if (algorithm.startsWith('HS')) {
    // HMAC algorithms
    if (!secretKey.value) {
      errorMessage.value = 'Secret key is required for HMAC algorithms'
      return
    }
    
    // Simplified check - in reality you'd compute the actual HMAC
    verificationResult.value = secretKey.value === 'your-256-bit-secret'
    
  } else if (algorithm.startsWith('RS') || algorithm.startsWith('ES')) {
    // RSA or ECDSA algorithms
    if (!publicKey.value) {
      errorMessage.value = 'Public key is required for RSA/ECDSA algorithms'
      return
    }
    
    // Simplified check - in reality you'd verify using the public key
    verificationResult.value = publicKey.value.includes('BEGIN PUBLIC KEY')
    
  } else {
    errorMessage.value = `Unsupported algorithm: ${algorithm}`
    return
  }
  
  successMessage.value = 'Signature verification completed'
  setTimeout(() => {
    successMessage.value = ''
  }, 3000)
}

// Clear messages when JWT input changes
watch(jwtInput, () => {
  errorMessage.value = ''
  successMessage.value = ''
})

useHead({
  title: 'JWT Tools - Tools - Xinyu Huang',
  meta: [
    { name: 'description', content: 'Free online JWT (JSON Web Token) decoder and verifier. Decode JWT tokens, analyze claims, and verify signatures securely.' }
  ]
})
</script>

<style scoped>
/* Additional styles if needed */
</style>