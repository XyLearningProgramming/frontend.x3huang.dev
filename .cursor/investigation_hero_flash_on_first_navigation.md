# Investigation: Hero Section Flash on First Navigation

**Date:** 2026-02-27  
**Status:** Unresolved — all hypotheses falsified by runtime evidence  
**Symptom:** On the very first forward navigation (index → blog post), the hero section briefly flashes visible for 1–2 frames. Subsequent navigations and back-navigations work correctly.

---

## Summary

The page transition overlay (`usePageTransition.ts`) fades in a full-screen overlay before swapping pages via `navigateTo()`. Runtime instrumentation across 5 files and 173+ frames of continuous monitoring proved the overlay works perfectly at the JavaScript level. The flash persists even with an **instant** (zero-animation) overlay, ruling out all overlay timing, opacity, compositor, and DOM-level explanations.

This is likely a **browser rendering pipeline artifact** specific to the first-ever NuxtPage component swap (which requires chunk loading and takes ~900ms vs ~17ms for cached subsequent navigations), or a **Vite HMR dev-mode artifact** that would not occur in production.

---

## Falsified Hypotheses

### H1: Dynamic `gsap` import delay creates an unprotected gap ❌
**Theory:** First `await import('gsap')` takes longer, leaving `isTransitioning` false during the gap.  
**Evidence:** gsap import consistently takes 5–10ms (cached). No scroll or visual change during this window.

### H2: Lenis plugin `afterEach` fires `scrollTo(0)` before Lenis is stopped ❌
**Theory:** The Lenis `router.afterEach` scrolls to 0 before our transition freezes Lenis.  
**Evidence:** Every forward navigation log shows `isStopped: true` in the Lenis afterEach. The guard works correctly.

### H3: `useScrollSections._resolveHashOnLoad` scrolls during transition ❌
**Theory:** The scroll-sections composable's hash resolver fires during navigation and scrolls to a section.  
**Evidence:** `_resolveHashOnLoad` correctly detects `isPageTransitioning: true` and skips all scroll logic.

### H4: Browser `scrollRestoration: 'auto'` interferes with navigation ❌
**Theory:** The browser's automatic scroll restoration causes a jump during `history.pushState`.  
**Evidence:** `scrollRestoration: 'auto'` is set, but no unexpected scroll jumps were detected. The custom `router.options.ts` returns `false` from `scrollBehavior`, disabling Vue Router's scroll management entirely.

### H5: Overlay opacity < 1 during navigation (tween still running) ❌ → Fixed
**Theory:** The Phase 1 gsap tween overwrites our forced `opacity: 1` because it's still running.  
**Evidence:** CONFIRMED in early runs — opacity dropped to 0.9951 after `navigateTo`. **Fixed** by killing the Phase 1 tween before forcing opacity. However, fixing this did not resolve the hero flash.

### H6: First `display:none → block` compositor layer creation delay ❌
**Theory:** Switching from `display: none` to `display: block` requires the browser to create a new compositor layer, causing a 1–2 frame gap.  
**Evidence:** Changed to `visibility: hidden` (keeps compositor layer alive). Flash persisted. Also added `contain: strict` — no effect.

### H7: Pre-scroll to 0 triggers a recomposite that drops the overlay layer ❌
**Theory:** `window.scrollTo({ top: 0 })` forces a synchronous layout that temporarily invalidates the overlay.  
**Evidence:** Phase 1 frame monitor showed zero scroll changes during animation. The pre-scroll happens after the overlay is fully opaque. Flash existed both before and after adding the pre-scroll.

### H8: First component chunk load causes a DOM swap that invalidates the overlay layer ❌
**Theory:** The first `navigateTo` takes ~900ms (chunk loading). During this time, the Suspense/component swap briefly invalidates the overlay.  
**Evidence:** Phase 2 continuous frame monitor ran for **173 frames** during the 1750ms `navigateTo` with **zero anomalies**. Overlay computed opacity=1, visibility=visible, z-index=10000, element connected on every single frame.

