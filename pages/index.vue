<template>
  <DaliCanvas @close="panelBack">
    <!-- ===================== DISCOVERY COLUMN ===================== -->
    <template #discovery>
      <!-- ==================== HERO / CHATTY ==================== -->
      <section id="hero" class="relative min-h-screen flex items-center px-6 md:px-12 py-20 overflow-hidden">
        <!-- Decorative diagonal slash background -->
        <div class="absolute inset-0 dali-slash pointer-events-none" />

        <!-- Floating surrealist shapes -->
        <div class="hero-shapes absolute inset-0 pointer-events-none" aria-hidden="true">
          <div class="hero-shape hero-shape--circle" />
          <div class="hero-shape hero-shape--diamond" />
          <div class="hero-shape hero-shape--blob" />
        </div>

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

            <!-- Chat input — rotated slightly, trapezoid-ish -->
            <div
              ref="chatRef"
              class="w-full max-w-2xl mt-10 opacity-0"
            >
              <!-- Powered by chatty note -->
              <div class="dali-card p-1 mb-4" style="border-color: var(--color-dali-muted);">
                <div class="p-3" style="background: rgba(46, 196, 182, 0.08);">
                  <p class="text-xs text-dali-muted">
                    Powered by
                    <a
                      href="https://github.com/XyLearningProgramming/chatty"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="underline font-bold text-dali-teal"
                    >chatty</a> &mdash; an open-source persona-driven chatbot.
                    <span class="text-[10px] block mt-0.5 opacity-70">Expect 10-60s response times. Responses may be inaccurate.</span>
                  </p>
                </div>
              </div>
              <ChatView @active-change="onChatActiveChange" />
            </div>
          </div>
        </div>

        <!-- Scroll indicator -->
        <div
          ref="scrollIndicatorRef"
          class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0"
          :class="{ '!opacity-0': hasScrolled }"
        >
          <span class="text-[10px] font-mono flow-muted uppercase tracking-widest">Scroll to explore</span>
          <svg class="w-5 h-5 text-dali-red animate-bounce-gentle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      <!-- ==================== BLOG POSTS ==================== -->
      <section id="posts" class="relative px-6 md:px-12 py-16 md:py-24 overflow-hidden">
        <div class="mx-auto max-w-6xl">
          <!-- Section heading — angled -->
          <h2
            ref="postsHeadingRef"
            class="posts-heading opacity-0 mb-12"
          >
            <span class="inline-block bg-dali-red px-5 py-2 text-dali-white border-2 border-dali-white/20 -rotate-2 shadow-dali">
              Latest Posts
            </span>
          </h2>

          <!-- Loading skeleton -->
          <div v-if="recentPosts.length === 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
            <div
              v-for="i in 3"
              :key="i"
              class="dali-card p-5 animate-pulse"
              :class="`dali-card--v${i}`"
            >
              <div class="h-3 w-20 bg-dali-muted/20 rounded mb-3" />
              <div class="h-5 w-3/4 bg-dali-muted/20 rounded mb-2" />
              <div class="h-4 w-full bg-dali-muted/20 rounded mb-1" />
              <div class="h-4 w-2/3 bg-dali-muted/20 rounded" />
            </div>
          </div>

          <!-- Post cards — scattered at angles, explode from center -->
          <div v-else class="posts-grid mb-10">
            <DaliIrregularCard
              v-for="(post, idx) in recentPosts"
              :key="post.path"
              :ref="el => setPostCardRef(el, idx)"
              :seed="idx * 7 + 3"
              :rotation="postRotations[idx] || 0"
              :accent-color="postColors[idx % postColors.length]"
              class="posts-card opacity-0 cursor-pointer"
              @click="openPost(post)"
            >
              <span class="text-[10px] font-bold text-dali-muted block mb-2">
                {{ formatDate(post.date) }}
              </span>
              <h3 class="text-lg font-bold mb-2 leading-tight text-dali-white">{{ post.title }}</h3>
              <p class="text-sm text-dali-muted flex-1">{{ post.description }}</p>
              <div v-if="post.tags?.length" class="mt-3 flex flex-wrap gap-1">
                <span
                  v-for="tag in post.tags.slice(0, 3)"
                  :key="tag"
                  class="text-[10px] font-bold px-2 py-0.5 border border-dali-gold/40 text-dali-gold"
                >
                  {{ tag }}
                </span>
              </div>
              <span class="mt-3 text-xs font-bold text-dali-teal flex items-center gap-1">
                Read more
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </DaliIrregularCard>

            <!-- "View All" card — expands to show full archive inline -->
            <DaliIrregularCard
              v-if="!showAllPosts"
              ref="viewAllCardRef"
              :seed="99"
              :rotation="1"
              accent-color="var(--color-dali-gold)"
              class="posts-card opacity-0 cursor-pointer flex items-center justify-center text-center"
              tag="div"
              @click="expandAllPosts"
            >
              <div class="py-4">
                <span class="text-3xl mb-3 block">📚</span>
                <span class="text-sm font-bold text-dali-white block">View All Posts</span>
                <span class="text-xs text-dali-muted mt-1 block">Browse the full archive &rarr;</span>
              </div>
            </DaliIrregularCard>
          </div>

          <!-- ── Expanded: full archive inline ── -->
          <div v-if="showAllPosts" class="mt-8">
            <!-- Search bar -->
            <div class="mb-6 max-w-md">
              <div class="relative">
                <input
                  v-model="blogSearchQuery"
                  type="text"
                  placeholder="Search posts..."
                  class="w-full px-4 py-2.5 pl-10 text-sm bg-dali-white/10 border-2 border-dali-white/20 text-dali-white placeholder-dali-white/40 focus:outline-none focus:border-dali-gold"
                />
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dali-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" stroke-width="2" />
                  <path stroke-linecap="round" stroke-width="2" d="m21 21-4.35-4.35" />
                </svg>
                <button
                  v-if="blogSearchQuery.trim()"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-dali-white/40 hover:text-dali-white"
                  @click="blogSearchQuery = ''"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Loading -->
            <div v-if="allPostsLoading" class="flex items-center justify-center py-12">
              <div class="w-8 h-8 border-4 border-dali-red border-t-dali-gold rounded-full animate-spin" />
            </div>

            <!-- All post cards in grid -->
            <div v-else class="posts-grid">
              <DaliIrregularCard
                v-for="(post, idx) in filteredBlogPosts"
                :key="post.path"
                :seed="idx * 5 + 11"
                :rotation="((idx % 5) - 2) * 1.2"
                :accent-color="postColors[idx % postColors.length]"
                class="cursor-pointer"
                @click="openPost(post)"
              >
                <span class="text-[10px] font-bold text-dali-muted block mb-2">
                  {{ formatDate(post.date) }}
                </span>
                <h3 class="text-lg font-bold mb-2 leading-tight text-dali-white">{{ post.title }}</h3>
                <p class="text-sm text-dali-muted flex-1">{{ post.description }}</p>
                <div v-if="post.tags?.length" class="mt-3 flex flex-wrap gap-1">
                  <span
                    v-for="tag in post.tags.slice(0, 3)"
                    :key="tag"
                    class="text-[10px] font-bold px-2 py-0.5 border border-dali-gold/40 text-dali-gold"
                  >
                    {{ tag }}
                  </span>
                </div>
                <span class="mt-3 text-xs font-bold text-dali-teal flex items-center gap-1">
                  Read more
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </DaliIrregularCard>
            </div>

            <!-- No results -->
            <div v-if="!allPostsLoading && filteredBlogPosts.length === 0 && blogSearchQuery.trim()" class="text-center py-8">
              <p class="text-lg text-dali-white mb-1">No posts found</p>
              <p class="text-sm text-dali-muted">Try adjusting your search terms</p>
            </div>

            <!-- Collapse button -->
            <div class="text-center mt-8 mb-4">
              <button
                class="dali-btn bg-dali-void/50 text-dali-white border-dali-white/30 px-5 py-2 text-sm font-bold"
                @click="showAllPosts = false; blogSearchQuery = ''"
              >
                Show Less
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- ==================== MY DIGITAL SPACE ==================== -->
      <section id="space" class="relative px-6 md:px-12 py-16 md:py-24 overflow-hidden">
        <div class="mx-auto max-w-6xl">
          <!-- Section heading -->
          <h2
            ref="spaceHeadingRef"
            class="space-heading opacity-0 mb-12"
          >
            <span class="inline-block bg-dali-violet px-5 py-2 text-dali-white border-2 border-dali-white/20 rotate-1 shadow-dali">
              My Digital Space
            </span>
          </h2>

          <!-- Photo Gallery — collage style -->
          <div
            ref="galleryRef"
            class="mb-12 opacity-0"
          >
            <h3 class="text-lg font-bold mb-4 text-dali-gold">Gallery</h3>
            <NeoPhotoGallery @open-lightbox="openGallery" />
          </div>

          <!-- About & Contact cards — scattered -->
          <div class="space-cards grid grid-cols-1 md:grid-cols-2 gap-8">
            <DaliIrregularCard
              ref="aboutCardRef"
              :seed="200"
              :rotation="-2"
              accent-color="var(--color-dali-teal)"
              class="space-card opacity-0 cursor-pointer"
              @click="openAbout"
            >
              <h3 class="text-lg font-bold mb-2 text-dali-white">About Me</h3>
              <p class="text-sm text-dali-muted">
                {{ siteConfig.author.bio }}. Learn more about my background, what I do, and what drives me.
              </p>
              <span class="mt-3 text-xs font-bold text-dali-teal flex items-center gap-1">
                Read more
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </DaliIrregularCard>

            <DaliIrregularCard
              ref="contactCardRef"
              :seed="201"
              :rotation="2.5"
              accent-color="var(--color-dali-gold)"
              class="space-card opacity-0 cursor-pointer"
              @click="openContact"
            >
              <h3 class="text-lg font-bold mb-2 text-dali-white">Contact</h3>
              <p class="text-sm text-dali-muted">
                Get in touch via email, GitHub, or LinkedIn. Always happy to chat.
              </p>
              <span class="mt-3 text-xs font-bold text-dali-gold flex items-center gap-1">
                Get in touch
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </DaliIrregularCard>
          </div>
        </div>
      </section>

      <!-- ==================== TOOLS ==================== -->
      <section id="tools" class="relative px-6 md:px-12 py-16 md:py-24 overflow-hidden">
        <div class="mx-auto max-w-6xl">
          <!-- Section heading -->
          <h2
            ref="toolsHeadingRef"
            class="tools-heading opacity-0 mb-12"
          >
            <span class="inline-block bg-dali-gold px-5 py-2 text-dali-void border-2 border-dali-void/20 -rotate-1 shadow-dali-void">
              Dev Tools
            </span>
          </h2>

          <!-- Tool cards — float in sideways during vertical scroll -->
          <div class="tools-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-6">
            <DaliIrregularCard
              v-for="(tool, idx) in tools"
              :key="tool.title"
              :ref="el => setToolCardRef(el, idx)"
              :seed="300 + idx"
              :rotation="toolRotations[idx] || 0"
              :accent-color="tool.color"
              class="tool-card opacity-0 cursor-pointer"
              @click="navigateTo(tool.route)"
            >
              <span class="text-2xl block mb-2">{{ tool.icon }}</span>
              <h3 class="text-base font-bold mb-1 text-dali-white">{{ tool.title }}</h3>
              <p class="text-sm text-dali-muted">{{ tool.description }}</p>
            </DaliIrregularCard>
          </div>

          <div
            ref="allToolsRef"
            class="text-center opacity-0"
          >
            <NuxtLink
              to="/tools"
              class="dali-btn inline-block px-6 py-3 text-sm"
            >
              All Tools &rarr;
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- ==================== FOOTER ==================== -->
      <section id="footer" class="relative px-6 md:px-12 py-12">
        <!-- Red diagonal slash accent -->
        <div class="absolute top-0 right-0 w-1/3 h-full overflow-hidden pointer-events-none" aria-hidden="true">
          <div class="absolute inset-0 bg-dali-red/5 -skew-x-12 origin-top-right" />
        </div>

        <div
          ref="footerRef"
          class="mx-auto max-w-6xl text-center relative z-10 opacity-0"
        >
          <h2 class="flow-text mb-4">
            <span class="text-lg font-bold">{{ siteConfig.name }}</span>
          </h2>
          <div class="flex justify-center gap-4 mb-6">
            <a
              v-if="siteConfig.social.github"
              :href="siteConfig.social.github"
              target="_blank"
              rel="noopener noreferrer"
              class="dali-btn px-4 py-2 text-sm"
            >
              GitHub
            </a>
            <a
              v-if="siteConfig.social.linkedin"
              :href="siteConfig.social.linkedin"
              target="_blank"
              rel="noopener noreferrer"
              class="dali-btn px-4 py-2 text-sm"
            >
              LinkedIn
            </a>
            <a
              v-if="siteConfig.social.email"
              :href="`mailto:${siteConfig.social.email}`"
              class="dali-btn px-4 py-2 text-sm"
            >
              Email
            </a>
          </div>
          <p class="text-sm flow-muted">
            Built with Nuxt, Vue, and Nuxt Content.
          </p>
          <p class="text-xs flow-muted opacity-60 mt-1">
            &copy; {{ new Date().getFullYear() }} {{ siteConfig.author.name }}
          </p>
        </div>
      </section>
    </template>

    <!-- ===================== FOCUS COLUMN ===================== -->
    <template #focus>
      <div class="min-h-screen dali-focus-surface">
        <!-- Back button bar -->
        <div class="sticky top-0 z-20 flex items-center justify-between px-6 py-4 backdrop-blur-sm" style="background: rgba(0,0,0,0.15);">
          <button
            class="dali-btn bg-transparent text-dali-white border-dali-white/40 px-3 py-1.5 text-sm font-bold flex items-center gap-2"
            @click="panelBack"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <span class="text-sm font-bold text-dali-white/60 truncate max-w-[60%]">
            {{ focusPanelTitle }}
          </span>
          <button
            class="text-xs font-bold text-dali-white/60 hover:text-dali-white px-2 py-1"
            @click="closeAllPanels"
          >
            ESC
          </button>
        </div>

        <!-- Focus content -->
        <div class="px-6 md:px-12 py-8 max-w-4xl mx-auto">
          <!-- ===== Post Detail ===== -->
          <template v-if="activePanel === 'post' && panelPayload">
            <article>
              <header class="mb-8">
                <h1 class="text-dali-white mb-3">{{ panelPayload.title }}</h1>
                <div class="flex flex-wrap items-center gap-3 text-sm text-dali-white/60 mb-4">
                  <span class="font-bold">{{ formatDate(panelPayload.date) }}</span>
                  <span v-if="panelPayload.tags?.length" class="flex flex-wrap gap-1">
                    <span
                      v-for="tag in panelPayload.tags"
                      :key="tag"
                      class="text-[10px] font-bold px-2 py-0.5 bg-dali-white/10 border border-dali-white/30 text-dali-white"
                    >
                      {{ tag }}
                    </span>
                  </span>
                </div>
              </header>
              <div v-if="activePostContent" class="blog-content">
                <ContentRenderer :value="activePostContent" />
              </div>
              <div v-else class="flex items-center justify-center py-12">
                <div class="w-8 h-8 border-4 border-dali-red border-t-dali-gold rounded-full animate-spin" />
              </div>
            </article>
          </template>

          <!-- ===== About ===== -->
          <template v-else-if="activePanel === 'about'">
            <div v-if="aboutContent" class="blog-content">
              <ContentRenderer :value="aboutContent" />
            </div>
            <div v-else class="flex items-center justify-center py-12">
              <div class="w-8 h-8 border-4 border-dali-red border-t-dali-gold rounded-full animate-spin" />
            </div>
          </template>

          <!-- ===== Contact ===== -->
          <template v-else-if="activePanel === 'contact'">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <a :href="`mailto:${siteConfig.social.email}`" class="block p-5 border-2 border-dali-white/20 bg-dali-white/5 text-center hover:border-dali-red transition-colors">
                <div class="text-4xl mb-3">📧</div>
                <h3 class="text-lg font-bold mb-1 text-dali-white">Email</h3>
                <p class="text-sm text-dali-white/60">{{ siteConfig.social.email }}</p>
              </a>
              <a :href="siteConfig.social.github" target="_blank" rel="noopener noreferrer" class="block p-5 border-2 border-dali-white/20 bg-dali-white/5 text-center hover:border-dali-red transition-colors">
                <div class="text-4xl mb-3">💻</div>
                <h3 class="text-lg font-bold mb-1 text-dali-white">GitHub</h3>
                <p class="text-sm text-dali-white/60">{{ siteConfig.social.github?.split('/').pop() }}</p>
              </a>
              <a :href="siteConfig.social.linkedin" target="_blank" rel="noopener noreferrer" class="block p-5 border-2 border-dali-white/20 bg-dali-white/5 text-center hover:border-dali-red transition-colors">
                <div class="text-4xl mb-3">💼</div>
                <h3 class="text-lg font-bold mb-1 text-dali-white">LinkedIn</h3>
                <p class="text-sm text-dali-white/60">{{ siteConfig.social.linkedin?.split('/').slice(-2).join('/') }}</p>
              </a>
              <a href="/resume/20260111.pdf" target="_blank" rel="noopener noreferrer" class="block p-5 border-2 border-dali-white/20 bg-dali-white/5 text-center hover:border-dali-red transition-colors">
                <div class="text-4xl mb-3">📄</div>
                <h3 class="text-lg font-bold mb-1 text-dali-white">Resume</h3>
                <p class="text-sm text-dali-white/60">Download CV</p>
              </a>
            </div>
          </template>

          <!-- ===== Gallery ===== -->
          <template v-else-if="activePanel === 'gallery' && selectedGalleryImage">
            <div class="flex flex-col items-center">
              <div class="overflow-hidden mb-4 max-w-3xl w-full border-2 border-dali-white/20">
                <NuxtImg
                  :src="selectedGalleryImage.url"
                  :alt="selectedGalleryImage.alt || selectedGalleryImage.title || 'Photo'"
                  class="w-full object-contain max-h-[70vh]"
                />
              </div>
              <div v-if="selectedGalleryImage.title || selectedGalleryImage.note" class="text-center max-w-xl">
                <p v-if="selectedGalleryImage.title" class="font-bold text-lg mb-1 text-dali-white">{{ selectedGalleryImage.title }}</p>
                <p v-if="selectedGalleryImage.note" class="text-sm text-dali-white/60 italic">{{ selectedGalleryImage.note }}</p>
              </div>
            </div>
          </template>
        </div>
      </div>
    </template>
  </DaliCanvas>

  <!-- Mobile nav -->
  <button
    class="lg:hidden fixed bottom-6 right-6 z-50 dali-btn bg-dali-red text-dali-white p-3 rounded-full"
    aria-label="Open navigation"
    @click="toggleMobileNav"
  >
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  </button>

  <!-- Mobile nav overlay -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="mobileNavOpen"
        class="lg:hidden fixed inset-0 z-50 bg-black/70"
        @click.self="mobileNavOpen = false"
      >
        <div class="absolute bottom-0 left-0 right-0 bg-dali-smoke border-t-2 border-dali-red p-6">
          <div class="flex justify-between items-center mb-4">
            <p class="text-xs font-bold uppercase tracking-widest text-dali-muted font-mono">Navigate</p>
            <button class="dali-btn px-2 py-1 text-xs" @click="mobileNavOpen = false">
              Close
            </button>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <button
              v-for="section in [
                { id: 'hero', label: 'Home' },
                { id: 'posts', label: 'Posts' },
                { id: 'space', label: 'Space' },
                { id: 'tools', label: 'Tools' },
              ]"
              :key="section.id"
              class="dali-btn px-4 py-3 text-sm text-left"
              @click="scrollToSection(section.id)"
            >
              {{ section.label }}
            </button>
            <button
              class="dali-btn px-4 py-3 text-sm text-left"
              @click="mobileNavOpen = false; expandAllPosts(); scrollToPosts()"
            >
              All Posts
            </button>
            <NuxtLink
              to="/tools"
              class="dali-btn px-4 py-3 text-sm text-left"
              @click="mobileNavOpen = false"
            >
              All Tools
            </NuxtLink>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>


