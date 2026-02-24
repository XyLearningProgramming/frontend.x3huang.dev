# Refactoring Plan — Folder Structure, Migration & Code Changes

> **Project**: x3huang.dev frontend major redesign
> **Created**: 2026-02-24
> **Updated**: 2026-02-24 — TOC redesigned: left drawer → Notion-style right NotionToc + useScrollSpy
> **Status**: Planning
> **Related**: `01-deps-investigation.md` (tech stack), `02-design-specification.md` (page design & animation)

---

## Table of Contents

1. [Current File Inventory](#1-current-file-inventory)
2. [Component Library — neobrutalism-vue](#2-component-library)
3. [Component Migration Map](#3-component-migration-map)
4. [Files to Delete](#4-files-to-delete)
5. [Files to Create](#5-files-to-create)
6. [Files to Modify](#6-files-to-modify)
7. [Code Block Rendering Redesign](#7-code-block-rendering)
8. [Route Structure](#8-route-structure)
9. [Target Folder Structure](#9-target-folder-structure)
10. [Migration Phases](#10-migration-phases)

---

## 1. Current File Inventory

### Pages
```
pages/
  index.vue                 # Main landing page — HEAVY REWRITE (→ single scroll)
  about.vue                 # About page — RESTYLE
  contact.vue               # Contact page — may redirect to /#space
  blogs/
    index.vue               # Blog listing — RESTYLE
    [slug].vue              # Blog post — RESTYLE + code block changes
    rss.xml.vue             # RSS feed — KEEP
    timeline.vue            # Timeline — RESTYLE
    tags/
      index.vue             # Tags page — RESTYLE
      [slug].vue            # Tag filter — RESTYLE
  tools/
    index.vue               # Tools listing — RESTYLE
    base64.vue              # Base64 tool — RESTYLE
    json.vue                # JSON tool — RESTYLE
    jwt.vue                 # JWT tool — RESTYLE
  games/
    [slug].vue              # Games — KEEP
```

### Components
```
components/
  AppSidebar.vue            # Sidebar nav — SIMPLIFY (mobile-only cross-page Drawer)
  Section.vue               # Generic section — REVIEW
  CommentSection.vue        # Comments — RESTYLE

  blog/
    AnalyticsDisplay.vue    # Visit/like counts — RESTYLE (neo Badge)
    BlogCard.vue            # Blog post card — RESTYLE (neo Card + Badge)
    BlogList.vue            # Blog list wrapper — MINIMAL changes
    LikeButton.vue          # Like button — RESTYLE (neo Button)
    RelatedArticles.vue     # Related posts — RESTYLE
    TableOfContents.vue     # Blog post TOC — DELETE (replaced by NotionToc.vue)

  chat/
    ChatInput.vue           # Chat input — RESTYLE (neo Input + Button)
    ChatMessage.vue         # Chat message — RESTYLE (custom ChatBubble)
    ChatView.vue            # Chat container — RESTYLE (keep logic)
    ThinkingBlock.vue       # AI thinking — RESTYLE

  content/
    ProseCodeInline.vue     # Inline code — RESTYLE
    ProseGithub.vue         # GitHub code embed — REDESIGN (see section 7)
    ProseImg.vue            # Image in prose — RESTYLE
    ProsePre.vue            # Code blocks — REDESIGN (see section 7)
    RepoGithub.vue          # GitHub repo card — RESTYLE
    VideoCard.vue           # Video embed card — RESTYLE
    VideoEmbed.vue          # Video embed — KEEP

  icons/                    # SVG icon components — KEEP all
    arrowLeft.vue, arrowUp.vue, check.vue, chevronDown.vue,
    copy.vue, facebook.vue, github.vue, gmail.vue, instagram.vue,
    linkedin.vue, pinterest.vue, rss.vue, search.vue, twitter.vue, x.vue

  layouts/
    BackgroundLayout.vue    # Photo bg layout — DELETE (replaced by ScrollSection)
    PureLayout.vue          # Plain layout — REVIEW / RESTYLE

  nav/
    ScrollTopIcon.vue       # Scroll-to-top — RESTYLE
    ShareIcons.vue          # Social share — RESTYLE

  ui/
    Card.vue                # Generic card — DELETE (neo Card replaces)
    GlassCard.vue           # Glass card — DELETE
    PageHeader.vue          # Page header — RESTYLE
    RssButton.vue           # RSS button — RESTYLE (neo Button)
    VisitCounter.vue        # Visit counter — RESTYLE (neo Badge)
```

### Composables
```
composables/
  useBackgroundGallery.ts   # Photo data — MODIFY (repurposed for photo gallery in "My Digital Space")
  useChatty.ts              # Chat logic — KEEP (no changes needed)
  useGoatCounter.ts         # Analytics — KEEP
  useSidebar.ts             # Sidebar state — SIMPLIFY (mobile Drawer only; scroll-spy moves to useScrollSpy)
  useSlug.ts                # Slug utils — KEEP
```

### Styles
```
assets/css/
  main.css                  # Global styles — REWRITE (Tailwind v4 + @theme)
  glass-ui.css              # Glass morphism — DELETE entirely
```

### Config
```
nuxt.config.ts              # MODIFY (modules, css array)
tailwind.config.js          # DELETE (migrate to @theme in main.css)
site.config.ts              # KEEP
```

---

## 2. Component Library — neobrutalism-vue (Third-Party)

> **Key decision**: Use [neobrutalism-vue](https://neobrutalism-vue.com/) via shadcn-vue registry.
> Components install as editable source files. See `01-deps-investigation.md` for details.

### Components to Install from neobrutalism-vue

| neobrutalism-vue Component | Our Use Case |
|---------------------------|--------------|
| **Button** | CTAs, send button, navigation buttons, "View All Posts →" |
| **Card** | Blog post cards, tool cards, contact link cards |
| **Input** | Chat input field, blog search box |
| **Textarea** | Chat input (multi-line) |
| **Dialog** | Post expand overlay (mobile), RSS popup |
| **Drawer** | Mobile-only cross-page nav (hamburger menu) |
| **Badge** | Tags on blog posts, visit counters, labels |
| **Avatar** | Profile image in hero section |
| **Separator** | Visual dividers (base for custom diagonal slashes) |
| **Tooltip** | Hover hints (chatbot mode, card descriptions) |
| **Tabs** | Mode switching if needed |
| **Sheet** | Alternative to Drawer for side panel |

### Custom Components (Only What neobrutalism-vue Doesn't Cover)

**6 custom components** — all are layout/domain-specific wrappers, not UI primitives:

#### `SectionDivider.vue` (custom, simple)
```
Props: variant (slash|zigzag|dots), color
Purpose: Diagonal SVG stripe pattern between sections
Why custom: No library provides decorative section dividers
Complexity: Low — just an SVG pattern in a full-width div
```

#### `ScrollSection.vue` (custom, simple)
```
Props: id, bgColor, stickyDuration
Purpose: Wrapper for each page section with scroll animation hooks
Why custom: Layout/animation orchestration, not a UI component
Complexity: Low — div with CSS sticky + motion-v scroll binding
```

#### `ChatBubble.vue` (custom, simple)
```
Props: role (user|ai), content
Purpose: Neobrutalism-styled chat message bubbles
Why custom: Chat UI is domain-specific, no library covers this
Approach: Use neobrutalism-vue Card as base, add role-specific styling
User: white bg, shadow-right | AI: green bg, shadow-left
```

#### `PhotoGallery.vue` (custom, medium)
```
Props: images (BackgroundImage[])
Purpose: Horizontal-scrolling photo strip in "My Digital Space" section
Why custom: Horizontal scroll gallery with neo styling is domain-specific
Features:
  - Horizontal overflow container with CSS scroll-snap
  - Drag-to-scroll on desktop (motion-v drag gesture)
  - Swipe on mobile (native touch scroll)
  - Photo cards: thumbnail NuxtImg (quality="50", width=400) + note + title
  - Neo Card style: 2px black border, 4px offset shadow
  - On hover: shadow shifts, slight lift
  - Click emits selected photo index for lightbox
```

#### `PhotoLightbox.vue` (custom, medium)
```
Props: images (BackgroundImage[]), currentIndex, open (boolean)
Emits: close, navigate(index)
Purpose: Fullscreen overlay to view photos at full resolution
Why custom: Lightbox with neo styling + motion-v animations is domain-specific
Features:
  - Dark backdrop (bg-black/80) with neo close button (top-right)
  - Full-resolution NuxtImg (quality="90", original dimensions)
  - Title + note displayed below image
  - Left/right arrow navigation (keyboard ← → + click + swipe)
  - Escape to close
  - motion-v: AnimatePresence for enter/exit, scale from thumbnail → full
  - Mobile: pinch-to-zoom, swipe left/right to navigate
```

#### `NotionToc.vue` (custom, medium) — Notion-style right-side TOC
```
Props: links (TocLink[]), title?, activeId?, maxDepth (default 3),
       autoSpy (boolean), scrollBehavior ('smooth'|'instant'),
       variant ('floating'|'inline')
Purpose: Right-side sticky/fixed TOC with scroll-spy active heading tracking
Why custom: No library provides a floating scroll-spy TOC component
Positioning:
  - Blog posts: position: sticky in flex sidebar (content left, TOC right)
  - Homepage: position: fixed (sections span full width)
Styling: Borderless (Notion-faithful) — no card border, no shadow
  - Heading: JetBrains Mono, 12px, uppercase, muted
  - Links: Inter 13px, muted #4A4A4A; active: #E06C00, bold, left-border accent
  - Indent: H1=0, H2=0.75rem, H3=1.5rem; long text truncated with ellipsis
  - Max-height: calc(100vh - 8rem) with independent scroll
Visibility: xl+ (≥1280px) only; hidden on mobile (Sheet/Drawer fallback)
Data sources:
  - Homepage: static section array [{id:'hero', text:'Chat', depth:1}, ...]
  - Blog post: post.body.toc.links (from @nuxt/content)
Uses: useScrollSpy composable for active heading tracking
```

---

## 3. Component Migration Map

### DELETE (replaced by neobrutalism-vue or no longer needed)

| File | Reason |
|------|--------|
| `components/ui/Card.vue` | Replaced by neobrutalism-vue Card |
| `components/ui/GlassCard.vue` | Glassmorphism removed; use neo Card |
| `components/layouts/BackgroundLayout.vue` | Photo bg → solid color ScrollSection; photos move to gallery |
| `components/blog/TableOfContents.vue` | Replaced by custom `NotionToc.vue` with scroll-spy |
| `assets/css/glass-ui.css` | Entire glass design system removed |
| `tailwind.config.js` | Migrated to `@theme {}` in main.css (Tailwind v4) |

### REWRITE (significant logic or structure changes)

| File | What Changes |
|------|-------------|
| `pages/index.vue` | Complete rewrite → single-scroll page (Hero → Posts → My Digital Space → Tools → Footer) |
| `components/AppSidebar.vue` | Simplify → mobile-only cross-page Drawer (desktop in-page nav moves to NotionToc) |
| `composables/useSidebar.ts` | Simplify → mobile Drawer toggle only (scroll-spy logic moves to useScrollSpy) |
| `assets/css/main.css` | Rewrite → `@import "tailwindcss"` + `@theme {}` tokens |
| `composables/useBackgroundGallery.ts` | Rewrite → photo gallery data source (add more images, expose as list) |
| `components/content/ProsePre.vue` | Redesign → neobrutalism code block (see section 7) |
| `components/content/ProseGithub.vue` | Redesign → neobrutalism GitHub embed (see section 7) |

### RESTYLE (keep logic, update visuals)

| File | What Changes |
|------|-------------|
| `components/blog/BlogCard.vue` | Swap glass → neo Card + Badge for tags |
| `components/blog/BlogList.vue` | Minimal — just uses BlogCard |
| `components/blog/AnalyticsDisplay.vue` | Wrap with neo Badge |
| `components/blog/LikeButton.vue` | Use neo Button styling |
| `components/blog/RelatedArticles.vue` | Use neo Card for items |
| `components/chat/ChatView.vue` | Keep logic, swap to neo Card + ChatBubble |
| `components/chat/ChatInput.vue` | Wrap neo Input + Button |
| `components/chat/ChatMessage.vue` | Wrap with ChatBubble |
| `components/chat/ThinkingBlock.vue` | Neo styling |
| `components/CommentSection.vue` | Swap glass → neo Card + Input |
| `components/content/ProseCodeInline.vue` | Neo inline code styling |
| `components/content/ProseImg.vue` | Neo border + shadow on images |
| `components/content/RepoGithub.vue` | Neo Card styling |
| `components/content/VideoCard.vue` | Neo Card styling |
| `components/nav/ScrollTopIcon.vue` | Neo Button styling |
| `components/nav/ShareIcons.vue` | Neo styling |
| `components/ui/PageHeader.vue` | Neo typography + remove glass |
| `components/ui/RssButton.vue` | Use neo Button |
| `components/ui/VisitCounter.vue` | Wrap with neo Badge |
| `pages/about.vue` | Swap glass → neo Card, remove BackgroundLayout |
| `pages/contact.vue` | May redirect to /#space, or restyle with neo |
| `pages/blogs/index.vue` | Swap glass → neo components |
| `pages/blogs/[slug].vue` | Swap glass → neo Card, redesign code blocks, flex layout with sticky NotionToc sidebar |
| `pages/blogs/timeline.vue` | Neo styling |
| `pages/blogs/tags/index.vue` | Neo Badge styling |
| `pages/blogs/tags/[slug].vue` | Neo styling |
| `pages/tools/index.vue` | Neo Cards for tool grid |
| `pages/tools/base64.vue` | Neo styling |
| `pages/tools/json.vue` | Neo styling |
| `pages/tools/jwt.vue` | Neo styling |

### KEEP (no changes needed)

| File | Reason |
|------|--------|
| `composables/useChatty.ts` | Chat logic is separate from styling |
| `composables/useGoatCounter.ts` | Analytics unrelated to UI |
| `composables/useSlug.ts` | Utility, no UI |

> **Note**: `useBackgroundGallery.ts` moved to REWRITE — repurposed as photo gallery data source
| `components/icons/*.vue` | SVG icons are style-agnostic |
| `components/content/VideoEmbed.vue` | Embed logic unchanged |
| `components/layouts/PureLayout.vue` | Review, may still be useful for sub-pages |
| `pages/blogs/rss.xml.vue` | RSS feed, no UI |
| `pages/games/[slug].vue` | Separate feature |
| `site.config.ts` | Config data, not UI |

---

## 4. Files to Delete

```bash
# Components
rm components/ui/Card.vue
rm components/ui/GlassCard.vue
rm components/layouts/BackgroundLayout.vue
rm components/blog/TableOfContents.vue    # replaced by custom/NotionToc.vue

# Styles
rm assets/css/glass-ui.css

# Config (after migrating to @theme in main.css)
rm tailwind.config.js
```

**Total: 6 files deleted** (note: `useBackgroundGallery.ts` kept and rewritten for photo gallery)

---

## 5. Files to Create

```bash
# Custom components (6)
components/custom/SectionDivider.vue    # SVG diagonal slash between sections
components/custom/ScrollSection.vue     # Sticky section wrapper with scroll binding
components/custom/ChatBubble.vue        # Chat message bubble (wraps neo Card)
components/custom/PhotoGallery.vue      # Horizontal-scroll photo strip (neo Cards + drag)
components/custom/PhotoLightbox.vue     # Fullscreen photo viewer (full-res + nav)
components/custom/NotionToc.vue         # Notion-style right-side TOC with scroll-spy

# Composables
composables/useScrollAnimation.ts       # Wraps motion-v scroll + useInView
composables/useScrollSpy.ts             # Multi-element IntersectionObserver scroll-spy for NotionToc

# Plugin
plugins/lenis.client.ts                 # Lenis smooth scroll (client-only)

# neobrutalism-vue components (installed via CLI, into components/ui/)
# These are created by `npx shadcn-vue@latest add ...`
# Exact path depends on shadcn-vue init configuration
```

**Total: 9 files manually created + N components via CLI**

---

## 6. Files to Modify

### `nuxt.config.ts` — Module changes
```diff
  modules: [
    '@artmizu/nuxt-prometheus',
    '@nuxt/content',
    '@nuxt/eslint',
-   '@nuxtjs/tailwindcss',
+   '@tailwindcss/nuxt',
    '@nuxt/image',
    'nuxt-llms',
+   'motion-v/nuxt',
+   '@nuxtjs/google-fonts',
  ],
- css: ['/assets/css/main.css', '/assets/css/glass-ui.css'],
+ css: ['/assets/css/main.css'],
```

### `assets/css/main.css` — Tailwind v4 migration
```diff
- @tailwind base;
- @tailwind components;
- @tailwind utilities;
+ @import "tailwindcss";
+
+ @theme {
+   /* Colors, fonts, shadows — see 01-deps-investigation.md section 2 */
+ }
```

### `package.json` — Dependency changes
```diff
  devDependencies: {
-   "@nuxtjs/tailwindcss": "^6.13.0",
+   "@tailwindcss/nuxt": "latest",
+   "@nuxtjs/google-fonts": "latest",
  },
  dependencies: {
+   "motion-v": "latest",
+   "lenis": "latest",
-   "@wxperia/liquid-glass-vue": "^1.0.9",
  }
```

---

## 7. Code Block Rendering Redesign

### Current State

Two code rendering components exist:

1. **`ProsePre.vue`** — Renders fenced code blocks in markdown
   - Uses `vuejs-code-block` (CodeBlock component) with `oceanicNext` theme
   - Special C# handler using Prism.js
   - Glass-morphism overrides (dark bg, rounded corners, subtle borders)

2. **`ProseGithub.vue`** — Embeds code from GitHub URLs in markdown
   - Fetches raw code from `raw.githubusercontent.com`
   - Shows GitHub-style header (repo name, file path, "View on GitHub" link)
   - Uses same `vuejs-code-block` for rendering
   - Scroll-to-line highlighting
   - Max height with scroll

**Usage in markdown:**
```md
<!-- Fenced code block (ProsePre) -->
\`\`\`typescript
const x = 1
\`\`\`

<!-- GitHub embed (ProseGithub) -->
::ProseGithub
---
githubUrl: https://github.com/owner/repo/blob/main/src/file.ts
scrollToLine: 42
maxHeight: 400
---
::
```

### Problems with Current Implementation

1. **Inconsistent styling**: ProsePre and ProseGithub look different (different headers, borders)
2. **Glass-morphism**: Both have `!important` overrides fighting glass-ui.css — removing glass-ui.css will break these
3. **`vuejs-code-block` limitations**: Limited theming, hardcoded CSS classes (`css-1uawpjz`), no native neobrutalism support
4. **No copy button on regular code blocks**: Only C# handler has copy button; vuejs-code-block may not expose one consistently
5. **Heavy `!important` spam**: Both files are full of `!important` overrides to fight glass styles

### Target: Neobrutalism Code Blocks

Inspired by neobrutalism-vue's docs site and the neobrutalism design language:

```
┌──────────────────────────────────────────────────┐
│  ┌──────────┐                        ┌────────┐ │
│  │ file.ts  │                        │  Copy  │ │  ← Header: filename + copy button
│  └──────────┘                        └────────┘ │     2px black border bottom
├──────────────────────────────────────────────────┤
│                                                    │
│  1 │ const greeting = "hello"                     │  ← JetBrains Mono font
│  2 │ console.log(greeting)                        │     Line numbers in muted color
│  3 │                                               │     Dark bg (#1a1a2e or similar)
│  4 │ function add(a: number, b: number) {         │     Syntax highlighting (shiki)
│  5 │   return a + b                                │
│  6 │ }                                             │
│                                                    │
└──────────────────────────────────────────────────┘
  ↑ 2px black border + 4px 4px 0px #000 shadow (neobrutalism)
```

**For GitHub embeds (ProseGithub):**
```
┌──────────────────────────────────────────────────┐
│  ⬡ owner/repo                                     │
│  src/path/to/file.ts              [View on GitHub]│  ← GitHub header
├──────────────────────────────────────────────────┤
│  ┌──────────┐                        ┌────────┐ │
│  │ file.ts  │                        │  Copy  │ │  ← Same code block as above
│  └──────────┘                        └────────┘ │
├──────────────────────────────────────────────────┤
│  1 │ code here...                                  │
│  2 │ ...                                           │
│  ...                                               │
│  42│ ▓▓▓ highlighted line ▓▓▓                     │  ← scroll-to-line highlight
│  ...                                               │
└──────────────────────────────────────────────────┘
  ↑ Nested: GitHub card wraps code block
  ↑ Both have neo border + shadow
```

### Implementation Plan

#### Option A: Replace `vuejs-code-block` with Shiki (Recommended)

`@nuxt/content` already uses Shiki for syntax highlighting in markdown. We can:
1. Use Shiki directly (via `@nuxtjs/mdc` or `shiki` package) for consistent rendering
2. Build a thin neobrutalism wrapper around Shiki's HTML output
3. Remove `vuejs-code-block` and `prismjs` dependencies

**Advantages:**
- Single highlighter (Shiki) instead of two (Prism + vuejs-code-block)
- Better theme support (any VS Code theme)
- SSR-compatible (Shiki runs at build time)
- Smaller bundle (remove vuejs-code-block + prismjs)

#### Option B: Keep `vuejs-code-block`, restyle only

Restyle the existing component with neobrutalism CSS. Less work but keeps the dependency.

**Recommendation: Option A** — cleaner, removes 2 dependencies, consistent with @nuxt/content's built-in Shiki.

#### Concrete Changes

**`ProsePre.vue` redesign:**
- Remove `vuejs-code-block` import
- Remove Prism.js C# special-casing
- Use Shiki for all syntax highlighting (or just let @nuxt/content handle it and style the output)
- Neobrutalism wrapper: black border, offset shadow, dark bg
- Add copy button (all languages, not just C#)
- Add filename display from props
- Use JetBrains Mono font

**`ProseGithub.vue` redesign:**
- Keep: GitHub URL parsing, raw code fetching, scroll-to-line
- Replace: vuejs-code-block → Shiki-based rendering (or reuse ProsePre internally)
- Restyle: GitHub header with neo Card styling (black border, shadow)
- Restyle: "View on GitHub" link as neo Button
- Remove: All glass-ui override CSS (~100 lines of `!important` rules)

**Dependencies to remove:**
```bash
pnpm remove vuejs-code-block prismjs
```

**Dependencies to add (if needed):**
```bash
# Shiki may already be available via @nuxt/content
# Only install if using standalone:
pnpm add -D shiki
```

---

## 8. Route Structure

### Routes (preserved from current, with homepage restructured)

```
/                     → Single scroll page (Hero → Posts → My Digital Space → Tools → Footer)
/blogs                → Full blog listing (paginated, search, filter)
/blogs/[slug]         → Individual blog post (full article)
/blogs/tags           → Tag listing
/blogs/tags/[slug]    → Posts filtered by tag
/blogs/timeline       → Timeline view
/blogs/rss.xml        → RSS feed
/tools                → (Redirect to /#tools or keep separate page)
/tools/base64         → Base64 tool (standalone page)
/tools/json           → JSON editor (standalone page)
/tools/jwt            → JWT decoder (standalone page)
/contact              → (Redirect to /#space or keep separate page)
/about                → About page (standalone, linked from "My Digital Space" section)
/games/[slug]         → Games (unchanged)
```

### Navigation Strategy

```
From homepage scroll sections:
  - "View All Posts →"  navigates to  /blogs
  - Post card "Read Full →"  navigates to  /blogs/[slug]
  - Tool cards  navigate to  /tools/[tool]
  - "My Digital Space" link cards  are external links (email, github, linkedin)
  - "About"  navigates to  /about

Sub-pages (/blogs, /tools/*, /about) get:
  - Neobrutalist page header
  - "← Back to Home" link
  - Same neo design tokens
  - No scroll-driven animations (standard page layout)
```

---

## 9. Target Folder Structure

After migration, the project should look like:

```
frontend.x3huang.dev/
├── assets/
│   └── css/
│       └── main.css                    # Tailwind v4 @import + @theme tokens
│                                        # (glass-ui.css DELETED)
├── components/
│   ├── ui/                             # ← neobrutalism-vue components (via CLI)
│   │   ├── Button.vue                  #   installed as source files
│   │   ├── Card.vue                    #   (replaces old Card.vue)
│   │   ├── Input.vue
│   │   ├── Badge.vue
│   │   ├── Dialog.vue
│   │   ├── Drawer.vue
│   │   ├── Avatar.vue
│   │   ├── Separator.vue
│   │   ├── Tooltip.vue
│   │   ├── Tabs.vue
│   │   ├── Sheet.vue
│   │   ├── PageHeader.vue              #   (restyled, kept)
│   │   ├── RssButton.vue               #   (restyled)
│   │   └── VisitCounter.vue            #   (restyled)
│   │                                    #   (GlassCard.vue DELETED)
│   ├── custom/                         # ← our 6 custom components
│   │   ├── SectionDivider.vue
│   │   ├── ScrollSection.vue
│   │   ├── ChatBubble.vue
│   │   ├── PhotoGallery.vue            #   horizontal-scroll photo strip
│   │   ├── PhotoLightbox.vue           #   fullscreen photo viewer
│   │   └── NotionToc.vue              #   Notion-style right-side TOC + scroll-spy
│   ├── blog/                           # ← restyled, logic kept
│   │   ├── AnalyticsDisplay.vue
│   │   ├── BlogCard.vue
│   │   ├── BlogList.vue
│   │   ├── LikeButton.vue
│   │   └── RelatedArticles.vue
│   │                                    #   (TableOfContents.vue DELETED → NotionToc)
│   ├── chat/                           # ← restyled, logic kept
│   │   ├── ChatInput.vue
│   │   ├── ChatMessage.vue
│   │   ├── ChatView.vue
│   │   └── ThinkingBlock.vue
│   ├── content/                        # ← code blocks redesigned
│   │   ├── ProseCodeInline.vue
│   │   ├── ProseGithub.vue             #   REDESIGNED (neo + shiki)
│   │   ├── ProseImg.vue
│   │   ├── ProsePre.vue                #   REDESIGNED (neo + shiki)
│   │   ├── RepoGithub.vue
│   │   ├── VideoCard.vue
│   │   └── VideoEmbed.vue
│   ├── icons/                          # ← unchanged
│   │   └── *.vue
│   ├── layouts/
│   │   └── PureLayout.vue              #   (BackgroundLayout.vue DELETED)
│   ├── nav/
│   │   ├── ScrollTopIcon.vue
│   │   └── ShareIcons.vue
│   ├── AppSidebar.vue                  #   SIMPLIFIED (mobile-only cross-page Drawer)
│   ├── CommentSection.vue              #   restyled
│   └── Section.vue                     #   review / may merge with ScrollSection
├── composables/
│   ├── useChatty.ts                    # unchanged
│   ├── useGoatCounter.ts               # unchanged
│   ├── useBackgroundGallery.ts          # REWRITTEN — photo gallery data source
│   ├── useScrollAnimation.ts           # NEW — motion-v scroll + useInView wrapper
│   ├── useScrollSpy.ts                # NEW — IntersectionObserver scroll-spy for NotionToc
│   ├── useSidebar.ts                   # SIMPLIFIED — mobile Drawer toggle only
│   └── useSlug.ts                      # unchanged
├── plugins/
│   └── lenis.client.ts                 # NEW — Lenis smooth scroll
├── pages/                              # structure unchanged, all restyled
│   ├── index.vue                       # REWRITTEN — single scroll page
│   └── ...
├── nuxt.config.ts                      # MODIFIED — modules, css
├── site.config.ts                      # unchanged
├── components.json                     # NEW — shadcn-vue config (from init)
└── package.json                        # MODIFIED — deps
                                         # (tailwind.config.js DELETED)
```

---

## 10. Migration Phases

### Phase 1: Foundation (no visual changes yet, just infrastructure)
- [ ] **Tailwind v4 upgrade**: `pnpm remove @nuxtjs/tailwindcss` → `pnpm add -D @tailwindcss/nuxt tailwindcss@latest`
- [ ] Migrate `tailwind.config.js` → `@theme {}` in `main.css`
- [ ] Delete `tailwind.config.js`
- [ ] Update `main.css`: `@import "tailwindcss"` + verify all `@apply` directives
- [ ] Initialize shadcn-vue: `npx shadcn-vue@latest init`
- [ ] Install deps: `pnpm add motion-v lenis` + `pnpm add -D @nuxtjs/google-fonts`
- [ ] Create `plugins/lenis.client.ts`
- [ ] Update `nuxt.config.ts`: replace module, add `motion-v/nuxt`, `@nuxtjs/google-fonts`, remove `glass-ui.css` from css
- [ ] Configure Google Fonts (Space Grotesk, Inter, JetBrains Mono)
- [ ] Remove `@wxperia/liquid-glass-vue`: `pnpm remove @wxperia/liquid-glass-vue`
- [ ] Delete `assets/css/glass-ui.css`
- [ ] Rewrite `composables/useBackgroundGallery.ts` → export full image list (not just random) for photo gallery
- [ ] Verify app still compiles and runs (may look broken, that's OK)

### Phase 2: Component Library
- [ ] Install neobrutalism-vue components via CLI: Button, Card, Input, Badge, Dialog, Drawer, Sheet, Avatar, Separator, Tooltip
- [ ] Delete `components/ui/GlassCard.vue`
- [ ] Delete old `components/ui/Card.vue` (replaced by neo Card from CLI)
- [ ] Delete `components/layouts/BackgroundLayout.vue`
- [ ] Create `components/custom/SectionDivider.vue`
- [ ] Create `components/custom/ScrollSection.vue`
- [ ] Create `components/custom/ChatBubble.vue`
- [ ] Create `components/custom/PhotoGallery.vue` (horizontal-scroll strip, neo Cards, drag gesture)
- [ ] Create `components/custom/PhotoLightbox.vue` (fullscreen viewer, full-res, keyboard nav)

### Phase 3: Code Block Redesign
- [ ] Redesign `ProsePre.vue` — neobrutalism styling, add copy button for all languages
- [ ] Evaluate: replace `vuejs-code-block` + `prismjs` with Shiki
- [ ] Redesign `ProseGithub.vue` — neobrutalism GitHub header + code block
- [ ] Remove all `!important` glass-ui overrides
- [ ] If switching to Shiki: `pnpm remove vuejs-code-block prismjs`
- [ ] Restyle `ProseCodeInline.vue` — neo inline code style
- [ ] Test with existing blog posts that use `::ProseGithub` (at least 3 posts)

### Phase 4: Homepage Rebuild
- [ ] Rewrite `pages/index.vue` as single-scroll page
- [ ] Implement Section 1: Hero / Chatty
- [ ] Implement Section 2: Blog Posts with expand/collapse
- [ ] Implement Section 3: My Digital Space — link cards grid
- [ ] Implement Section 3: My Digital Space — photo gallery (PhotoGallery + PhotoLightbox)
- [ ] Implement Section 4: Tools
- [ ] Implement Section 5: Footer
- [ ] Add section dividers (SectionDivider) between sections

### Phase 5: Animation Layer
- [ ] Create `composables/useScrollAnimation.ts` (wraps motion-v scroll + useInView)
- [ ] Implement Lenis smooth scroll
- [ ] Implement CSS sticky + motion-v scroll() for section pinning/reveals
- [ ] Implement motion-v layout animation for post expand/collapse
- [ ] Add page load stagger animation sequence (motion-v)
- [ ] Test on mobile — verify useInView() triggers work with touch scroll
- [ ] **Evaluate**: If sticky + motion-v insufficient, add GSAP ScrollTrigger for Section 2
- [ ] Test scroll performance (Lighthouse, real devices)

### Phase 6: Navigation — Notion TOC + Mobile Drawer
- [ ] Create `composables/useScrollSpy.ts` — IntersectionObserver tracking which heading/section is in viewport
- [ ] Create `components/custom/NotionToc.vue` — right-side TOC with scroll-spy, hierarchy indent, active highlight
- [ ] Integrate NotionToc into homepage: fixed position, static section array, auto-spy
- [ ] Integrate NotionToc into blog post: sticky sidebar in flex layout, `post.body.toc.links`, auto-spy
- [ ] Restructure `pages/blogs/[slug].vue` layout: flex container (article + aside with sticky NotionToc)
- [ ] Delete `components/blog/TableOfContents.vue`
- [ ] Simplify `AppSidebar.vue` → mobile-only Drawer for cross-page nav (Home, Blogs, Tags, Tools, About)
- [ ] Simplify `composables/useSidebar.ts` → mobile Drawer toggle only
- [ ] Add mobile TOC Sheet (bottom variant) for blog post in-page nav on small screens
- [ ] Click-to-scroll: Lenis scrollTo() on TOC link click
- [ ] Keyboard accessibility (Tab through TOC links, Escape to close mobile Sheet)

### Phase 7: Sub-pages Restyle
- [ ] Restyle `/blogs/index.vue` (swap glass → neo components)
- [ ] Restyle `/blogs/[slug].vue` (neo Card, Badge for tags, neo code blocks)
- [ ] Restyle `/about.vue` (neo Card for content, remove glass prose)
- [ ] Restyle `/tools/*.vue` pages (neo Cards for tool grid)
- [ ] Restyle `/contact.vue` (may redirect to /#space section)
- [ ] Restyle remaining components: CommentSection, RelatedArticles, etc.
- [ ] Remove all glass-morphism classes, backdrop-blur, bg-white/XX patterns
- [ ] Update prose styling for neo theme (replace prose-glass, prose-white)

### Phase 8: Polish & Testing
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile testing (iOS Safari, Android Chrome)
- [ ] Performance audit (Lighthouse, bundle size)
- [ ] Accessibility audit (keyboard, screen reader)
- [ ] SEO verification (meta tags, structured data)
- [ ] Analytics integration verification
- [ ] Clean up unused CSS/components
- [ ] Final dependency audit — remove any unused packages
