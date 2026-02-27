<template>
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

      <!-- Social links with icons -->
      <div class="flex justify-center gap-5 mb-6">
        <a
          v-if="siteConfig.social.github"
          :href="siteConfig.social.github"
          target="_blank"
          rel="noopener noreferrer"
          class="footer-social-link group"
          title="GitHub"
        >
          <span class="footer-social-icon group-hover:border-dali-teal group-hover:shadow-[3px_3px_0px_0px_#0B0B0F]">
            <IconsGithub class="w-5 h-5" />
          </span>
          <span class="footer-social-label group-hover:text-dali-teal">GitHub</span>
        </a>

        <a
          v-if="siteConfig.social.linkedin"
          :href="siteConfig.social.linkedin"
          target="_blank"
          rel="noopener noreferrer"
          class="footer-social-link group"
          title="LinkedIn"
        >
          <span class="footer-social-icon group-hover:border-dali-gold group-hover:shadow-[3px_3px_0px_0px_#0B0B0F]">
            <IconsLinkedin class="w-5 h-5" />
          </span>
          <span class="footer-social-label group-hover:text-dali-gold">LinkedIn</span>
        </a>

        <a
          v-if="siteConfig.social.email"
          :href="`mailto:${siteConfig.social.email}`"
          class="footer-social-link group"
          title="Email"
        >
          <span class="footer-social-icon group-hover:border-dali-red group-hover:shadow-[3px_3px_0px_0px_#0B0B0F]">
            <IconsEmail class="w-5 h-5" />
          </span>
          <span class="footer-social-label group-hover:text-dali-red">Email</span>
        </a>
      </div>

      <!-- Separator -->
      <div class="mx-auto w-16 h-0.5 bg-dali-red/30 mb-5" aria-hidden="true" />

      <p class="footer-built-with text-sm">
        Built with
        <span class="text-dali-teal font-bold">Nuxt</span>,
        <span class="text-dali-gold font-bold">Vue</span> &amp;
        <span class="text-dali-violet font-bold">Nuxt Content</span>
      </p>
      <p class="footer-copyright text-xs mt-2">
        &copy; {{ new Date().getFullYear() }} {{ siteConfig.author.name }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { siteConfig } from '~/site.config'
import IconsGithub from '~/components/icons/github.vue'
import IconsLinkedin from '~/components/icons/linkedin.vue'
import IconsEmail from '~/components/icons/email.vue'

// ── Template ref ──
const footerRef = ref<HTMLElement | null>(null)

// ── GSAP scroll animation ──
onMounted(async () => {
  if (!import.meta.client) return
  await nextTick()

  const { gsap } = await import('gsap')
  const { ScrollTrigger } = await import('gsap/ScrollTrigger')
  gsap.registerPlugin(ScrollTrigger)

  if (footerRef.value) {
    gsap.fromTo(footerRef.value,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0,
        duration: 0.6,
        scrollTrigger: {
          trigger: footerRef.value,
          start: 'top 90%',
          toggleActions: 'play none none reverse',
        },
      },
    )
  }
})
</script>

<style scoped>
.footer-social-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.footer-social-link:hover {
  transform: translateY(-3px);
}

.footer-social-link:active {
  transform: translateY(1px);
}

.footer-social-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border: 2px solid var(--color-dali-muted);
  border-radius: 0;
  color: var(--color-flow-text, var(--color-dali-white));
  background: transparent;
  box-shadow: 2px 2px 0px 0px transparent;
  transition: border-color 0.2s ease,
              box-shadow 0.2s ease,
              background 0.2s ease,
              color 0.2s ease;
}

.footer-social-label {
  font-family: var(--font-dali-heading);
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-flow-muted, var(--color-dali-muted));
  transition: color 0.2s ease;
}

.footer-built-with {
  font-family: var(--font-dali-heading);
  letter-spacing: 0.03em;
  color: var(--color-flow-text, var(--color-dali-white));
  opacity: 0.75;
}

.footer-copyright {
  font-family: var(--font-dali-mono);
  letter-spacing: 0.06em;
  color: var(--color-flow-text, var(--color-dali-white));
  opacity: 0.4;
}
</style>