</template>

<script setup lang="ts">
import ChatView from '~/components/chat/ChatView.vue'
import { siteConfig, getPageMeta } from '~/site.config'
import { useCanvasCamera } from '~/composables/useCanvasCamera'
import { useFocusPanel } from '~/composables/useFocusPanel'
import type { GalleryImage } from '~/composables/useBackgroundGallery'

// ==================== CAMERA ====================
const { isFocused } = useCanvasCamera()

// ==================== FOCUS PANEL ====================
const {
  activePanel,
  panelPayload,
  open: openPanel,
  back: panelBack,
  close: panelClose,
  init: initFocusPanel,
  destroy: destroyFocusPanel,
} = useFocusPanel()

// ==================== STATE ====================
const showFallback = ref(false)
const mobileNavOpen = ref(false)
const chatActive = ref(false)
const hasScrolled = ref(false)
const isMobile = ref(false)
const showAllPosts = ref(false)

// ==================== PROFILE ====================
const profile = {
  name: siteConfig.author.name,
  initials: siteConfig.author.name.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
  image: '/images/profile.png',
  motto: 'Code with passion, learn for life, run freely, and read deeply.',
  subtitle: siteConfig.author.bio,
}

// ==================== TOOLS ====================
const tools = [
  { title: 'Base64', icon: '🔐', description: 'Encode & decode Base64 strings', route: '/tools/base64', color: 'var(--color-dali-red)' },
  { title: 'JSON', icon: '📋', description: 'Format & validate JSON', route: '/tools/json', color: 'var(--color-dali-teal)' },
  { title: 'JWT', icon: '🔑', description: 'Decode JWT tokens', route: '/tools/jwt', color: 'var(--color-dali-gold)' },
]

