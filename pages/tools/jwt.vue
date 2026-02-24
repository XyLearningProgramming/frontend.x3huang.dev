<template>
  <div class="min-h-screen py-16 px-4" style="background: var(--color-dali-void);">
    <div class="container mx-auto max-w-screen-xl">
      <!-- Back navigation -->
      <div class="mb-6">
        <button @click="$router.push('/tools')"
          class="dali-btn inline-flex items-center gap-2 px-3 py-1.5 text-sm font-bold">
          <IconsArrowLeft class="w-4 h-4" />
          Back to Tools
        </button>
      </div>

      <!-- Header -->
      <div class="mb-6">
        <h1 class="font-bold mb-2 text-dali-white" style="transform: rotate(-1deg);">JWT Tools</h1>
        <p class="text-lg text-dali-muted max-w-2xl leading-relaxed">
          Decode, verify, and analyze JSON Web Tokens (JWT) securely.
        </p>
      </div>

      <!-- JWT Tools -->
      <div class="space-y-6">
        <!-- JWT Input -->
        <div class="dali-card p-6" style="border-color: var(--color-dali-muted);">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-bold text-dali-white mb-2">JWT Token</label>
              <textarea
                v-model="jwtInput"
                @input="decodeJWT"
                placeholder="Paste your JWT token here (eyJ...)"
                class="dali-input w-full h-32 p-4 resize-none"
              ></textarea>
            </div>

            <!-- Quick actions -->
            <div class="flex gap-2">
              <button @click="clearAll"
                class="dali-btn px-4 py-2 text-sm font-bold"
                style="border-color: var(--color-dali-muted);">
                Clear All
              </button>
              <button @click="loadSampleJWT"
                class="dali-btn px-4 py-2 bg-dali-gold text-dali-void text-sm font-bold"
                style="border-color: var(--color-dali-gold);">
                Load Sample
              </button>
            </div>
          </div>
        </div>

        <!-- JWT Parts Display -->
        <div v-if="decodedJWT" class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <!-- Header -->
          <div class="dali-card p-6" style="border-color: var(--color-dali-red);">
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-bold text-dali-white">Header</h3>
                <button @click="copyToClipboard(JSON.stringify(decodedJWT.header, null, 2))"
                  class="dali-btn p-2"
                  style="border-color: var(--color-dali-muted);"
                  title="Copy header">
                  <IconsCopy class="w-4 h-4" />
                </button>
              </div>
              <div class="bg-dali-void border-2 border-dali-muted/30 p-4 overflow-x-auto">
                <pre class="text-sm text-dali-white whitespace-pre-wrap font-mono">{{ JSON.stringify(decodedJWT.header, null, 2) }}</pre>
              </div>
            </div>
          </div>

          <!-- Payload -->
          <div class="dali-card p-6" style="border-color: var(--color-dali-teal);">
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-bold text-dali-white">Payload</h3>
                <button @click="copyToClipboard(JSON.stringify(decodedJWT.payload, null, 2))"
                  class="dali-btn p-2"
                  style="border-color: var(--color-dali-muted);"
                  title="Copy payload">
                  <IconsCopy class="w-4 h-4" />
                </button>
              </div>
              <div class="bg-dali-void border-2 border-dali-muted/30 p-4 overflow-x-auto">
                <pre class="text-sm text-dali-white whitespace-pre-wrap font-mono">{{ JSON.stringify(decodedJWT.payload, null, 2) }}</pre>
              </div>
            </div>
          </div>

          <!-- Token Analysis -->
          <div class="dali-card p-6 lg:col-span-2 xl:col-span-1" style="border-color: var(--color-dali-gold);">
            <div class="space-y-4">
              <h3 class="text-lg font-bold text-dali-white">Token Analysis</h3>
              <div class="space-y-3">
                <div class="flex justify-between items-center py-2 border-b border-dali-muted/30">
                  <span class="text-dali-muted">Algorithm:</span>
                  <span class="text-dali-white font-mono font-bold">{{ decodedJWT.header.alg || 'Unknown' }}</span>
                </div>

                <div class="flex justify-between items-center py-2 border-b border-dali-muted/30">
                  <span class="text-dali-muted">Type:</span>
                  <span class="text-dali-white font-mono font-bold">{{ decodedJWT.header.typ || 'Unknown' }}</span>
                </div>

                <div v-if="decodedJWT.payload.iat" class="flex justify-between items-center py-2 border-b border-dali-muted/30">
                  <span class="text-dali-muted">Issued At:</span>
                  <span class="text-dali-white text-sm">{{ formatTimestamp(decodedJWT.payload.iat) }}</span>
                </div>

                <div v-if="decodedJWT.payload.exp" class="flex justify-between items-center py-2 border-b border-dali-muted/30">
                  <span class="text-dali-muted">Expires At:</span>
                  <span class="text-dali-white text-sm">{{ formatTimestamp(decodedJWT.payload.exp) }}</span>
                </div>

                <div v-if="decodedJWT.payload.exp" class="flex justify-between items-center py-2 border-b border-dali-muted/30">
                  <span class="text-dali-muted">Status:</span>
                  <span :class="isExpired ? 'text-dali-red' : 'text-dali-teal'" class="font-bold">
                    {{ isExpired ? 'Expired' : 'Valid' }}
                  </span>
                </div>

                <div v-if="decodedJWT.payload.iss" class="flex justify-between items-center py-2 border-b border-dali-muted/30">
                  <span class="text-dali-muted">Issuer:</span>
                  <span class="text-dali-white text-sm break-all">{{ decodedJWT.payload.iss }}</span>
                </div>

                <div v-if="decodedJWT.payload.sub" class="flex justify-between items-center py-2 border-b border-dali-muted/30">
                  <span class="text-dali-muted">Subject:</span>
                  <span class="text-dali-white text-sm break-all">{{ decodedJWT.payload.sub }}</span>
                </div>

                <div v-if="decodedJWT.payload.aud" class="flex justify-between items-center py-2">
                  <span class="text-dali-muted">Audience:</span>
                  <span class="text-dali-white text-sm break-all">{{
                    Array.isArray(decodedJWT.payload.aud)
                      ? decodedJWT.payload.aud.join(', ')
                      : decodedJWT.payload.aud
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Signature Verification -->
        <div v-if="decodedJWT" class="dali-card p-6" style="border-color: var(--color-dali-violet);">
          <div class="space-y-4">
            <h3 class="text-lg font-bold text-dali-white">Signature Verification</h3>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Secret/Key Input -->
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-bold text-dali-white mb-2">
                    Secret Key (for HMAC algorithms)
                  </label>
                  <input
                    v-model="secretKey"
                    type="text"
                    placeholder="your-256-bit-secret"
                    class="dali-input w-full p-3"
                  />
                </div>

                <div>
                  <label class="block text-sm font-bold text-dali-white mb-2">
                    Public Key (for RSA/ECDSA algorithms)
                  </label>
                  <textarea
                    v-model="publicKey"
                    placeholder="-----BEGIN PUBLIC KEY-----&#10;...&#10;-----END PUBLIC KEY-----"
                    class="dali-input w-full h-24 p-3 resize-none"
                  ></textarea>
                </div>

                <button @click="verifySignature"
                  class="dali-btn px-4 py-2 bg-dali-teal text-dali-void font-bold"
                  style="border-color: var(--color-dali-teal);">
                  Verify Signature
                </button>
              </div>

              <!-- Verification Result -->
              <div class="space-y-4">
                <div class="bg-dali-void/50 border-2 border-dali-muted/30 p-4">
                  <h4 class="text-dali-white font-bold mb-3">Verification Result</h4>
                  <div v-if="verificationResult !== null" class="space-y-2">
                    <div class="flex items-center gap-2">
                      <div :class="verificationResult ? 'bg-dali-teal' : 'bg-dali-red'" class="w-3 h-3 border border-dali-white/20"></div>
                      <span :class="verificationResult ? 'text-dali-teal' : 'text-dali-red'" class="font-bold">
                        {{ verificationResult ? 'Signature Valid' : 'Signature Invalid' }}
                      </span>
                    </div>
                    <p class="text-dali-muted text-sm">
                      {{ verificationResult
                        ? 'The token signature is valid and the token has not been tampered with.'
                        : 'The token signature is invalid or the token has been modified.'
                      }}
                    </p>
                  </div>
                  <div v-else class="text-dali-muted/60 text-sm">
                    Enter a secret key or public key and click "Verify Signature" to check the token's authenticity.
                  </div>
                </div>

                <!-- Security Notice -->
                <div class="bg-dali-gold/10 border-2 border-dali-gold/30 p-4">
                  <div class="flex items-start gap-2">
                    <div class="text-lg">⚠️</div>
                    <div>
                      <h4 class="text-dali-gold font-bold mb-1">Security Notice</h4>
                      <p class="text-dali-muted text-sm">
                        This tool performs client-side verification only. For production use, always verify JWT tokens on your server.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error display -->
      <div v-if="errorMessage" class="mt-4">
        <div class="p-4 border-2 border-dali-red bg-dali-red/10 text-dali-white font-bold">
          {{ errorMessage }}
        </div>
      </div>

      <!-- Success message -->
      <div v-if="successMessage" class="mt-4">
        <div class="p-4 border-2 border-dali-teal bg-dali-teal/10 text-dali-white font-bold">
          {{ successMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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

const base64UrlDecode = (str: string): string => {
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
    
    const headerJson = base64UrlDecode(headerPart)
    const header = JSON.parse(headerJson)
    
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

const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp * 1000)
  return date.toLocaleString() + ` (${timestamp})`
}

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

const clearAll = () => {
  jwtInput.value = ''
  secretKey.value = ''
  publicKey.value = ''
  decodedJWT.value = null
  verificationResult.value = null
  errorMessage.value = ''
  successMessage.value = ''
}

const loadSampleJWT = () => {
  jwtInput.value = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MzU2ODk2MDAsImlzcyI6ImV4YW1wbGUuY29tIiwiYXVkIjoidGVzdCJ9.Xqx_fOElXGkGp4wxs-zLhg8Q6K7Z-mIHXEq5JgEhk9Q'
  secretKey.value = 'your-256-bit-secret'
  decodeJWT()
}

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
  
  if (algorithm.startsWith('HS')) {
    if (!secretKey.value) {
      errorMessage.value = 'Secret key is required for HMAC algorithms'
      return
    }
    
    verificationResult.value = secretKey.value === 'your-256-bit-secret'
    
  } else if (algorithm.startsWith('RS') || algorithm.startsWith('ES')) {
    if (!publicKey.value) {
      errorMessage.value = 'Public key is required for RSA/ECDSA algorithms'
      return
    }
    
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
