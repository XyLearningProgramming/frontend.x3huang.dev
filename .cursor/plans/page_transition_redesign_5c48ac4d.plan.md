---
name: Page Transition Redesign
overview: Replace the existing wave/melt/slash section dividers with a seamless scroll-driven background color gradient system that transitions from light yellow to dark blue, with all element animations being fully reversible via GSAP ScrollTrigger.
todos:
  - id: color-tokens
    content: Add color flow palette tokens to main.css
    status: completed
  - id: composable
    content: Create useColorFlow composable with GSAP scroll-driven color interpolation
    status: completed
    dependencies:
      - color-tokens
  - id: canvas-integration
    content: Integrate useColorFlow into DaliCanvas.vue
    status: completed
    dependencies:
      - composable
  - id: index-cleanup
    content: Remove MeltingDividers from index.vue, wire up color flow sections
    status: completed
    dependencies:
      - canvas-integration
  - id: delete-old
    content: Delete MeltingDivider.vue and SlashTransition.vue
    status: completed
    dependencies:
      - index-cleanup
  - id: polish
    content: Fine-tune transition zones, colors, and ensure reversibility
    status: completed
    dependencies:
      - delete-old
---

# Page Transition Redesign — Seamless Color Flow

## Concept

Replace the explicit `DaliMeltingDivider` components with a **scroll-driven background color gradient** that smoothly interpolates between a configurable palette of colors as the user scrolls. Each section maintains a solid background while scrolling within it, but the color **blends** between sections in the transition zones. All element animations remain fully reversible.

**Color journey**: Light Yellow → Warm Gold → Muted Teal → Deep Violet → Dark Blue (configurable in one place).

## Key Files to Change

1. **New: [`composables/useColorFlow.ts`](composables/useColorFlow.ts)** — Central composable that defines the color stops, uses GSAP ScrollTrigger to interpolate background color based on scroll position. Fully configurable palette in one place.

2. **[`components/dali/DaliCanvas.vue`](components/dali/DaliCanvas.vue)** — Apply the dynamic background color from `useColorFlow` to the discovery column. The canvas viewport will receive the interpolated color as a CSS variable.

3. **[`pages/index.vue`](pages/index.vue)** — Remove all `<DaliMeltingDivider>` components. Remove explicit section background colors. Initialize `useColorFlow` with section anchors. Keep all GSAP element animations (already reversible with `toggleActions: 'play none none reverse'`).

4. **[`assets/css/main.css`](assets/css/main.css)** — Add the color flow palette tokens (`--color-flow-*`) as a dedicated section.

5. **Delete [`components/dali/MeltingDivider.vue`](components/dali/MeltingDivider.vue)** and **[`components/dali/SlashTransition.vue`](components/dali/SlashTransition.vue)** — No longer needed.

## How It Works

- `useColorFlow` defines an array of `{ sectionId, color }` stops
- On mount, it creates a GSAP ScrollTrigger for each transition zone (the gap between sections)
- It uses `gsap.utils.interpolate()` to blend between adjacent colors based on scroll progress
- The interpolated color is set as a CSS custom property `--color-flow-bg` on the canvas
- Sections are transparent — they inherit the flowing background
- The flow is **automatically reversible** since ScrollTrigger scrub works in both directions