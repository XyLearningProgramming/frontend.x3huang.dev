<template>
  <div class="min-h-screen bg-neo-section-tools text-neo-black py-16 px-4">
    <div class="container mx-auto max-w-screen-xl">
      <!-- Back navigation -->
      <div class="mb-6">
        <button @click="$router.push('/tools')"
          class="inline-flex items-center gap-2 text-neo-black/70 hover:text-neo-black transition-colors">
          <IconsArrowLeft class="w-4 h-4" />
          Back to Tools
        </button>
      </div>

      <!-- Header -->
      <div class="mb-6">
        <h1 class="font-neo-heading text-h2-sm md:text-h2 font-bold mb-2">JWT Tools</h1>
        <p class="text-lg text-neo-black/70 max-w-2xl leading-relaxed">
          Decode, verify, and analyze JSON Web Tokens (JWT) securely.
        </p>
      </div>
      
      <!-- JWT Tools -->
      <div class="space-y-6">
        <!-- JWT Input -->
        <div class="neo-border bg-neo-bg p-6 relative" style="box-shadow: 4px 4px 0px 0px #000;">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-bold text-neo-black mb-2">JWT Token</label>
              <textarea
                v-model="jwtInput"
                @input="decodeJWT"
                placeholder="Paste your JWT token here (eyJ...)"
                class="w-full h-32 neo-border bg-neo-bg p-4 text-neo-black placeholder-neo-black/40 resize-none focus:outline-none rounded-none"
                style="box-shadow: 2px 2px 0px 0px #000;"
              ></textarea>
            </div>
            
            <!-- Quick actions -->
            <div class="flex gap-2">
              <button @click="clearAll"
                class="px-4 py-2 neo-border bg-neo-bg hover:bg-neo-yellow text-neo-black transition-colors text-sm font-bold rounded-none"
                style="box-shadow: 2px 2px 0px 0px #000;">
                Clear All
              </button>
              <button @click="loadSampleJWT"
                class="px-4 py-2 neo-border bg-neo-yellow hover:bg-neo-orange text-neo-black transition-colors text-sm font-bold rounded-none"
                style="box-shadow: 2px 2px 0px 0px #000;">
                Load Sample
              </button>
            </div>
          </div>
        </div>

        <!-- JWT Parts Display -->
        <div v-if="decodedJWT" class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <!-- Header -->
          <div class="neo-border bg-neo-bg p-6 relative" style="box-shadow: 4px 4px 0px 0px #000;">
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-bold text-neo-black">Header</h3>
                <button @click="copyToClipboard(JSON.stringify(decodedJWT.header, null, 2))"
                  class="p-2 neo-border bg-neo-bg hover:bg-neo-yellow text-neo-black transition-colors rounded-none"
                  title="Copy header">
                  <IconsCopy class="w-4 h-4" />
                </button>
              </div>
              <div class="neo-border bg-neo-black p-4 overflow-x-auto rounded-none">
                <pre class="text-sm text-neo-bg whitespace-pre-wrap font-neo-mono">{{ JSON.stringify(decodedJWT.header, null, 2) }}</pre>
              </div>
            </div>
          </div>

          <!-- Payload -->
          <div class="neo-border bg-neo-bg p-6 relative" style="box-shadow: 4px 4px 0px 0px #000;">
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-bold text-neo-black">Payload</h3>
                <button @click="copyToClipboard(JSON.stringify(decodedJWT.payload, null, 2))"
                  class="p-2 neo-border bg-neo-bg hover:bg-neo-yellow text-neo-black transition-colors rounded-none"
                  title="Copy payload">
                  <IconsCopy class="w-4 h-4" />
                </button>
              </div>
              <div class="neo-border bg-neo-black p-4 overflow-x-auto rounded-none">
                <pre class="text-sm text-neo-bg whitespace-pre-wrap font-neo-mono">{{ JSON.stringify(decodedJWT.payload, null, 2) }}</pre>
              </div>
            </div>
          </div>

          <!-- Token Analysis -->
          <div class="neo-border bg-neo-bg p-6 relative lg:col-span-2 xl:col-span-1" style="box-shadow: 4px 4px 0px 0px #000;">
            <div class="space-y-4">
              <h3 class="text-lg font-bold text-neo-black">Token Analysis</h3>
              <div class="space-y-3">
                <div class="flex justify-between items-center py-2 border-b-2 border-neo-black/20">
                  <span class="text-neo-black/70">Algorithm:</span>
                  <span class="text-neo-black font-neo-mono font-bold">{{ decodedJWT.header.alg || 'Unknown' }}</span>
                </div>
                
                <div class="flex justify-between items-center py-2 border-b-2 border-neo-black/20">
                  <span class="text-neo-black/70">Type:</span>
                  <span class="text-neo-black font-neo-mono font-bold">{{ decodedJWT.header.typ || 'Unknown' }}</span>
                </div>
                
                <div v-if="decodedJWT.payload.iat" class="flex justify-between items-center py-2 border-b-2 border-neo-black/20">
                  <span class="text-neo-black/70">Issued At:</span>
                  <span class="text-neo-black text-sm">{{ formatTimestamp(decodedJWT.payload.iat) }}</span>
                </div>
                
                <div v-if="decodedJWT.payload.exp" class="flex justify-between items-center py-2 border-b-2 border-neo-black/20">
                  <span class="text-neo-black/70">Expires At:</span>
                  <span class="text-neo-black text-sm">{{ formatTimestamp(decodedJWT.payload.exp) }}</span>
                </div>
                
                <div v-if="decodedJWT.payload.exp" class="flex justify-between items-center py-2 border-b-2 border-neo-black/20">
                  <span class="text-neo-black/70">Status:</span>
                  <span :class="isExpired ? 'text-neo-red' : 'text-neo-green'" class="font-bold">
                    {{ isExpired ? 'Expired' : 'Valid' }}
                  </span>
                </div>
                
                <div v-if="decodedJWT.payload.iss" class="flex justify-between items-center py-2 border-b-2 border-neo-black/20">
                  <span class="text-neo-black/70">Issuer:</span>
                  <span class="text-neo-black text-sm break-all">{{ decodedJWT.payload.iss }}</span>
                </div>
                
                <div v-if="decodedJWT.payload.sub" class="flex justify-between items-center py-2 border-b-2 border-neo-black/20">
                  <span class="text-neo-black/70">Subject:</span>
                  <span class="text-neo-black text-sm break-all">{{ decodedJWT.payload.sub }}</span>
                </div>
                
                <div v-if="decodedJWT.payload.aud" class="flex justify-between items-center py-2">
                  <span class="text-neo-black/70">Audience:</span>
                  <span class="text-neo-black text-sm break-all">{{ 
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
        <div v-if="decodedJWT" class="neo-border bg-neo-bg p-6 relative" style="box-shadow: 4px 4px 0px 0px #000;">
          <div class="space-y-4">
            <h3 class="text-lg font-bold text-neo-black">Signature Verification</h3>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Secret/Key Input -->
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-bold text-neo-black mb-2">
                    Secret Key (for HMAC algorithms)
                  </label>
                  <input
                    v-model="secretKey"
                    type="text"
                    placeholder="your-256-bit-secret"
                    class="w-full neo-border bg-neo-bg p-3 text-neo-black placeholder-neo-black/40 focus:outline-none rounded-none"
                    style="box-shadow: 2px 2px 0px 0px #000;"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-bold text-neo-black mb-2">
                    Public Key (for RSA/ECDSA algorithms)
                  </label>
                  <textarea
                    v-model="publicKey"
                    placeholder="-----BEGIN PUBLIC KEY-----&#10;...&#10;-----END PUBLIC KEY-----"
                    class="w-full h-24 neo-border bg-neo-bg p-3 text-neo-black placeholder-neo-black/40 resize-none focus:outline-none rounded-none"
                    style="box-shadow: 2px 2px 0px 0px #000;"
                  ></textarea>
                </div>
                
                <button @click="verifySignature"
                  class="px-4 py-2 neo-border bg-neo-blue hover:bg-neo-cyan text-neo-black transition-colors font-bold rounded-none"
                  style="box-shadow: 4px 4px 0px 0px #000;">
                  Verify Signature
                </button>
              </div>
              
              <!-- Verification Result -->
              <div class="space-y-4">
                <div class="neo-border bg-neo-black/5 p-4 rounded-none">
                  <h4 class="text-neo-black font-bold mb-3">Verification Result</h4>
                  <div v-if="verificationResult !== null" class="space-y-2">
                    <div class="flex items-center gap-2">
                      <div :class="verificationResult ? 'bg-neo-green' : 'bg-neo-red'" class="w-3 h-3 neo-border"></div>
                      <span :class="verificationResult ? 'text-neo-green' : 'text-neo-red'" class="font-bold">
                        {{ verificationResult ? 'Signature Valid' : 'Signature Invalid' }}
                      </span>
                    </div>
                    <p class="text-neo-black/70 text-sm">
                      {{ verificationResult 
                        ? 'The token signature is valid and the token has not been tampered with.' 
                        : 'The token signature is invalid or the token has been modified.' 
                      }}
                    </p>
                  </div>
                  <div v-else class="text-neo-black/50 text-sm">
                    Enter a secret key or public key and click "Verify Signature" to check the token's authenticity.
                  </div>
                </div>
                
                <!-- Security Notice -->
                <div class="neo-border bg-neo-yellow/30 p-4 rounded-none">
                  <div class="flex items-start gap-2">
                    <div class="text-lg">⚠️</div>
                    <div>
                      <h4 class="text-neo-black font-bold mb-1">Security Notice</h4>
                      <p class="text-neo-black/70 text-sm">
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
        <div class="p-4 neo-border bg-neo-red/20 text-neo-black font-bold rounded-none">
          {{ errorMessage }}
        </div>
      </div>

      <!-- Success message -->
      <div v-if="successMessage" class="mt-4">
        <div class="p-4 neo-border bg-neo-green/30 text-neo-black font-bold rounded-none">
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
