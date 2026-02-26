<template>
  <DaliCanvas @close="panelBack">
    <!-- ===================== DISCOVERY COLUMN ===================== -->
    <template #discovery>

      <!-- ==================== CHAT SECTION (above hero) ==================== -->
      <section
        v-if="chatHasMessages"
        id="chat"
        ref="chatSectionRef"
        class="chat-surface relative"
      >
        <ChatView
          ref="chatViewRef"
          :messages="(chatMessages as any)"
          :is-streaming="chatIsStreaming"
          @send="chatSendMessage"
          @retry="chatRetryLast"
          @clear="handleChatClear"
        />
      </section>

      <!-- Smooth color blend from chat surface to main page -->
      <div v-if="chatHasMessages" class="chat-hero-blend" aria-hidden="true" />

      <!-- ==================== HERO ==================== -->
      <IndexHeroSection
        ref="heroSectionRef"
        :chat-has-messages="chatHasMessages"
        :has-scrolled="hasScrolled"
        @send="handleHeroSend"
        @scroll-to-chat="scrollToChat"
      />

      <!-- ==================== BLOG POSTS ==================== -->
      <IndexPostsSection ref="postsSectionRef" />

      <!-- ==================== MY DIGITAL SPACE ==================== -->
      <IndexSpaceSection />

      <!-- ==================== TOOLS ==================== -->
      <IndexToolsSection />

      <!-- ==================== FOOTER ==================== -->
      <IndexFooterSection />
    </template>

    <!-- ===================== FOCUS COLUMN ===================== -->
    <template #focus>
      <IndexFocusContent
        :active-panel="activePanel"
        :panel-payload="panelPayload"
        :selected-gallery-image="null"
        :focus-panel-title="focusPanelTitle"
        @back="panelBack"
      />
    </template>
  </DaliCanvas>

  <!-- Mobile nav -->
  <IndexMobileNav
    @scroll-to="handleScrollTo"
    @expand-posts="expandAndScrollToPosts"
  />
</template>

<script setup lang="ts">
import ChatView from '~/components/chat/ChatView.vue'
import IndexHeroSection from '~/components/index/HeroSection.vue'
import IndexPostsSection from '~/components/index/PostsSection.vue'
import { siteConfig, getPageMeta } from '~/site.config'
import { useCanvasCamera } from '~/composables/useCanvasCamera'
import { useFocusPanel } from '~/composables/useFocusPanel'
import { useScrollSections } from '~/composables/useScrollSections'
import { refreshColorFlow } from '~/composables/useColorFlow'

// ==================== CAMERA ====================
const { isFocused } = useCanvasCamera()

// ==================== FOCUS PANEL ====================
const {
  activePanel,
  panelPayload,
  back: panelBack,
  close: panelClose,
  init: initFocusPanel,
  destroy: destroyFocusPanel,
} = useFocusPanel()

// ==================== CHATTY (shared state) ====================
const {
  messages: chatMessages,
  isStreaming: chatIsStreaming,
  sendMessage: chatSendMessage,
  retryLast: chatRetryLast,
  clearConversation: chatClearConversation,
} = useChatty()

// ==================== SCROLL SECTIONS ====================
const {
  scrollTo: scrollToSection,
  refresh: refreshSections,
  init: initScrollSections,
  destroy: destroyScrollSections,
} = useScrollSections()

// ==================== STATE ====================
const hasScrolled = ref(false)

// ==================== TEMPLATE REFS ====================
const chatSectionRef = ref<HTMLElement | null>(null)
const chatViewRef = ref<InstanceType<typeof ChatView> | null>(null)
const heroSectionRef = ref<InstanceType<typeof IndexHeroSection> | null>(null)
const postsSectionRef = ref<InstanceType<typeof IndexPostsSection> | null>(null)

// ==================== CHAT STATE ====================
const chatHasMessages = computed(() => chatMessages.value.length > 0)

// When the chat section appears / disappears, section positions shift.
// Rebuild the color-flow (so its palette includes/excludes #chat),
// refresh scroll sections, and set up chat entrance animation.
watch(chatHasMessages, async (hasMessages) => {
  await nextTick()
  await nextTick()
  if (!import.meta.client) return

  // Re-observe scroll sections
  refreshSections()

  // Rebuild color-flow triggers — the chat section is now in/out of the DOM,
  // so the palette needs to be rebuilt to include/exclude it.
  await refreshColorFlow()

  // Set up scroll-attached entrance for the chat section when it appears
  if (hasMessages) {
    setupChatScrollAnimation()
  }
})

/** Scroll-attached entrance animation for the chat section.
 *  Fades/slides in when scrolled into view; reverses when scrolled away. */
async function setupChatScrollAnimation() {
  const chatEl = chatSectionRef.value
  if (!chatEl || !import.meta.client) return

  const { gsap } = await import('gsap')
  const { ScrollTrigger } = await import('gsap/ScrollTrigger')
  gsap.registerPlugin(ScrollTrigger)

  // Animate the chat section content with a subtle entrance
  gsap.fromTo(chatEl,
    { opacity: 0.5, y: -30 },
    {
      opacity: 1, y: 0,
      duration: 0.6,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: chatEl,
        start: 'top 95%',
        toggleActions: 'play none none reverse',
      },
    },
  )
}

// ==================== FOCUS PANEL CONTENT ====================
const focusPanelTitle = computed(() => {
  return ''
})

// ==================== CHAT TRANSITIONS ====================

async function refreshScrollTrigger() {
  if (!import.meta.client) return
  try {
    const { ScrollTrigger } = await import('gsap/ScrollTrigger')
    ScrollTrigger.refresh()
  } catch { /* gsap may not be loaded yet */ }
  // Also rebuild color-flow so it covers the current DOM structure
  await refreshColorFlow()
}

