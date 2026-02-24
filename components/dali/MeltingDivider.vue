<script setup lang="ts">
/**
 * MeltingDivider — SVG section divider with a Salvador Dalí melting/dripping motif.
 * Sits between sections to create surrealist transitions.
 */

interface Props {
  /** Divider variant */
  variant?: 'melt' | 'slash' | 'wave'
  /** Primary color */
  color?: string
  /** Height of the divider */
  height?: number
  /** Flip vertically */
  flip?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'melt',
  color: 'var(--color-dali-red)',
  height: 80,
  flip: false,
})
</script>

<template>
  <div
    class="melting-divider"
    :class="[
      `melting-divider--${variant}`,
      { 'melting-divider--flip': flip },
    ]"
    :style="{ height: `${height}px` }"
    aria-hidden="true"
  >
    <!-- Melt variant: dripping blobs -->
    <svg
      v-if="variant === 'melt'"
      class="melting-svg"
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
    >
      <path
        :fill="color"
        d="M0,0 L0,20 Q60,80 120,30 Q180,0 240,25 Q300,60 360,20 Q420,0 480,35
           Q540,70 600,25 Q660,0 720,40 Q780,75 840,20 Q900,0 960,30
           Q1020,65 1080,15 Q1140,0 1200,35 Q1260,60 1320,10 Q1380,0 1440,25
           L1440,0 Z"
        opacity="0.15"
      />
      <path
        :fill="color"
        d="M0,0 L0,10 Q80,50 160,15 Q240,0 320,30 Q400,55 480,10
           Q560,0 640,35 Q720,60 800,15 Q880,0 960,25 Q1040,50 1120,10
           Q1200,0 1280,30 Q1360,45 1440,15 L1440,0 Z"
        opacity="0.3"
      />
      <!-- Drip accents -->
      <ellipse cx="200" cy="40" rx="3" ry="12" :fill="color" opacity="0.5" />
      <ellipse cx="520" cy="50" rx="2" ry="18" :fill="color" opacity="0.4" />
      <ellipse cx="780" cy="45" rx="3" ry="15" :fill="color" opacity="0.6" />
      <ellipse cx="1100" cy="35" rx="2" ry="10" :fill="color" opacity="0.3" />
      <ellipse cx="1350" cy="42" rx="3" ry="14" :fill="color" opacity="0.5" />
    </svg>

    <!-- Slash variant: P5-style diagonal cuts -->
    <svg
      v-else-if="variant === 'slash'"
      class="melting-svg"
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
    >
      <polygon :fill="color" points="0,0 200,80 180,80 0,10" opacity="0.2" />
      <polygon :fill="color" points="300,0 500,80 480,80 280,0" opacity="0.15" />
      <polygon :fill="color" points="550,0 750,80 730,80 530,0" opacity="0.25" />
      <polygon :fill="color" points="800,0 1000,80 980,80 780,0" opacity="0.1" />
      <polygon :fill="color" points="1050,0 1250,80 1230,80 1030,0" opacity="0.2" />
      <polygon :fill="color" points="1300,0 1440,56 1440,80 1280,0" opacity="0.15" />
      <!-- Thin accent lines -->
      <line x1="100" y1="0" x2="300" y2="80" :stroke="color" stroke-width="1" opacity="0.4" />
      <line x1="700" y1="0" x2="900" y2="80" :stroke="color" stroke-width="1" opacity="0.4" />
      <line x1="1200" y1="0" x2="1400" y2="80" :stroke="color" stroke-width="1" opacity="0.4" />
    </svg>

    <!-- Wave variant: surrealist undulating wave -->
    <svg
      v-else-if="variant === 'wave'"
      class="melting-svg"
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
    >
      <path
        :fill="color"
        d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,0 L0,0 Z"
        opacity="0.12"
      />
      <path
        :fill="color"
        d="M0,30 C180,60 360,10 540,30 C720,50 900,10 1080,30 C1260,50 1380,20 1440,30 L1440,0 L0,0 Z"
        opacity="0.2"
      />
    </svg>
  </div>
</template>

<style scoped>
.melting-divider {
  width: 100%;
  position: relative;
  overflow: hidden;
  pointer-events: none;
  z-index: 1;
}

.melting-divider--flip {
  transform: scaleY(-1);
}

.melting-svg {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
