# Design Specification — Page Design & Animation

> **Project**: x3huang.dev frontend major redesign
> **Created**: 2026-02-24
> **Updated**: 2026-02-24 — §5 redesigned: left drawer → Notion-style right-side TOC with scroll-spy
> **Status**: Planning
> **Inspiration**: apple.com, charlesleclerc.com/en, landonorris.com, **Notion's page TOC**

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Design Tokens](#2-design-tokens)
3. [Page Architecture — The Single Scroll Page](#3-page-architecture)
4. [Section-by-Section Specification](#4-section-specs)
5. [Navigation & TOC](#5-navigation)
6. [Interaction Model](#6-interaction-model)
7. [Responsive Strategy](#7-responsive)
8. [Animation Specifications](#8-animations)

> **Section flow**: Hero/Chatty → Blog Posts → **My Digital Space** (links + photo gallery) → Tools → Footer

---

## 1. Design Philosophy

### Neobrutalism Principles (applied throughout)

```
┌─────────────────────────────────────────────────┐
│                                                   │
│  ● Thick black borders (2-3px solid #000)        │
│  ● Hard offset shadows (no blur, solid black)    │
│  ● Bold, high-contrast colors (saturated)        │
│  ● Chunky, geometric shapes                      │
│  ● Flat design — NO gradients, NO glass          │
│  ● Monospace accents for tech personality         │
│  ● Large readable typography                     │
│  ● White/cream base + color section blocks       │
│  ● Playful but functional                        │
│                                                   │
│  ANTI-PATTERNS (what we're removing):            │
│  ✗ Glassmorphism / backdrop-blur                 │
│  ✗ Photo backgrounds                             │
│  ✗ Subtle gradients                              │
│  ✗ Rounded-everything / pill shapes              │
│  ✗ Drop shadows with blur                        │
│                                                   │
└─────────────────────────────────────────────────┘
```

### Background Strategy
- Pure solid colors per section (no photo backgrounds, no gradients)
- Large geometric shapes / diagonal slashes as section dividers
- Optional: repeating patterns (dots, lines, crosses) as subtle texture
- Each section has a distinct background color from the neo palette
- **Photos preserved** — existing `useBackgroundGallery.ts` photos (with notes/titles) are repurposed into a horizontal-scroll **Photo Gallery** block inside the "My Digital Space" section

---

## 2. Design Tokens

### Colors

```
Primary BG:       #FEFBEC  (warm cream)
Card BG:          #FFFFFF  (white)
Black:            #000000  (borders, shadows, text)
Text Primary:     #1A1A1A  (near-black)
Text Secondary:   #4A4A4A  (dark gray)

Section Colors (backgrounds):
  Hero/Chat:      #FEFBEC  (cream)
  Posts:          #E0F2FE  (light sky blue)    or #FEFBEC
  Digital Space:  #F3E8FF  (light lavender)
  Tools:          #FEF3C7  (light amber)

Accent Colors:
  Yellow:         #FFD700  (primary accent, CTAs)
  Pink:           #FF6B9D  (highlights, tags)
  Blue:           #4ECDC4  (links, interactive)
  Green:          #A8E6CF  (success, chat)
  Orange:         #FF8C42  (warnings, tools)
  Purple:         #C3A6FF  (decorative)
  Red:            #FF6B6B  (errors)
  Cyan:           #88D8FF  (info)
```

### Typography

```
Headings:    Space Grotesk, 700/600 weight
Body:        Inter, 400/500 weight
Code/Mono:   JetBrains Mono, 400 weight

Sizes:
  Hero Title:     clamp(3rem, 8vw, 6rem)
  Section Title:  clamp(2rem, 5vw, 3.5rem)
  Card Title:     1.25rem – 1.5rem
  Body:           1rem – 1.125rem
  Small/Meta:     0.875rem
  Tiny/Label:     0.75rem
```

### Spacing & Layout

```
Section padding:     5rem vertical (desktop), 3rem (mobile)
Card padding:        1.5rem
Border radius:       0 (sharp corners) or max 4px for subtle rounding
Border width:        2px standard, 3px emphasis
Shadow offset:       4px 4px 0px #000 (standard)
                     6px 6px 0px #000 (hover)
                     2px 2px 0px #000 (small elements)
Max content width:   1200px (centered)
```

---

## 3. Page Architecture — The Single Scroll Page

The homepage becomes a **single continuous scroll experience** (like Apple product pages, Charles Leclerc, Lando Norris). All content lives on one page with scroll-driven reveals.

```
╔══════════════════════════════════════════════════╗
║                                                    ║
║                                    ┌──────────┐  ║
║                                    │ ON THIS  │  ║
║                                    │ PAGE     │  ║
║                                    │          │  ║
║                                    │ ● Chat   │  ║
║                                    │ ○ Posts  │  ║
║                                    │ ○ Space  │  ║
║                                    │ ○ Tools  │  ║
║                                    └──────────┘  ║
║       ↑ right-side, always visible (xl+)         ║
║       ↑ scroll-spy highlights active section     ║
║                                                    ║
║  ╔════════════════════════════════════════════╗    ║
║  ║  SECTION 1: HERO / CHATTY                  ║    ║
║  ║  ┌────────────────────────────────────┐    ║    ║
║  ║  │  [Avatar]                           │    ║    ║
║  ║  │  Xinyu Huang                        │    ║    ║
║  ║  │  "Code with passion, learn for     │    ║    ║
║  ║  │   life, run freely, read deeply"   │    ║    ║
║  ║  │                                     │    ║    ║
║  ║  │  ┌─────────────────────────────┐   │    ║    ║
║  ║  │  │ Ask me anything...     [→]  │   │    ║    ║
║  ║  │  └─────────────────────────────┘   │    ║    ║
║  ║  │     ↑ neobrutalist chat input      │    ║    ║
║  ║  └────────────────────────────────────┘    ║    ║
║  ║                                             ║    ║
║  ║  scroll indicator ↓                         ║    ║
║  ╚════════════════════════════════════════════╝    ║
║                                                    ║
║  ▓▓▓▓▓▓▓ diagonal slash divider ▓▓▓▓▓▓▓▓▓       ║
║                                                    ║
║  ╔════════════════════════════════════════════╗    ║
║  ║  SECTION 2: BLOG POSTS                     ║    ║
║  ║                                             ║    ║
║  ║  "Latest Posts"                             ║    ║
║  ║                                             ║    ║
║  ║  ┌─────────────┐  ┌─────────────────────┐ ║    ║
║  ║  │ Post Card 1 │  │                     │ ║    ║
║  ║  │ ▄▄▄▄▄▄▄▄▄▄ │  │  Expanded Post      │ ║    ║
║  ║  │ Title       │  │  Content             │ ║    ║
║  ║  │ Date • Tags │  │  (appears on click)  │ ║    ║
║  ║  ├─────────────┤  │                     │ ║    ║
║  ║  │ Post Card 2 │  │  ← Back             │ ║    ║
║  ║  │ ▄▄▄▄▄▄▄▄▄▄ │  │                     │ ║    ║
║  ║  │ Title       │  └─────────────────────┘ ║    ║
║  ║  │ Date • Tags │                          ║    ║
║  ║  ├─────────────┤                          ║    ║
║  ║  │ Post Card 3 │   [View All Posts →]     ║    ║
║  ║  └─────────────┘                          ║    ║
║  ║                                             ║    ║
║  ╚════════════════════════════════════════════╝    ║
║                                                    ║
║  ▓▓▓▓▓▓▓ diagonal slash divider ▓▓▓▓▓▓▓▓▓       ║
║                                                    ║
║  ╔════════════════════════════════════════════╗    ║
║  ║  SECTION 3: MY DIGITAL SPACE               ║    ║
║  ║                                             ║    ║
║  ║  "My Digital Space"                         ║    ║
║  ║                                             ║    ║
║  ║  ┌── Link Cards ──────────────────────────┐ ║    ║
║  ║  │ ┌────────┐ ┌────────┐ ┌────────┐      │ ║    ║
║  ║  │ │ Email  │ │ GitHub │ │LinkedIn│      │ ║    ║
║  ║  │ └────────┘ └────────┘ └────────┘      │ ║    ║
║  ║  │ ┌────────┐ ┌────────┐ ┌────────┐      │ ║    ║
║  ║  │ │Resume  │ │ 勉強中 │ │ About  │      │ ║    ║
║  ║  │ └────────┘ └────────┘ └────────┘      │ ║    ║
║  ║  └────────────────────────────────────────┘ ║    ║
║  ║                                             ║    ║
║  ║  ┌── Photo Gallery (horizontal scroll) ───┐ ║    ║
║  ║  │ ← ┌───────┐┌───────┐┌───────┐┌──── → │ ║    ║
║  ║  │    │ thumb ││ thumb ││ thumb ││ thu   │ ║    ║
║  ║  │    │───────││───────││───────││─────  │ ║    ║
║  ║  │    │"note" ││"note" ││"note" ││"not   │ ║    ║
║  ║  │    │ title ││ title ││ title ││ tit   │ ║    ║
║  ║  │    └───────┘└───────┘└───────┘└──────  │ ║    ║
║  ║  │  ←→ drag/scroll • click → lightbox    │ ║    ║
║  ║  └────────────────────────────────────────┘ ║    ║
║  ║                                             ║    ║
║  ╚════════════════════════════════════════════╝    ║
║                                                    ║
║  ▓▓▓▓▓▓▓ diagonal slash divider ▓▓▓▓▓▓▓▓▓       ║
║                                                    ║
║  ╔════════════════════════════════════════════╗    ║
║  ║  SECTION 4: TOOLS                          ║    ║
║  ║                                             ║    ║
║  ║  ┌────────┐ ┌────────┐ ┌────────┐         ║    ║
║  ║  │ Base64 │ │ JSON   │ │ JWT    │         ║    ║
║  ║  │ 🔐     │ │ 📝     │ │ 🔑     │         ║    ║
║  ║  └────────┘ └────────┘ └────────┘         ║    ║
║  ║                                             ║    ║
║  ╚════════════════════════════════════════════╝    ║
║                                                    ║
║  ╔════════════════════════════════════════════╗    ║
║  ║  FOOTER                                     ║    ║
║  ║  © 2026 Xinyu Huang • Visit counter        ║    ║
║  ╚════════════════════════════════════════════╝    ║
║                                                    ║
╚══════════════════════════════════════════════════╝
```

---

## 4. Section-by-Section Specification

### Section 1: Hero / Chatty (viewport-height, pinned)

**Layout:**
- Centered vertically and horizontally
- Full viewport height (`100vh`, or `100dvh` for mobile)
- Background: `#FEFBEC` (warm cream) with optional decorative geometric shapes

**Elements (top to bottom):**
1. **Avatar** — 120px circle with 3px black border + 4px offset shadow
2. **Name** — "Xinyu Huang" in Space Grotesk 700, `clamp(2.5rem, 6vw, 4rem)`
3. **Motto** — "Code with passion, learn for life, run freely, and read deeply." in Inter 400, italic, `1.25rem`
4. **Bio subtitle** — "Software Developer & Tech Enthusiast" in Inter 500, `1rem`
5. **Chat Input** — Neobrutalist input box:
   - White background, 2px black border, 4px offset shadow
   - Placeholder: "Ask me anything..."
   - Send button: yellow (#FFD700) background, black border
   - On focus: shadow shifts to 6px 6px
   - On type: conversation starts inline (chat messages appear above input)

**Chat Behavior:**
- Idle state: Just avatar + motto + input (clean, inviting)
- Active state: Chat messages appear between motto and input
- Messages use neobrutalist bubbles (black border, offset shadow, colored backgrounds)
- User bubbles: white bg, shadow right
- AI bubbles: light green bg (#A8E6CF), shadow left
- Conversation is same `useChatty` composable, just restyled

**Scroll Indicator:**
- Animated bouncing arrow `↓` at bottom center
- Text: "Scroll to explore" in tiny mono font
- Fades out when user starts scrolling

**Animation:**
- On page load: stagger fade-in (avatar → name → motto → input), 200ms stagger, spring easing
- Avatar: slight bounce scale animation on load
- Chat input: slide up from bottom on load

### Section 2: Blog Posts (scroll-driven reveal)

**Layout:**
- Background: `#E0F2FE` (light sky blue) or stays cream with colored accent strip
- Two-column layout (desktop): left = post list (40%), right = expanded post (60%)
- Single column (mobile): post list, tap opens full-screen overlay

**Post List (Left Column):**
- Vertical stack of neobrutalism-vue Card components
- Each card: white bg, 2px black border, 4px shadow
- Shows: title, date, tags (colored tag chips), truncated description
- Stagger animation: cards slide in from left, 100ms stagger
- On hover: shadow shifts from `4px 4px` to `6px 6px`, slight translate(-2px, -2px)
- Maximum 5-8 latest posts shown; "View All Posts →" link at bottom

**Expanded Post (Right Column):**
- Initially hidden (0 width, or off-screen right)
- On card click: motion-v layout animation — card "expands" into right column
- Right column slides in from right, post content renders
- Shows: full title, date, author, read time, tags, content preview (first ~500 chars)
- "Read Full Post →" button navigates to `/blogs/[slug]`
- "← Back" button or click outside collapses back to list
- Smooth layout animation (motion-v layout or GSAP Flip fallback)

**Mobile Behavior:**
- Post list is full-width
- Tap card → full-screen overlay slides up from bottom
- Shows same expanded content
- Swipe down or tap "←" to dismiss

**Scroll Animation:**
- Section title "Latest Posts" animates in (slide up + fade)
- Post cards stagger in as user scrolls into section
- Uses motion-v scroll() with scrub for first 3 cards
- Remaining cards appear on further scroll

### Section 3: My Digital Space (scroll-driven reveal)

**Layout:**
- Background: `#F3E8FF` (light lavender)
- Two blocks stacked vertically: **Link Cards** (top) + **Photo Gallery** (bottom)

**Block A — Link Cards:**
- 2-row grid of neobrutalism-vue Card components
- Row 1: Email, GitHub, LinkedIn, Resume
- Row 2: 勉強中, About, Life/Coming Soon
- Each card: emoji icon, title, subtitle
- Same neobrutalist style: 2px black border, 4px offset shadow
- External links open in new tab
- Visit counters preserved (styled as neo badges)
- Desktop: 3-4 columns; tablet: 3 columns; mobile: 2 columns

**Block B — Photo Gallery (horizontal scroll):**
- Full-width horizontal scroll strip below the link cards
- Data source: existing `useBackgroundGallery.ts` images (with `note` and `title`)
- Scroll direction: horizontal (drag to scroll on desktop, swipe on mobile)

**Photo Cards (each item in the strip):**
- neobrutalism-vue Card style: 2px black border, 4px offset shadow
- **Thumbnail by default** — image rendered with reduced quality/size:
  - `width` constrained to ~300px (desktop) / ~240px (mobile)
  - Uses `<NuxtImg>` with `quality="50"` and `width="400"` for fast loading
  - Aspect ratio preserved (landscape photos: ~4:3 or natural)
- Below the image: `note` in italic + `title` in bold small text
- On hover: shadow shifts `4px 4px` → `6px 6px`, slight lift

**Click-to-Expand (Lightbox):**
- Click any photo card → **fullscreen lightbox overlay**
- Lightbox renders **full resolution** (`quality="90"`, original dimensions)
- Dark backdrop (`bg-black/80`) with neobrutalist close button (top-right, white square, black border)
- Photo title + note displayed below the image in lightbox
- Navigation: left/right arrows to browse other photos without closing
- Keyboard: Escape to close, ← → to navigate
- Motion-v: fade-in backdrop, scale photo from thumbnail size → full size (spring easing)
- Mobile: pinch-to-zoom support; swipe left/right to navigate

**Scroll Animation:**
- Section title "My Digital Space" animates in (slide up + fade)
- Link cards fly in from alternating left/right sides, spring easing
- Photo gallery strip slides in from right, 200ms delay after links
- Individual photo cards stagger-fade as they enter the horizontal viewport

### Section 4: Tools (scroll-driven reveal)

**Layout:**
- Background: `#FEF3C7` (light amber)
- 3-column grid (desktop), 1-column (mobile)

**Tool Cards:**
- neobrutalism-vue Card with icon (emoji or SVG), title, description
- Same neobrutalist style: black border, offset shadow
- Each card has a distinct accent color border-top (4px)
- Links to `/tools/base64`, `/tools/json`, `/tools/jwt`
- "Coming Soon" card: dashed border, muted colors

**Scroll Animation:**
- Section title slides in
- Cards stagger in from bottom, 150ms stagger
- Scale from 0.9 → 1.0 with fade

### Section 5: Footer

**Layout:**
- Background: `#000000` (black) — contrast footer
- White text
- Minimal: copyright, site visit counter, "Built with Nuxt & Vue"
- Social icons row (GitHub, LinkedIn)

---

## 5. Navigation — Notion-Style Right TOC + Mobile Drawer

> Inspired by Notion's page TOC, Nuxt docs, Tailwind docs, VitePress — all use a right-side sticky TOC with scroll-spy.

### Right-Side TOC (desktop xl+, `NotionToc.vue`)

```
Content (left, max-w-3xl)          TOC (right, 220px, sticky)
┌──────────────────────────┐       ┌────────────────────────┐
│                            │       │  ON THIS PAGE          │
│  Article / Section         │       │  ────────────────────  │
│  content here              │       │  ● Introduction        │
│  ...                       │       │    ○ Prerequisites     │
│                            │       │    ○ Installation      │
│                            │       │  ○ Configuration       │
│                            │       │  ○ Conclusion          │
└──────────────────────────┘       └────────────────────────┘
```

**Design:**
- Borderless (lightweight, Notion-faithful) — no card border, no shadow
- Small heading "ON THIS PAGE" in JetBrains Mono, 12px, uppercase, muted
- Links: Inter 13px, muted `#4A4A4A`; active link: `#E06C00` (warm orange) + 600 weight + 2px left border accent
- Hierarchical indent: H1=0, H2=0.75rem, H3=1.5rem
- Long headings truncated with `text-overflow: ellipsis`
- Independent scroll if TOC overflows viewport (`max-height: calc(100vh - 8rem)`)

**Behavior:**
- Always visible on xl+ (≥1280px) — no toggle needed
- `useScrollSpy` composable tracks which heading/section is in viewport via IntersectionObserver
- Click link → Lenis `scrollTo()` smooth scroll to target
- Active indicator transitions smoothly (200ms color + border-color ease)
- Entrance animation: fade in from right, 400ms, 800ms delay after page load

**Two contexts — same component:**

| Context | Data source | Position | Items |
|---------|------------|----------|-------|
| **Homepage** | Static section array (`hero`, `posts`, `space`, `tools`) | `position: fixed` (sections span full width) | 4–5 section-level |
| **Blog post** | `post.body.toc.links` from @nuxt/content | `position: sticky` in flex sidebar layout | 5–30+ heading-level |

### Mobile Navigation (< 1280px)

TOC hides entirely. Two mobile nav mechanisms remain:

1. **Hamburger Drawer (cross-page nav):** neobrutalism-vue Drawer, top-left hamburger button, links to Home / Blogs / Tags / Tools / Contact / About
2. **TOC Sheet (in-page nav, blog posts only):** Small FAB bottom-right opens neo Sheet (bottom variant) with heading list; same scroll-spy active state

### Blog Post Page Layout (target)

```html
<div class="flex gap-8 max-w-7xl mx-auto">
  <article class="flex-1 min-w-0 max-w-3xl"><!-- post --></article>
  <aside class="hidden xl:block w-[220px] shrink-0">
    <div class="sticky top-20">
      <NotionToc :links="post.body.toc.links" auto-spy />
    </div>
  </aside>
</div>
```

---

## 6. Interaction Model

### Desktop (Scroll-Driven)

```
Scroll Down   →  Sections reveal sequentially
                  CSS position: sticky pins each section briefly
                  Animations scrub with scroll position (like Apple)

Click Post    →  motion-v layout: card → expanded right panel
Click Back    →  motion-v layout reverse: panel → card

TOC Click     →  Right-side NotionToc link → Lenis scrollTo

Chat Input    →  Starts conversation inline in hero section
                  Hero section grows vertically to accommodate messages
```

**Scroll Behavior Detail:**
- Smooth scroll via Lenis
- Each section uses CSS `position: sticky` for brief visual pinning
- Animations scrub via motion-v `scroll()` (tied to scroll progress)
- After all elements in a section are revealed, natural scroll continues
- No GSAP ScrollTrigger needed for basic pin — CSS sticky handles it

**Section Animation Configuration:**
```
Section 1 (Hero):          motion-v onMount stagger animation (starts visible)
Section 2 (Posts):         CSS sticky pin + motion-v scroll() for card reveals
Section 3 (Digital Space): motion-v useInView() for links + horizontal scroll reveal for gallery
Section 4 (Tools):         motion-v useInView() for entrance animations
```

> **Fallback note:** If CSS sticky + motion-v scroll() doesn't provide
> enough control for the Apple-like pinned scrub experience, selectively
> add GSAP ScrollTrigger for Section 2 only (most complex section).

### Mobile (Touch/Slide-Driven)

```
Swipe Down    →  Same section reveals, but driven by touch scroll
                  No pinning (natural scroll, simpler)
                  Animations trigger on intersection (useIntersectionObserver)

Tap Post      →  Full-screen overlay slides up from bottom
Swipe Down    →  Dismiss overlay

Hamburger     →  Drawer for cross-page nav
TOC FAB       →  Bottom Sheet with heading list (blog posts)
Tap Section   →  Scroll to section
```

**Mobile simplifications:**
- No section pinning (avoids janky mobile scroll-pin)
- Animations triggered by IntersectionObserver (threshold: 0.2)
- Simpler transitions (fade + slide-up, no scrub)
- Post expansion: bottom sheet / full-screen overlay instead of side panel

### Keyboard Accessibility

- Tab through all interactive elements
- Enter/Space to activate buttons and cards
- Escape to close TOC, close expanded post
- Arrow keys for chat navigation
- Focus indicators: thick outline (4px) in accent color

---

## 7. Responsive Strategy

### Breakpoints (Tailwind defaults)

```
sm:   640px    Mobile landscape
md:   768px    Tablet
lg:   1024px   Desktop
xl:   1280px   Wide desktop
2xl:  1536px   Ultra-wide
```

### Layout Changes by Breakpoint

| Element | Mobile (<768px) | Tablet (768-1024px) | Desktop (>1024px) |
|---------|-----------------|--------------------|--------------------|
| Hero section | Full-width, stacked | Full-width, stacked | Full-width, centered |
| Blog layout | Single column | Single column | Two-column (list + expand) |
| Post expand | Bottom sheet overlay | Bottom sheet overlay | Right panel slide-in |
| Link cards (Space) | 2 columns | 3 columns | 3-4 columns |
| Photo gallery | Horizontal swipe, 240px thumbs | Horizontal swipe, 280px thumbs | Horizontal drag-scroll, 300px thumbs |
| Photo lightbox | Full-screen, swipe nav, pinch zoom | Full-screen, arrow nav | Centered overlay, arrow nav |
| Tool cards | 1 column | 2 columns | 3 columns |
| TOC | Hidden; Drawer + FAB Sheet (blog) | Hidden; Drawer | Right sticky NotionToc (always visible) |
| Section pin | None (intersection) | Optional | Yes (scroll-scrub) |
| Chat | Full-width | Max 600px | Max 700px |
| Font scale | base 16px | base 16px | base 18px |

### Touch vs Scroll

```
Desktop:  Scroll wheel / trackpad → motion-v scroll() + Lenis smooth scroll
          CSS position: sticky for section pinning
Mobile:   Native touch scroll → motion-v useInView() triggers
Tablet:   Hybrid (supports both, prefers touch)
Fallback: If motion-v insufficient → add GSAP ScrollTrigger for specific sections
```

---

## 8. Animation Specifications

### Page Load (Hero Section)

| Element | Animation | Duration | Delay | Easing |
|---------|-----------|----------|-------|--------|
| Avatar | scale(0.8→1) + fade(0→1) | 600ms | 0ms | spring(1, 80, 10) |
| Name | translateY(30→0) + fade | 500ms | 200ms | ease-out |
| Motto | translateY(20→0) + fade | 500ms | 400ms | ease-out |
| Bio | translateY(20→0) + fade | 400ms | 500ms | ease-out |
| Chat input | translateY(40→0) + fade | 500ms | 600ms | spring |
| Scroll indicator | fade(0→1) + bounce-y | 800ms | 1200ms | ease-in-out, loop |

### Scroll Reveal (Blog Section)

| Element | Animation | Trigger | Scrub |
|---------|-----------|---------|-------|
| Section title | translateY(50→0) + fade | enter viewport | yes, 0.5 |
| Post card 1 | translateX(-100→0) + fade | scroll progress 0-20% | yes |
| Post card 2 | translateX(-100→0) + fade | scroll progress 10-30% | yes |
| Post card 3 | translateX(-100→0) + fade | scroll progress 20-40% | yes |
| "View All" link | fade(0→1) | scroll progress 40-50% | yes |

### Post Expand/Collapse

```
Expand (Click):
  1. Card: motion-v layout animation — card transitions to expanded state
  2. Right panel: width 0% → 60%, 400ms, spring easing
  3. Content: fade in, 200ms delay after panel opens
  4. Left list: compress to 40% width, 400ms
  (uses motion-v <AnimatePresence> + layout animation)

Collapse (Back):
  1. Content: fade out, 200ms
  2. Right panel: width 60% → 0%, 400ms, spring easing
  3. Card: motion-v layout animation reverse to original position
  4. Left list: expand to 100% width, 400ms
  (if motion-v layout animations insufficient, fall back to GSAP Flip)
```

### Tools Section Reveal

| Element | Animation | Stagger |
|---------|-----------|---------|
| Section title | translateY(40→0) + fade | — |
| Tool card 1 | scale(0.9→1) + fade + translateY(30→0) | 0ms |
| Tool card 2 | scale(0.9→1) + fade + translateY(30→0) | 150ms |
| Tool card 3 | scale(0.9→1) + fade + translateY(30→0) | 300ms |
| "Coming Soon" | scale(0.9→1) + fade + translateY(30→0) | 450ms |

### My Digital Space Section Reveal

| Element | Animation | Stagger |
|---------|-----------|---------|
| Section title | translateY(40→0) + fade | — |
| Link card odd (1,3,5) | translateX(-60→0) + fade | 100ms between |
| Link card even (2,4,6) | translateX(60→0) + fade | 100ms between |
| Gallery strip | translateX(100→0) + fade | 200ms after links |
| Photo card (each) | scale(0.95→1) + fade | 80ms stagger as they enter horizontal viewport |

### Photo Lightbox

```
Open (Click thumbnail):
  1. Backdrop: fade in bg-black/80, 200ms
  2. Photo: scale from thumbnail rect → center full-size, 400ms, spring easing
  3. Title + note: fade in below photo, 150ms delay

Close (Escape / click backdrop / close button):
  1. Photo: scale from full-size → thumbnail rect, 300ms, ease-out
  2. Backdrop: fade out, 200ms
  (uses motion-v <AnimatePresence> for exit animation)

Navigate (← → arrows or swipe):
  1. Current photo: translateX(0 → ±100%) + fade out, 200ms
  2. Next photo: translateX(∓100% → 0) + fade in, 200ms
```

### TOC (NotionToc)

```
Entrance:        translateX(20→0) + fade, 400ms, 800ms delay after page load
Active change:   color + border-color transition, 200ms ease
Click-to-scroll: Lenis scrollTo() with duration 800ms, easeInOutQuart
Mobile Drawer:   neobrutalism-vue Drawer (built-in animation)
Mobile Sheet:    neobrutalism-vue Sheet bottom variant (built-in animation)
```

---

## Reference Links

### Design Inspiration
- [apple.com](https://www.apple.com/) — Scroll-driven interaction reference
- [charlesleclerc.com](https://charlesleclerc.com/en/) — Full-page scroll interaction reference
- [landonorris.com](https://landonorris.com/) — Full-page scroll interaction reference

### Component Libraries
- [neobrutalism-vue](https://neobrutalism-vue.com/) — Vue 3 neobrutalism components (PRIMARY)
- [v3.neobrutalism.dev](https://v3.neobrutalism.dev/docs) — neobrutalism-vue documentation

### Animation & Scroll
- [Motion for Vue (motion-v)](https://motion.dev/docs/vue) — Vue animation library (PRIMARY)
- [Vue scroll animations](https://motion.dev/docs/vue-scroll-animations) — Scroll-linked & parallax docs
- [Vue gestures](https://motion.dev/docs/vue-gestures) — Hover, drag, press docs
- [Lenis](https://github.com/darkroomengineering/lenis) — Smooth scroll
- [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) — Scroll animation (FALLBACK)
