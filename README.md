# Frontend of x3huang.dev

## Project Layout

```
pages/
  index.vue              ← Thin orchestrator: chat fly-animation, focus panel wiring, lifecycle

components/
  index/                 ← Homepage sections (each owns its own GSAP scroll animations)
    HeroSection.vue        Hero: avatar, name, motto, chat input
    PostsSection.vue       Blog posts grid, "View All" expansion + search
    SpaceSection.vue       Gallery, About & Contact cards
    ToolsSection.vue       Dev tools grid
    FooterSection.vue      Footer
    FocusContent.vue       Focus panel content (post detail, about, contact, gallery)
    MobileNav.vue          Mobile nav FAB + overlay
  chat/                  ← Chat UI
    ChatView.vue           Full chat surface (messages + input)
    ChatInput.vue          Reusable chat input bar
    ChatMessage.vue        Single message bubble
    ThinkingBlock.vue      AI thinking indicator
  dali/                  ← Canvas/layout primitives
    DaliCanvas.vue         2-column canvas (discovery ↔ focus) + color flow
    IrregularCard.vue      Surrealist card component
    RulerToc.vue           Ruler-style table of contents

composables/
  useCanvasCamera.ts     Camera pan between discovery & focus columns
  useFocusPanel.ts       Panel stack, hash routing, scroll preservation
  useChatty.ts           Chat API client (SSE streaming)
  useColorFlow.ts        Scroll-scrubbed background color interpolation
  useGoatCounter.ts      Analytics
```