const toolRotations = [-2, 1.5, -1]

// ==================== BLOG POSTS ====================
interface BlogPost {
  path: string
  title: string
  description: string
  date: string
  tags?: string[]
}

const { data: rawPosts } = await useAsyncData('recent-posts', () =>
  queryCollection('blogs')
    .where('published', '=', true)
    .order('date', 'DESC')
    .limit(6)
    .all(),
)

const recentPosts = computed<BlogPost[]>(() => {
  if (!rawPosts.value) return []
  return rawPosts.value.map((post: any) => ({
    path: post.path,
    title: post.title || 'Untitled',
    description: post.description || '',
    date: post.date || '',
    tags: post.tags || [],
  }))
})

const postRotations = [-3, 2, -1.5, 2.5, -2, 1]
const postColors = [
  'var(--color-dali-red)',
  'var(--color-dali-teal)',
  'var(--color-dali-gold)',
  'var(--color-dali-violet)',
  'var(--color-dali-red)',
  'var(--color-dali-teal)',
]

// Active post content (loaded on demand when a post panel opens)
const activePostContent = ref<any>(null)

// ==================== ALL BLOG POSTS (for blogs listing panel) ====================
const allPosts = ref<any[]>([])
const allPostsLoaded = ref(false)
const allPostsLoading = ref(false)
const blogSearchQuery = ref('')