### H9: HMR duplicate router guards prematurely fade out the overlay ❌ → Fixed
**Theory:** HMR re-evaluates `app.vue`, creating duplicate `beforeEach`/`afterEach` guards. The stale guard sees a new (false) `isTransitioning` ref and prematurely fades the overlay.  
**Evidence:** CONFIRMED — duplicate `beforeEach` fired with `isTransitioning: false`. **Fixed** by: (a) persisting singleton refs on `window` so all module instances share them, (b) cleaning up stale guards via `__cleanupTransitionGuards`. This fixed the "subsequent navigation" variant of the bug, but the first-navigation flash remained.

### H10: NuxtPage DOM swap invalidates overlay compositor layer (Teleport fix) ❌
**Theory:** The overlay, being a sibling of `<NuxtPage>` inside `<main>`, is affected by the major DOM mutation when NuxtPage swaps components. Moving it outside via `<Teleport to="body">` would isolate it.  
**Evidence:** Applied Teleport. Overlay confirmed at `parentTag: "BODY"`. Phase 2 monitor: 173 frames, zero anomalies. Flash persisted.

### H11: Flash happens during Phase 1 fade-in animation ❌
**Theory:** Something scrolls the page during the ~450ms Phase 1 fade-in, visible through the partially transparent overlay.  
**Evidence:** **Diagnostic test:** Skipped Phase 1 entirely — overlay set to instant opacity=1 (no animation). User **still** saw the flash. This definitively rules out the overlay system as the cause.

---

## What We Know for Certain

1. **The overlay works perfectly** — 173 frames monitored during `navigateTo`, zero anomalies (computed opacity=1, visibility=visible, z-index=10000, element connected, on every frame).
2. **No unexpected scrolls** — scroll jump detector active throughout, only detected intentional pre-scroll.
3. **Phase 1 animation is not the cause** — flash persists with instant (zero-animation) overlay.
4. **The flash is outside our JavaScript's control** — it cannot be detected or prevented by any overlay timing, opacity, z-index, compositor, or DOM-level fix.
5. **First navigation takes ~900ms** (chunk + data loading), subsequent take ~17ms. The flash only occurs on the first.

---

## Retained Improvements

While the root cause of the first-navigation flash remains unresolved, the investigation produced several real fixes that improved the transition system:

| Change | File | Purpose |
|--------|------|---------|
| Window-persisted singleton refs | `usePageTransition.ts` | Prevents HMR from creating duplicate `isTransitioning` refs |
| HMR guard cleanup | `app.vue` | Prevents duplicate `beforeEach`/`afterEach` accumulation across HMR cycles |
| Phase 1 tween kill | `usePageTransition.ts` | Prevents running tween from overwriting forced `opacity: 1` |
| Pre-scroll to 0 | `usePageTransition.ts` | Eliminates scroll-position clamping when tall index DOM swaps for shorter blog page |
| `visibility: hidden` | CSS + JS | Keeps compositor layer alive between transitions |
| Teleport to `<body>` | `app.vue` | Isolates overlay from NuxtPage DOM mutations |

---

## Possible Future Directions

- **Test in production build** — If the flash doesn't occur in `nuxt build && nuxt preview`, it's a Vite HMR dev-mode artifact and can be ignored.
- **Browser DevTools "Rendering" → Paint flashing** — Enable paint flash rectangles to visually identify what repaints during the first navigation.
- **`chrome://tracing`** — Capture a Chrome trace during the first navigation to see compositor layer creation/destruction at the GPU level.
- **Investigate Nuxt `<Suspense>` internals** — The first-ever async page resolution in `<NuxtPage>` may trigger a unique rendering path not observable from JavaScript.
- **Set `history.scrollRestoration = 'manual'` globally** — Untested; might prevent browser-level scroll interference.