async function handleHeroSend(message: string) {
  if (!import.meta.client) return

  // 1. Remember where the hero sits in the viewport BEFORE the chat section
  //    is inserted above it (which pushes everything down).
  const heroEl = heroSectionRef.value?.$el as HTMLElement | undefined
  const heroViewportTop = heroEl?.getBoundingClientRect().top ?? 0

  // 2. Send the message → chat section renders above hero via v-if
  chatSendMessage(message)

  // Wait for the chat section to render in the DOM
  await nextTick()
  await nextTick()

  // 3. Anchor scroll: the chat section was inserted above the hero, pushing it down.
  //    Snap scrollTop so the hero appears at the same viewport position it was before.
  if (heroEl) {
    const heroNewDocTop = heroEl.getBoundingClientRect().top + window.scrollY
    document.documentElement.scrollTop = heroNewDocTop - heroViewportTop
  }

  // Refresh ScrollTrigger + observers
  refreshScrollTrigger()

  // 4. Smooth scroll up to the chat section via Lenis
  scrollToSection('chat', { duration: 1.2 })
}

async function handleChatClear() {
  if (!import.meta.client) return

  const chatEl = chatSectionRef.value
  const { gsap } = await import('gsap')

  // 1. Fade out the chat section + blend strip over ~400ms for a graceful exit
  if (chatEl) {
    const blendEl = chatEl.nextElementSibling as HTMLElement | null
    if (blendEl?.classList.contains('chat-hero-blend')) {
      gsap.to(blendEl, { opacity: 0, duration: 0.3, ease: 'power2.in' })
    }

    await new Promise<void>((resolve) => {
      gsap.to(chatEl, {
        opacity: 0,
        y: -40,
        duration: 0.4,
        ease: 'power2.in',
        onComplete: resolve,
      })
    })
  }

  // 2. Remember the hero's position before DOM shift
  const heroEl = heroSectionRef.value?.$el as HTMLElement | undefined
  const heroDocTop = heroEl ? heroEl.getBoundingClientRect().top + window.scrollY : 0

  // 3. Clear conversation — the v-if removes chat section + blend from DOM,
  //    and the hero's v-if="!chatHasMessages" renders the prompt+input+chatty line.
  chatClearConversation()

  await nextTick()
  await nextTick()

  // 4. Immediately hide the newly-rendered chat area so it doesn't flash
  const chatAreaEl = heroSectionRef.value?.getChatAreaEl?.()
  if (chatAreaEl) {
    gsap.set(chatAreaEl, { opacity: 0 })
  }

  // 5. Anchor scroll: the chat section was removed, so the hero shifted up.
  //    Snap scrollTop so the hero stays at the same viewport position (no visual jump),
  //    then smoothly scroll to the top where the hero now lives.
  const heroNewDocTop = heroEl ? heroEl.getBoundingClientRect().top + window.scrollY : 0
  const shift = heroDocTop - heroNewDocTop
  document.documentElement.scrollTop = Math.max(0, window.scrollY - shift)

  // Refresh ScrollTrigger positions before smooth scroll
  await refreshScrollTrigger()

  // 6. Smooth scroll to the top (hero) via Lenis.
  //    Once scroll completes, reveal the chat area with a cohesive entrance.
  scrollToSection('main', {
    duration: 1.2,
    onComplete: () => {
      if (chatAreaEl) {
        gsap.to(chatAreaEl, {
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
        })
      }
    },
  })
}

// ==================== NAVIGATION HELPERS ====================

function scrollToChat() {
  scrollToSection('chat')
}

function handleScrollTo(id: string) {
  // Route through the composable for consistent Lenis-powered scrolling
  if (id === 'hero' || id === 'main') {
    scrollToSection('main')
  } else {
    scrollToSection(id as any)
  }
}

function expandAndScrollToPosts() {
  postsSectionRef.value?.showMore()
  postsSectionRef.value?.scrollToPosts()
}

// ==================== PANEL OPENERS ====================

async function closeAllPanels() {
  await panelClose()
}

// ==================== SCROLL TRACKING ====================

function onScroll() {
  hasScrolled.value = window.scrollY > 100
}

// ==================== LIFECYCLE ====================
const { initializeTracking, trackVisit } = useGoatCounter()

onMounted(async () => {
  initializeTracking()
  trackVisit('/')

  window.addEventListener('scroll', onScroll, { passive: true })

  // Initialize scroll sections (handles #chat, #posts, #space, #tools)
  initScrollSections()

  // Initialize focus panel (handles #about, #contact, #gallery)
  initFocusPanel()
})

onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener('scroll', onScroll)
  }
  destroyScrollSections()
  destroyFocusPanel()
})

// ==================== SEO ====================
useHead(getPageMeta({
  description: siteConfig.description,
  url: siteConfig.url,
  type: 'website',
}))
</script>

<style scoped>
/* ==================== Chat Surface (light background above hero) ==================== */

.chat-surface {
  background: #FEFBF2;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  --chat-bg: #FEFBF2;
  --chat-text: #1A1A1A;
  --chat-muted: #6B6B7B;
  --chat-border: rgba(0, 0, 0, 0.08);
  --chat-bubble-user: #FFF8E7;
  --chat-bubble-ai: #FFFFFF;
  --chat-accent: var(--color-dali-red);
  color: var(--chat-text);
}

/* Gradual blend from chat cream to the color-flow background.
   Uses var(--color-flow-bg) so it always matches whatever the
   color-flow palette is at this scroll position. */
.chat-hero-blend {
  height: 200px;
  background: linear-gradient(to bottom, #FEFBF2, var(--color-flow-bg, #F5E6B8));
  pointer-events: none;
  flex-shrink: 0;
}

</style>
