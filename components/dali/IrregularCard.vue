<script setup lang="ts">
/**
 * IrregularCard — A card with a randomized clip-path and slight rotation.
 * Each instance gets a unique "warped rectangle" shape via seeded randomness.
 */

interface Props {
  /** Seed for deterministic randomness (use index or id) */
  seed?: number
  /** Base rotation in degrees (will be jittered) */
  rotation?: number
  /** Accent color for the border (defaults to dali-red) */
  accentColor?: string
  /** Whether the card is interactive (hover effects) */
  interactive?: boolean
  /** Tag for the root element */
  tag?: string
}

const props = withDefaults(defineProps<Props>(), {
  seed: 0,
  rotation: 0,
  accentColor: 'var(--color-dali-red)',
  interactive: true,
  tag: 'div',
})

// Simple seeded pseudo-random
function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const rng = seededRandom(props.seed + 42)

// Generate slightly irregular polygon (warped rectangle)
// Each corner is offset by 0-4% from the perfect rectangle position
function generateClipPath(): string {
  const jitter = () => Math.round(rng() * 4)
  const tl = `${jitter()}% ${jitter()}%`
  const tr = `${100 - jitter()}% ${jitter()}%`
  const br = `${100 - jitter()}% ${100 - jitter()}%`
  const bl = `${jitter()}% ${100 - jitter()}%`
  return `polygon(${tl}, ${tr}, ${br}, ${bl})`
}

// Generate slight rotation jitter
const rotationJitter = (rng() - 0.5) * 3 // -1.5 to +1.5 deg
const finalRotation = props.rotation + rotationJitter

const clipPath = generateClipPath()

const cardStyle = computed(() => ({
  clipPath,
  transform: `rotate(${finalRotation}deg)`,
  borderColor: props.accentColor,
  '--card-accent': props.accentColor,
}))
</script>

<template>
  <component
    :is="tag"
    class="dali-irregular-card"
    :class="{ 'dali-irregular-card--interactive': interactive }"
    :style="cardStyle"
  >
    <!-- Inner content wrapper (un-clips content for readability) -->
    <div class="dali-irregular-card__inner">
      <slot />
    </div>
  </component>
</template>

<style scoped>
.dali-irregular-card {
  position: relative;
  background: var(--color-dali-smoke);
  border: 2px solid var(--card-accent, var(--color-dali-red));
  box-shadow: 4px 4px 0px 0px var(--card-accent, var(--color-dali-red));
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 0.25s ease;
  will-change: transform;
  /* Card has dark bg — override muted text to be lighter for readability */
  --color-dali-muted: rgba(240, 237, 229, 0.55);
  color: var(--color-dali-white, #F0EDE5);
}

.dali-irregular-card--interactive:hover {
  transform: translate(-6px, -6px) rotate(var(--hover-rotate, -0.5deg));
  box-shadow: 8px 8px 0px 0px var(--card-accent, var(--color-dali-red));
  z-index: 10;
}

.dali-irregular-card--interactive:active {
  transform: translate(0, 0) rotate(0deg);
  box-shadow: 2px 2px 0px 0px var(--card-accent, var(--color-dali-red));
}

.dali-irregular-card__inner {
  padding: 1.25rem;
}
</style>
