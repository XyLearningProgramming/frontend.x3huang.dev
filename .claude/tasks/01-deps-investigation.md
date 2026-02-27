# Dependencies Investigation & Tech Stack Decisions

> **Project**: x3huang.dev frontend major redesign (neobrutalism + scroll-driven SPA)
> **Created**: 2026-02-24
> **Updated**: 2026-02-24 — revised: third-party neobrutalism-vue; motion-v; Tailwind v4 upgrade confirmed
> **Status**: Planning

---

## Current Stack (Preserved)

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Framework | **Nuxt 3** | ^3.17.5 | SSR, file-based routing, auto-imports |
| UI Framework | **Vue 3** | (via Nuxt) | Composition API throughout |
| Styling | **Tailwind CSS v3** | via @nuxtjs/tailwindcss ^6.13 | ⚠️ **Upgrading to v4** — see Tailwind v4 section below |
| Content | **@nuxt/content** v3 | ^3.6.1 | Blog posts in MD, PostgreSQL backend |
| Images | **@nuxt/image** | 2.0.0-alpha | IPX provider, WebP/AVIF |
| Utilities | **@vueuse/core** | ^13.4.0 | Composables (useScroll, useIntersectionObserver, etc.) |
| Chat | **Custom SSE client** | — | `useChatty.ts` composable, streaming AI |
| Analytics | **GoatCounter** | — | Custom composable `useGoatCounter.ts` |
| Monitoring | **@artmizu/nuxt-prometheus** | ^2.5.0 | Metrics endpoint |
| Markdown | **marked** | ^17.0.3 | Chat message rendering |
| LLMs | **nuxt-llms** | ^0.1.3 | LLM content exposure |

---

## New Dependencies to Add

### 1. Neobrutalism Components: **neobrutalism-vue** (via shadcn-vue registry) ⭐ PRIMARY

