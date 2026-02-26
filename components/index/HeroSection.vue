<template>
  <section id="hero" class="relative min-h-screen flex items-center px-6 md:px-12 py-20 overflow-hidden">
    <!-- Decorative diagonal slash background -->
    <div class="absolute inset-0 dali-slash pointer-events-none" />

    <!-- Floating surrealist shapes -->
    <div class="hero-shapes absolute inset-0 pointer-events-none" aria-hidden="true">
      <div class="hero-shape hero-shape--circle" />
      <div class="hero-shape hero-shape--diamond" />
      <div class="hero-shape hero-shape--blob" />
    </div>

    <!-- Scroll-up indicator (top, mirrors bottom scroll indicator) -->
    <button
      v-if="chatHasMessages"
      class="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20 cursor-pointer group"
      @click="emit('scrollToChat')"
    >
      <svg class="w-5 h-5 text-dali-red animate-bounce-gentle-up" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
      <span class="text-[10px] font-mono flow-muted uppercase tracking-widest group-hover:text-dali-red transition-colors">Scroll up to see conversation</span>
    </button>

    <!-- Content: off-center (golden ratio ~38% from left) -->
    <div class="relative z-10 w-full max-w-6xl mx-auto">
      <div class="flex flex-col items-start" style="padding-left: 5%;">
        <!-- Avatar in melting-clock shape -->
        <div
          ref="avatarRef"
          class="hero-avatar mb-6 opacity-0"
        >
          <div class="hero-avatar__frame">
            <img
              v-show="!showFallback"
              :src="profile.image"
              :alt="profile.name"
              class="w-full h-full object-cover"
              @error="showFallback = true"
            >
            <span v-show="showFallback" class="text-4xl font-bold flow-text">
              {{ profile.initials }}
            </span>
          </div>
        </div>

        <!-- Name — dramatic tilt -->
        <h1
          ref="nameRef"
          class="hero-name opacity-0"
        >
          {{ profile.name }}
        </h1>

        <!-- Subtitle -->
        <p
          ref="subtitleRef"
          class="text-lg md:text-xl flow-muted max-w-xl mb-2 opacity-0"
        >
          {{ profile.subtitle }}
        </p>

        <!-- Motto — italic, with red accent underline -->
        <p
          ref="mottoRef"
          class="hero-motto opacity-0"
        >
          "{{ profile.motto }}"
          <span class="hero-motto__underline" />
        </p>

        <!-- Chat area — input visible only when no chat; scroll-up indicator when chat exists -->
        <div
          ref="chatRef"
          class="w-full max-w-xl mt-10 opacity-0"
        >
          <template v-if="!chatHasMessages">
            <!-- Welcome prompt + input -->
            <div class="hero-chat-prompt mb-5">
              <h3 class="text-lg md:text-xl font-bold mb-1" style="color: var(--color-flow-text, var(--color-dali-white));">
                Got questions? Let's talk.
              </h3>
              <p class="text-xs" style="color: var(--color-flow-muted, var(--color-dali-muted));">
                AI-powered, by what I know and think.
              </p>
            </div>

            <ChatInput ref="heroInputRef" @send="(msg: string) => emit('send', msg)" />

            <p class="text-[10px] mt-3 font-mono tracking-wide" style="color: var(--color-flow-muted, var(--color-dali-muted)); opacity: 0.35;">
              <a
                href="https://github.com/XyLearningProgramming/chatty"
                target="_blank"
                rel="noopener noreferrer"
                class="underline hover:opacity-70 transition-opacity"
              >chatty</a> · open source · 10-60 s response time
            </p>
          </template>
        </div>
      </div>
    </div>

    <!-- Scroll indicator -->
    <div
      ref="scrollIndicatorRef"
      class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0"
      :class="{ '!opacity-0': hasScrolled && !chatHasMessages }"
    >
      <span class="text-[10px] font-mono flow-muted uppercase tracking-widest">Scroll to my blog</span>
      <svg class="w-5 h-5 text-dali-red animate-bounce-gentle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    </div>
  </section>
</template>

<script setup lang="ts">
import ChatInput from '~/components/chat/ChatInput.vue'
import { siteConfig } from '~/site.config'

const props = defineProps<{
  chatHasMessages: boolean
  hasScrolled: boolean
}>()

const emit = defineEmits<{
  send: [message: string]
  scrollToChat: []
}>()

// ── Local state ──
const showFallback = ref(false)

const profile = {
  name: siteConfig.author.name,
  initials: siteConfig.author.name.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
  image: '/images/profile.png',
  motto: 'Code with passion, learn for life, run freely, and read deeply.',
  subtitle: siteConfig.author.bio,
}

// ── Template refs ──
const avatarRef = ref<HTMLElement | null>(null)
const nameRef = ref<HTMLElement | null>(null)
const subtitleRef = ref<HTMLElement | null>(null)
const mottoRef = ref<HTMLElement | null>(null)
const chatRef = ref<HTMLElement | null>(null)
const scrollIndicatorRef = ref<HTMLElement | null>(null)
const heroInputRef = ref<InstanceType<typeof ChatInput> | null>(null)