async function loadAllPosts() {
  if (allPostsLoaded.value || allPostsLoading.value) return
  allPostsLoading.value = true
  try {
    const query = queryCollection('blogs')
    if (!import.meta.dev) query.where('published', '=', true)
    const result = await query
      .select('title', 'date', 'description', 'tags', 'image', 'path')
      .order('date', 'DESC')
      .all()
    allPosts.value = result || []
    allPostsLoaded.value = true
  } catch (e) {
    console.warn('Failed to load all posts:', e)
  } finally {
    allPostsLoading.value = false
  }
}

const filteredBlogPosts = computed(() => {
  if (!blogSearchQuery.value.trim()) return allPosts.value
  const q = blogSearchQuery.value.toLowerCase().trim()
  return allPosts.value.filter((post: any) =>
    post.title?.toLowerCase().includes(q)
    || post.description?.toLowerCase().includes(q)
    || post.tags?.some((tag: string) => tag.toLowerCase().includes(q)),
  )
})

// ==================== ABOUT CONTENT ====================
const aboutContent = ref<any>(null)

// ==================== GALLERY IMAGE (for gallery panel) ====================
const selectedGalleryImage = ref<GalleryImage | null>(null)

// ==================== FOCUS PANEL TITLE ====================
const focusPanelTitle = computed(() => {
  if (activePanel.value === 'post' && panelPayload.value) return panelPayload.value.title || 'Post'
  if (activePanel.value === 'about') return 'About Me'
  if (activePanel.value === 'contact') return 'Get In Touch'
  if (activePanel.value === 'gallery') return selectedGalleryImage.value?.title || 'Gallery'
  return ''
})