**Why third-party instead of custom:**
- [ekmas/neobrutalism-components](https://github.com/ekmas/neobrutalism-components) (5k stars) and [bridgetamana/neobrutal-ui](https://github.com/bridgetamana/neobrutal-ui) are React-only — can't use directly
- But **[neobrutalism-vue](https://neobrutalism-vue.com/)** exists! It's the Vue port, built on:
  - **shadcn-vue** — the Vue equivalent of shadcn/ui
  - **Reka UI** — accessible headless primitives (WAI-ARIA compliant)
  - **Tailwind CSS v4**
- **30+ components** available: Button, Input, Dialog, Drawer, Tabs, Table, Select, Popover, Card, Badge, etc.
- Uses **shadcn-vue registry** — components install as **editable source files** in your project, not a black-box dependency
- Full TypeScript support, responsive out of box
- Docs: [v3.neobrutalism.dev](https://v3.neobrutalism.dev/docs), [neobrutalism-vue.com](https://neobrutalism-vue.com/)

**What this means for us:**
- ✅ **No custom component maintenance** — the neobrutalism design system is handled upstream
- ✅ **Full customization when needed** — source files live in our project
- ✅ We focus on **page layout and interactions**, not reinventing buttons/inputs/cards
- ✅ Accessibility is built-in (Reka UI primitives)

**Installation:**
```bash
# Prerequisites: shadcn-vue must be initialized first
npx shadcn-vue@latest init

# Then install individual components as needed:
npx shadcn-vue@latest add https://neobrutalism-vue.com/r/button.json
npx shadcn-vue@latest add https://neobrutalism-vue.com/r/card.json
npx shadcn-vue@latest add https://neobrutalism-vue.com/r/input.json
npx shadcn-vue@latest add https://neobrutalism-vue.com/r/dialog.json
npx shadcn-vue@latest add https://neobrutalism-vue.com/r/drawer.json
npx shadcn-vue@latest add https://neobrutalism-vue.com/r/badge.json
npx shadcn-vue@latest add https://neobrutalism-vue.com/r/tabs.json
# ... etc for each component needed
```

**Components we'll need from neobrutalism-vue:**
| Component | Use Case |
|-----------|----------|
| Button | CTAs, navigation, send button |
| Card | Blog post cards, tool cards, contact cards |
| Input / Textarea | Chat input, search box |
| Dialog | Post expand overlay (mobile) |
| Drawer | Left TOC sidebar (mobile) |
| Badge | Tags, counters, labels |
| Tabs | Mode switching (if needed) |
| Avatar | Profile image |
| Separator | Between sections (with custom styling) |
| Tooltip | Hover hints |

---

### 2. Tailwind CSS v3 → v4 Upgrade ⭐ CONFIRMED

**Decision: Upgrade to Tailwind v4.** Required for neobrutalism-vue / shadcn-vue ecosystem.

**Current state:**
- `@nuxtjs/tailwindcss ^6.13` (Tailwind v3)
- `tailwind.config.js` — JS-based config with `module.exports`
- `main.css` uses `@tailwind base; @tailwind components; @tailwind utilities;`

**Migration steps:**

```bash
# 1. Remove old module
pnpm remove @nuxtjs/tailwindcss

# 2. Install Tailwind v4 + Nuxt module
pnpm add -D @tailwindcss/nuxt tailwindcss@latest
```

**Key breaking changes in Tailwind v4:**

| v3 | v4 | Impact |
|----|-----|--------|
| `tailwind.config.js` (JS) | `@theme {}` in CSS | Must migrate all design tokens to CSS |
| `@tailwind base/components/utilities` | `@import "tailwindcss"` | Update `main.css` |
| `darkMode: 'class'` | Automatic or `@variant dark` | Simplify |
| `content: [...]` paths | Automatic detection | Remove content array |
| `theme.extend.colors` | `@theme { --color-*: ... }` | Migrate colors to CSS variables |

**Concrete file changes:**

1. **`nuxt.config.ts`** — Replace module:
```typescript
modules: [
  // '@nuxtjs/tailwindcss',  // REMOVE
  '@tailwindcss/nuxt',        // ADD
]
```

2. **`assets/css/main.css`** — New import syntax + theme tokens:
```css
/* OLD: */
/* @tailwind base; @tailwind components; @tailwind utilities; */

/* NEW: */
@import "tailwindcss";

@theme {
  /* Neobrutalism palette */
  --color-neo-bg: #FEFBEC;
  --color-neo-black: #000000;
  --color-neo-yellow: #FFD700;
  --color-neo-pink: #FF6B9D;
  --color-neo-blue: #4ECDC4;
  --color-neo-green: #A8E6CF;
  --color-neo-orange: #FF8C42;
  --color-neo-purple: #C3A6FF;
  --color-neo-red: #FF6B6B;
  --color-neo-cyan: #88D8FF;

  /* Section backgrounds */
  --color-neo-section-chat: #FEFBEC;
  --color-neo-section-posts: #E8F4FD;
  --color-neo-section-tools: #FFF3E0;
  --color-neo-section-contact: #F3E5F5;

  /* Keep existing tokens (migrated from tailwind.config.js) */
  --color-light-bg: #fdf6e3;
  --color-light-surface: #eee8d5;
  --color-light-border: #d3af86;
  --color-light-text: #657b83;
  --color-light-text-strong: #073642;
  --color-light-accent: #268bd2;
  --color-light-secondary: #2aa198;

  --color-dark-bg: #002b36;
  --color-dark-surface: #073642;
  --color-dark-border: #586e75;
  --color-dark-text: #839496;
  --color-dark-text-strong: #fdf6e3;
  --color-dark-accent: #268bd2;
  --color-dark-secondary: #2aa198;

  /* Typography (migrate from tailwind.config.js fontSize/lineHeight) */
  --font-size-h1: 4rem;
  --font-size-h2: 3rem;
  --font-size-h3: 2rem;
  --font-size-h4: 1.5rem;
  --font-size-h5: 1.25rem;
  --font-size-h1-sm: 3rem;
  --font-size-h2-sm: 2.25rem;
  --font-size-h3-sm: 1.75rem;

  /* Neobrutalism shadows */
  --shadow-neo-sm: 2px 2px 0px 0px #000;
  --shadow-neo: 4px 4px 0px 0px #000;
  --shadow-neo-lg: 6px 6px 0px 0px #000;
  --shadow-neo-xl: 8px 8px 0px 0px #000;

  /* Fonts */
  --font-neo-heading: 'Space Grotesk', 'Inter', system-ui, sans-serif;
  --font-neo-body: 'Inter', system-ui, sans-serif;
  --font-neo-mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```

3. **Delete `tailwind.config.js`** — No longer needed; all config is in CSS `@theme`.

4. **Update `@apply` usage** — Most `@apply` directives work the same in v4, but custom utility names change:
   - `text-light-bg` → `text-light-bg` (same, auto-resolved from CSS vars)
   - Custom `text-h1_sm` etc. → need to use `@theme` or regular CSS

**Note:** shadcn-vue's `init` command will also set up required CSS variables for its component system. Run `shadcn-vue init` after Tailwind v4 is configured.

---

### 3. Animation Engine: **Tiered approach — motion-v first, GSAP as fallback**

We need scroll-driven animations for the Apple-like section reveals. Two approaches evaluated:

#### Option A: **motion-v (Motion for Vue)** — Preferred start ⭐

```bash
pnpm add motion-v
```

- **Nuxt module**: `modules: ['motion-v/nuxt']` — auto-imports everything
- Scroll-linked animations via `scroll()` function
- `useInView()` for viewport trigger-based animations
- Layout animations for post expand/collapse
- Gesture support (hover, press, drag)
- Hardware-accelerated "hybrid engine"
- ~15KB gzipped — lighter than GSAP
- Vue-native, declarative API

**What it handles well:**
- ✅ Scroll-linked opacity/transform animations (scrubbing)
- ✅ Element entrance/exit animations
- ✅ Layout transitions (post expand/collapse)
- ✅ Gesture-driven interactions
- ✅ Spring physics

**What it does NOT have (vs GSAP):**
- ❌ Built-in section `pin` (must use CSS `position: sticky` instead — fine for our needs)
- ❌ Built-in `ScrollSmoother` (must use Lenis separately)
- ❌ `Flip` plugin (but has its own layout animation approach)
- ❌ `gsap.matchMedia()` (use Vue's responsive composables instead)

**Section pinning strategy without GSAP:**
- Use CSS `position: sticky` for pinning sections during scroll
- Use motion-v's `scroll()` to tie animation progress to scroll position
- This is actually simpler and more performant for our needs

#### Option B: **GSAP + ScrollTrigger** — Fallback if motion-v is insufficient

```bash
pnpm add gsap lenis
```

- Industry standard for complex scroll choreography
- Built-in `pin: true` for section pinning
- `Flip` plugin for layout transitions
- More powerful but heavier (~50KB gzipped)
- Requires manual Nuxt plugin setup (not a Nuxt module)
- Not Vue-native — imperative API, must manage lifecycle manually

**Decision: Start with motion-v.** If during implementation we hit limitations (complex multi-section choreography, precise pin timing), add GSAP for those specific sections. This keeps the dependency footprint minimal.

---

### 4. Smooth Scrolling: **Lenis**

```bash
pnpm add lenis
```

- Lightweight (~5KB), MIT license
- Works with both motion-v and GSAP
- Used by award-winning sites
- Required regardless of animation engine choice (native scroll is janky for this kind of site)

---

### 5. Fonts: **@nuxtjs/google-fonts**

```bash
pnpm add -D @nuxtjs/google-fonts
```

Fonts to load (check what neobrutalism-vue defaults to — may already specify):
- **Space Grotesk** (700, 600) — Bold headings, neobrutalist character
- **Inter** (400, 500, 600) — Body text, clean readability
- **JetBrains Mono** (400) — Code blocks, mono accents

---

### 6. shadcn-vue (Prerequisite for neobrutalism-vue)

```bash
npx shadcn-vue@latest init
```

This sets up:
- `components.json` configuration
- Utils / cn() helper
- Base CSS variables
- Component directory structure

**Note:** shadcn-vue components are a foundation layer. neobrutalism-vue overrides their styling with the neobrutalism design language. We install both — shadcn-vue as the base, neobrutalism-vue for the styling.

---

## Dependencies to Remove / Replace

| Current | Replacement | Reason |
|---------|-------------|--------|
| `@nuxtjs/tailwindcss ^6.13` | `@tailwindcss/nuxt` + `tailwindcss@latest` | Tailwind v4 upgrade |
| `tailwind.config.js` | `@theme {}` in `main.css` | v4 CSS-first config |
| `@wxperia/liquid-glass-vue` | Remove | Glassmorphism → neobrutalism |
| `useBackgroundGallery.ts` composable | Remove | Pure color backgrounds replace photo backgrounds |
| `glass-ui.css` (entire file) | Remove (neobrutalism-vue handles styling) | New design system |
| `Card.vue` (custom) | neobrutalism-vue Card | Third-party maintained |
| `GlassCard.vue` (custom) | Delete entirely | No more glass morphism |
| Dark/light theme toggle | Review | Neobrutalism is typically light-first; may simplify |

---

## Packages to Keep (Unchanged)

- `@nuxt/content` — blog engine stays
- `@vueuse/core` — utility composables (useScroll, useIntersectionObserver, useSwipe)
- `better-sqlite3` / `pg` — content DB
- `marked` — chat rendering
- `prismjs` — code highlighting
- `feed` — RSS
- `nuxt-llms` — LLM integration
- `@artmizu/nuxt-prometheus` — monitoring
- `diff`, `vanilla-jsoneditor`, `vuejs-code-block` — tool pages

---

## Final Dependency Summary

```bash
# STEP 1 — Tailwind v4 upgrade (do first, everything else depends on this)
pnpm remove @nuxtjs/tailwindcss
pnpm add -D @tailwindcss/nuxt tailwindcss@latest
# Then: migrate tailwind.config.js → @theme in main.css (see section 2 above)
# Then: delete tailwind.config.js

# STEP 2 — Core new deps
pnpm add motion-v lenis
pnpm add -D @nuxtjs/google-fonts

# STEP 3 — shadcn-vue + neobrutalism-vue (via CLI)
npx shadcn-vue@latest init
npx shadcn-vue@latest add https://neobrutalism-vue.com/r/button.json
npx shadcn-vue@latest add https://neobrutalism-vue.com/r/card.json
# ... (more components as needed during implementation)

# STEP 4 — Remove old deps
pnpm remove @wxperia/liquid-glass-vue

# CONDITIONAL — Only add if motion-v proves insufficient for scroll pinning
pnpm add gsap    # ScrollTrigger included free
```

**Estimated bundle impact:**
- motion-v: ~15KB gzipped
- Lenis: ~5KB gzipped
- neobrutalism-vue components: 0KB dependency (source files, bundled with app)
- Fonts: loaded async, no bundle impact
- Removal of liquid-glass-vue: saves ~15KB
- **Net: roughly neutral bundle size**

---

## Integration Architecture

```
┌───────────────────────────────────────────────────────┐
│  Nuxt 3 App                                            │
│                                                         │
│  ┌──────────────────┐  ┌──────────────┐               │
│  │ motion-v/nuxt    │  │ Lenis Plugin │  (client-only)│
│  │ (auto-imported)  │  │ (smooth scr) │               │
│  └──────┬───────────┘  └──────┬───────┘               │
│         │                      │                       │
│  ┌──────▼──────────────────────▼───────┐              │
│  │   useScrollAnimation() composable    │              │
│  │   - CSS sticky + scroll() for pins   │              │
│  │   - useInView() for entrance anims   │              │
│  │   - layout animations for expand     │              │
│  └──────────────┬──────────────────────┘              │
│                 │                                       │
│  ┌──────────────▼──────────────────────┐              │
│  │   neobrutalism-vue components        │              │
│  │   (installed as source in project)   │              │
│  │   Button, Card, Input, Dialog, etc.  │              │
│  └──────────────┬──────────────────────┘              │
│                 │                                       │
│  ┌──────────────▼──────────────────────┐              │
│  │   Page Components (Vue SFCs)         │              │
│  │   - Section wrappers                 │              │
│  │   - Chat section (reuses useChatty)  │              │
│  │   - Post expand/collapse logic       │              │
│  └─────────────────────────────────────┘              │
│                                                         │
│  ┌─────────────────────────────────────┐              │
│  │   @nuxt/content (blog engine)        │  (unchanged)│
│  └─────────────────────────────────────┘              │
└───────────────────────────────────────────────────────┘
```

### Nuxt Config Changes

```typescript
// nuxt.config.ts — full modules array after migration
export default defineNuxtConfig({
  modules: [
    '@artmizu/nuxt-prometheus',
    '@nuxt/content',
    '@nuxt/eslint',
    '@tailwindcss/nuxt',       // CHANGED: was '@nuxtjs/tailwindcss'
    '@nuxt/image',
    'nuxt-llms',
    'motion-v/nuxt',           // NEW: auto-imports Motion for Vue
    '@nuxtjs/google-fonts',    // NEW: font loading
  ],
  css: ['/assets/css/main.css'],  // CHANGED: removed glass-ui.css
  googleFonts: {
    families: {
      'Space Grotesk': [600, 700],
      'Inter': [400, 500, 600],
      'JetBrains Mono': [400],
    },
    display: 'swap',
  },
})
```

### Lenis Plugin (client-only)

```typescript
// plugins/lenis.client.ts
import Lenis from 'lenis'

export default defineNuxtPlugin(() => {
  const lenis = new Lenis({ autoRaf: true })
  return { provide: { lenis } }
})
```

---

## Decision Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Tailwind version** | **v4** (via `@tailwindcss/nuxt`) | Required for neobrutalism-vue/shadcn-vue; CSS-first config is cleaner |
| Neobrutalism components | **neobrutalism-vue** (third-party) | Avoid maintaining 9+ custom components; 30+ ready-made, accessible, TypeScript |
| Animation engine | **motion-v** (start), GSAP (fallback) | Vue-native, Nuxt module, lighter; add GSAP only if needed |
| Smooth scroll | **Lenis** | Lightweight, MIT, framework-agnostic, proven |
| Section pinning | **CSS `position: sticky`** + motion-v scroll() | No library needed; simpler, more performant |
| Fonts | **@nuxtjs/google-fonts** | Nuxt module, async loading, no bundle impact |
| Component delivery | **shadcn-vue registry** (source files) | Own the code, don't maintain it; customize when needed |

---

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| motion-v animations | ✅ | ✅ | ✅ | ✅ |
| Lenis smooth scroll | ✅ | ✅ | ✅ | ✅ |
| CSS position: sticky | ✅ | ✅ | ✅ | ✅ |
| IntersectionObserver | ✅ | ✅ | ✅ | ✅ |
| CSS scroll-driven anim | ✅ 115+ | ✅ 110+ | ❌ | ✅ 115+ |
| Touch events | ✅ | ✅ | ✅ | ✅ |

---

## Open Questions (to resolve during Phase 1)

1. ~~**Tailwind v3 vs v4**~~ → **RESOLVED: Upgrading to v4.** Use `@tailwindcss/nuxt` + `tailwindcss@latest`.
2. **shadcn-vue init**: Does shadcn-vue work cleanly with existing Nuxt project structure? Test during setup.
3. **motion-v scroll pinning**: Validate that CSS sticky + motion-v scroll() provides sufficient control for the Apple-like experience. If not, add GSAP for specific sections only.
4. **Font defaults**: Check what fonts neobrutalism-vue expects — may need to match their defaults or override.
5. **`@apply` migration**: Some `@apply` directives in `main.css` use custom tokens (`text-h1_sm`, `leading-h1_sm`). These need to be mapped to `@theme` variables or rewritten as plain CSS in v4. Verify all `@apply` usages still work after migration.