// ── Expose for parent ──
defineExpose({
  /** Return the ChatInput root DOM element (for parent animation) */
  getInputEl: () => heroInputRef.value?.$el as HTMLElement | undefined,
  /** Return the chat area wrapper element (for parent clear/reappear animation) */
  getChatAreaEl: () => chatRef.value as HTMLElement | undefined,
})

// ── GSAP entrance animations ──
onMounted(async () => {
  if (!import.meta.client) return
  await nextTick()

  const isMobile = window.innerWidth < 1024
  const { gsap } = await import('gsap')
  const scale = isMobile ? 0.4 : 1

  const heroTl = gsap.timeline({ delay: 0.3 })

  if (avatarRef.value) {
    heroTl.fromTo(avatarRef.value,
      { opacity: 0, x: -80 * scale, y: -40 * scale, rotation: isMobile ? 0 : -15, scale: 0.7 },
      { opacity: 1, x: 0, y: 0, rotation: 0, scale: 1, duration: 0.8, ease: 'back.out(1.7)' },
      0,
    )
  }

  if (nameRef.value) {
    heroTl.fromTo(nameRef.value,
      { opacity: 0, x: 120 * scale, skewX: isMobile ? 0 : -10 },
      { opacity: 1, x: 0, skewX: 0, duration: 0.7, ease: 'power3.out' },
      0.2,
    )
  }

  if (subtitleRef.value) {
    heroTl.fromTo(subtitleRef.value,
      { opacity: 0, y: 30 * scale },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
      0.4,
    )
  }

  if (mottoRef.value) {
    heroTl.fromTo(mottoRef.value,
      { opacity: 0, x: -60 * scale, rotation: isMobile ? 0 : -2 },
      { opacity: 1, x: 0, rotation: 0, duration: 0.6, ease: 'power2.out' },
      0.55,
    )
  }

  if (chatRef.value) {
    heroTl.fromTo(chatRef.value,
      { opacity: 0, y: 60 * scale, rotation: isMobile ? 0 : 2 },
      { opacity: 1, y: 0, rotation: 0, duration: 0.6, ease: 'back.out(1.4)' },
      0.7,
    )
  }

  if (scrollIndicatorRef.value) {
    heroTl.fromTo(scrollIndicatorRef.value,
      { opacity: 0 },
      { opacity: 1, duration: 0.8 },
      1.2,
    )
  }
})
</script>

<style scoped>
/* ==================== Hero Styles ==================== */

.hero-name {
  font-size: clamp(3rem, 8vw, 6rem);
  line-height: 1;
  font-weight: 700;
  color: var(--color-flow-text, var(--color-dali-white));
  transform: rotate(-2deg);
  margin-bottom: 0.5rem;
  position: relative;
}

.hero-name::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 60%;
  height: 3px;
  background: var(--color-dali-red);
  transform: skewX(-15deg);
}

.hero-motto {
  font-size: 1.25rem;
  font-style: italic;
  color: var(--color-flow-muted, var(--color-dali-muted));
  max-width: 36rem;
  margin-bottom: 0.5rem;
  position: relative;
}

.hero-motto__underline {
  position: absolute;
  bottom: -6px;
  left: 0;
  width: 80%;
  height: 2px;
  background: linear-gradient(90deg, var(--color-dali-gold), transparent);
}

/* Avatar with melting-clock-ish shape */
.hero-avatar__frame {
  width: 120px;
  height: 120px;
  border: 3px solid var(--color-dali-red);
  box-shadow: var(--shadow-dali-void);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-dali-smoke);
  border-radius: 60% 40% 50% 50% / 50% 60% 40% 50%;
}

/* Floating surrealist shapes */
.hero-shape {
  position: absolute;
  opacity: 0.08;
  animation: floatSurreal 12s ease-in-out infinite;
}

.hero-shape--circle {
  width: 200px;
  height: 200px;
  border: 2px solid var(--color-dali-red);
  border-radius: 50%;
  top: 10%;
  right: 15%;
  animation-delay: 0s;
}

.hero-shape--diamond {
  width: 100px;
  height: 100px;
  border: 2px solid var(--color-dali-gold);
  transform: rotate(45deg);
  bottom: 20%;
  right: 25%;
  animation-delay: 3s;
}

.hero-shape--blob {
  width: 150px;
  height: 150px;
  border: 2px solid var(--color-dali-teal);
  border-radius: 60% 40% 70% 30% / 40% 60% 30% 70%;
  top: 50%;
  left: 60%;
  animation-delay: 6s;
}

@keyframes floatSurreal {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-15px) rotate(3deg); }
  50% { transform: translateY(8px) rotate(-2deg); }
  75% { transform: translateY(-10px) rotate(1deg); }
}

/* Hero conversation-starter heading */
.hero-chat-prompt h3 {
  position: relative;
}
.hero-chat-prompt h3::after {
  content: '';
  position: absolute;
  bottom: -3px;
  left: 0;
  width: 50%;
  height: 2px;
  background: linear-gradient(90deg, var(--color-dali-red), transparent);
  border-radius: 1px;
}

/* ==================== Bounce animation ==================== */

@keyframes bounceGentle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(6px); }
}

.animate-bounce-gentle {
  animation: bounceGentle 2s ease-in-out infinite;
}

@keyframes bounceGentleUp {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.animate-bounce-gentle-up {
  animation: bounceGentleUp 2s ease-in-out infinite;
}
</style>