// ==================== TEMPLATE REFS ====================
const avatarRef = ref<HTMLElement | null>(null)
const nameRef = ref<HTMLElement | null>(null)
const subtitleRef = ref<HTMLElement | null>(null)
const mottoRef = ref<HTMLElement | null>(null)
const chatRef = ref<HTMLElement | null>(null)
const scrollIndicatorRef = ref<HTMLElement | null>(null)
const postsHeadingRef = ref<HTMLElement | null>(null)
const spaceHeadingRef = ref<HTMLElement | null>(null)
const galleryRef = ref<HTMLElement | null>(null)
const aboutCardRef = ref<any>(null)
const contactCardRef = ref<any>(null)
const toolsHeadingRef = ref<HTMLElement | null>(null)
const allToolsRef = ref<HTMLElement | null>(null)
const footerRef = ref<HTMLElement | null>(null)
const viewAllCardRef = ref<any>(null)

// Dynamic refs for post/tool cards
const postCardRefs = ref<(any)[]>([])
const toolCardRefs = ref<(any)[]>([])

function setPostCardRef(el: any, idx: number) {
  if (el) postCardRefs.value[idx] = el
}
function setToolCardRef(el: any, idx: number) {
  if (el) toolCardRefs.value[idx] = el
}

// ==================== METHODS ====================
function onChatActiveChange(active: boolean) {
  chatActive.value = active
}

function toggleMobileNav() {
  mobileNavOpen.value = !mobileNavOpen.value
}

function scrollToSection(id: string) {
  mobileNavOpen.value = false
  nextTick(() => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// --- Panel openers (all go through useFocusPanel) ---
async function closeAllPanels() {
  selectedGalleryImage.value = null
  blogSearchQuery.value = ''
  activePostContent.value = null
  await panelClose()
}

async function openPost(post: BlogPost) {
  // Clear any previous content
  activePostContent.value = null

  // Open focus panel — this saves discovery scroll, pans right, updates hash
  openPanel('post', post)

  // Load full content
  try {
    const data = await queryCollection('blogs').path(post.path).first()
    activePostContent.value = data
  } catch (e) {
    console.warn('Failed to load post content:', e)
  }
}

async function expandAllPosts() {
  blogSearchQuery.value = ''
  showAllPosts.value = true
  await loadAllPosts()
}

function scrollToPosts() {
  nextTick(() => {
    document.getElementById('posts')?.scrollIntoView({ behavior: 'smooth' })
  })
}


async function openAbout() {
  await openPanel('about', null, 'about')
  if (!aboutContent.value) {
    try {
      const allPages = await queryCollection('pages').all()
      aboutContent.value = allPages.find((page: any) => page.path === '/pages/about')
    } catch (e) {
      console.warn('Failed to load about content:', e)
    }
  }
}

async function openContact() {
  await openPanel('contact', null, 'contact')
}

async function openGallery(image: GalleryImage) {
  selectedGalleryImage.value = image
  await openPanel('gallery', image, 'gallery')
}

/** Resolve a post path to a BlogPost object (used by useFocusPanel for deep links) */
async function resolvePost(path: string): Promise<BlogPost | null> {
  try {
    const data = await queryCollection('blogs').path(path).first()
    if (data) {
      return {
        path: data.path,
        title: (data as any).title || 'Untitled',
        description: (data as any).description || '',
        date: (data as any).date || '',
        tags: (data as any).tags || [],
      }
    }
  } catch (e) {
    console.warn('Failed to resolve post:', path, e)
  }
  return null
}

function onScroll() {
  hasScrolled.value = window.scrollY > 100
}

// Watch activePanel to load content when panel changes (e.g. from deep link)
watch(activePanel, async (panel) => {
  if (panel === 'post' && panelPayload.value) {
    // Load post content when a post panel opens
    activePostContent.value = null
    try {
      const data = await queryCollection('blogs').path(panelPayload.value.path).first()
      activePostContent.value = data
    } catch (e) {
      console.warn('Failed to load post content:', e)
    }
  }
  if (panel === 'about' && !aboutContent.value) {
    try {
      const allPages = await queryCollection('pages').all()
      aboutContent.value = allPages.find((page: any) => page.path === '/pages/about')
    } catch (e) {
      console.warn('Failed to load about content:', e)
    }
  }
  if (!panel) {
    // Returning to discovery — clear post content
    activePostContent.value = null
  }
})

// ==================== GSAP SCROLL ANIMATIONS ====================
async function initScrollAnimations() {
  const { gsap } = await import('gsap')
  const { ScrollTrigger } = await import('gsap/ScrollTrigger')
  gsap.registerPlugin(ScrollTrigger)

  // On mobile, use simpler/smaller animations for performance
  const mobile = isMobile.value
  const scale = mobile ? 0.4 : 1 // Scale down travel distances on mobile

  // --- Hero entrance: staggered slash-in from different directions ---
  const heroTl = gsap.timeline({ delay: 0.3 })

  if (avatarRef.value) {
    heroTl.fromTo(avatarRef.value,
      { opacity: 0, x: -80 * scale, y: -40 * scale, rotation: mobile ? 0 : -15, scale: 0.7 },
      { opacity: 1, x: 0, y: 0, rotation: 0, scale: 1, duration: 0.8, ease: 'back.out(1.7)' },
      0
    )
  }

  if (nameRef.value) {
    heroTl.fromTo(nameRef.value,
      { opacity: 0, x: 120 * scale, skewX: mobile ? 0 : -10 },
      { opacity: 1, x: 0, skewX: 0, duration: 0.7, ease: 'power3.out' },
      0.2
    )
  }

  if (subtitleRef.value) {
    heroTl.fromTo(subtitleRef.value,
      { opacity: 0, y: 30 * scale },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
      0.4
    )
  }

  if (mottoRef.value) {
    heroTl.fromTo(mottoRef.value,
      { opacity: 0, x: -60 * scale, rotation: mobile ? 0 : -2 },
      { opacity: 1, x: 0, rotation: 0, duration: 0.6, ease: 'power2.out' },
      0.55
    )
  }

  if (chatRef.value) {
    heroTl.fromTo(chatRef.value,
      { opacity: 0, y: 60 * scale, rotation: mobile ? 0 : 2 },
      { opacity: 1, y: 0, rotation: 0, duration: 0.6, ease: 'back.out(1.4)' },
      0.7
    )
  }

  if (scrollIndicatorRef.value) {
    heroTl.fromTo(scrollIndicatorRef.value,
      { opacity: 0 },
      { opacity: 1, duration: 0.8 },
      1.2
    )
  }

  // Shared toggleActions: play on enter, reverse on leave-back
  const ta = 'play none none reverse'

  // --- Blog Posts: explode outward from center ---
  if (postsHeadingRef.value) {
    gsap.fromTo(postsHeadingRef.value,
      { opacity: 0, x: -100 * scale, rotation: mobile ? 0 : -5 },
      {
        opacity: 1, x: 0, rotation: 0,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: postsHeadingRef.value,
          start: 'top 85%',
          toggleActions: ta,
        },
      }
    )
  }

  // Post cards: explode from center with rotation (simpler on mobile)
  nextTick(() => {
    postCardRefs.value.forEach((cardRef, idx) => {
      const el = cardRef?.$el || cardRef
      if (!el) return

      if (mobile) {
        gsap.fromTo(el,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0,
            duration: 0.5,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '#posts',
              start: 'top 70%',
              toggleActions: ta,
            },
            delay: idx * 0.08,
          }
        )
      } else {
        const angle = (idx / Math.max(postCardRefs.value.length, 1)) * Math.PI * 2 + Math.PI / 4
        const startX = Math.cos(angle) * 200
        const startY = Math.sin(angle) * 150
        const startRotation = (Math.random() - 0.5) * 30

        gsap.fromTo(el,
          { opacity: 0, x: -startX, y: -startY, rotation: startRotation, scale: 0.3 },
          {
            opacity: 1, x: 0, y: 0, rotation: 0, scale: 1,
            duration: 0.8,
            ease: 'back.out(1.2)',
            scrollTrigger: {
              trigger: '#posts',
              start: 'top 70%',
              toggleActions: ta,
            },
            delay: idx * 0.1,
          }
        )
      }
    })

    // View All card
    const viewAllEl = viewAllCardRef.value?.$el || viewAllCardRef.value
    if (viewAllEl) {
      gsap.fromTo(viewAllEl,
        { opacity: 0, scale: 0.5, rotation: 10 },
        {
          opacity: 1, scale: 1, rotation: 0,
          duration: 0.6,
          ease: 'back.out(1.4)',
          scrollTrigger: {
            trigger: '#posts',
            start: 'top 60%',
            toggleActions: ta,
          },
          delay: 0.7,
        }
      )
    }
  })

  // --- Digital Space section ---
  if (spaceHeadingRef.value) {
    gsap.fromTo(spaceHeadingRef.value,
      { opacity: 0, x: 100 * scale, rotation: mobile ? 0 : 3 },
      {
        opacity: 1, x: 0, rotation: 0,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: spaceHeadingRef.value,
          start: 'top 85%',
          toggleActions: ta,
        },
      }
    )
  }

  if (galleryRef.value) {
    gsap.fromTo(galleryRef.value,
      { opacity: 0, x: mobile ? 40 : 120 },
      {
        opacity: 1, x: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: galleryRef.value,
          start: 'top 80%',
          toggleActions: ta,
        },
      }
    )
  }

  // About and Contact cards: fly in from opposite sides
  nextTick(() => {
    const aboutEl = aboutCardRef.value?.$el || aboutCardRef.value
    if (aboutEl) {
      gsap.fromTo(aboutEl,
        { opacity: 0, x: mobile ? -40 : -120, rotation: mobile ? 0 : -5 },
        {
          opacity: 1, x: 0, rotation: 0,
          duration: 0.7,
          ease: 'back.out(1.2)',
          scrollTrigger: {
            trigger: aboutEl,
            start: 'top 85%',
            toggleActions: ta,
          },
        }
      )
    }

    const contactEl = contactCardRef.value?.$el || contactCardRef.value
    if (contactEl) {
      gsap.fromTo(contactEl,
        { opacity: 0, x: mobile ? 40 : 120, rotation: mobile ? 0 : 5 },
        {
          opacity: 1, x: 0, rotation: 0,
          duration: 0.7,
          ease: 'back.out(1.2)',
          scrollTrigger: {
            trigger: contactEl,
            start: 'top 85%',
            toggleActions: ta,
          },
          delay: 0.15,
        }
      )
    }
  })

  // --- Tools: float in SIDEWAYS ---
  if (toolsHeadingRef.value) {
    gsap.fromTo(toolsHeadingRef.value,
      { opacity: 0, x: -80 * scale, rotation: mobile ? 0 : -3 },
      {
        opacity: 1, x: 0, rotation: 0,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: toolsHeadingRef.value,
          start: 'top 85%',
          toggleActions: ta,
        },
      }
    )
  }

  nextTick(() => {
    toolCardRefs.value.forEach((cardRef, idx) => {
      const el = cardRef?.$el || cardRef
      if (!el) return

      if (mobile) {
        gsap.fromTo(el,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0,
            duration: 0.5,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '#tools',
              start: 'top 75%',
              toggleActions: ta,
            },
            delay: idx * 0.1,
          }
        )
      } else {
        // Scrub-based: already reversible by nature
        const fromX = idx % 2 === 0 ? -300 : 300
        const fromRotation = idx % 2 === 0 ? -8 : 8

        gsap.fromTo(el,
          { opacity: 0, x: fromX, rotation: fromRotation },
          {
            opacity: 1, x: 0, rotation: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '#tools',
              start: 'top 75%',
              end: 'top 25%',
              scrub: 1,
            },
            delay: idx * 0.05,
          }
        )
      }
    })
  })

  if (allToolsRef.value) {
    gsap.fromTo(allToolsRef.value,
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0,
        duration: 0.5,
        scrollTrigger: {
          trigger: allToolsRef.value,
          start: 'top 85%',
          toggleActions: ta,
        },
      }
    )
  }

  // --- Footer ---
  if (footerRef.value) {
    gsap.fromTo(footerRef.value,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0,
        duration: 0.6,
        scrollTrigger: {
          trigger: footerRef.value,
          start: 'top 90%',
          toggleActions: ta,
        },
      }
    )
  }
}

// ==================== LIFECYCLE ====================
const { initializeTracking, trackVisit } = useGoatCounter()

// Mobile detection
function checkMobile() {
  isMobile.value = window.innerWidth < 1024
}

onMounted(async () => {
  initializeTracking()
  trackVisit('/')

  // Detect mobile
  checkMobile()
  window.addEventListener('resize', checkMobile, { passive: true })

  window.addEventListener('scroll', onScroll, { passive: true })

  // Initialize GSAP scroll animations
  await nextTick()
  initScrollAnimations()

  // Initialize focus panel (handles hash routing for about/contact/gallery/posts)
  initFocusPanel(resolvePost)
})

onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', checkMobile)
  }
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
  box-shadow: var(--shadow-dali);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-dali-smoke);
  /* Melting clock shape: irregular rounded blob */
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

/* ==================== Posts Grid ==================== */

.posts-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 2rem;
}

@media (min-width: 768px) {
  .posts-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .posts-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* ==================== Bounce animation ==================== */

@keyframes bounceGentle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(6px); }
}

.animate-bounce-gentle {
  animation: bounceGentle 2s ease-in-out infinite;
}

/* ==================== Fade transition ==================== */

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
