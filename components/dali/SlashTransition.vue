<script setup lang="ts">
/**
 * SlashTransition — P5-style diagonal slash overlay transition.
 * Used when transitioning between discovery and focus mode.
 */

interface Props {
  /** Whether the transition is active */
  active?: boolean
  /** Color of the slashes */
  color?: string
}

withDefaults(defineProps<Props>(), {
  active: false,
  color: 'var(--color-dali-red)',
})
</script>

<template>
  <Teleport to="body">
    <Transition name="slash">
      <div
        v-if="active"
        class="slash-overlay"
        aria-hidden="true"
      >
        <div class="slash-stripe slash-stripe--1" :style="{ background: color }" />
        <div class="slash-stripe slash-stripe--2" :style="{ background: color }" />
        <div class="slash-stripe slash-stripe--3" :style="{ background: color }" />
        <div class="slash-stripe slash-stripe--4" :style="{ background: color }" />
        <div class="slash-stripe slash-stripe--5" :style="{ background: color }" />
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.slash-overlay {
  position: fixed;
  inset: 0;
  z-index: 9998;
  pointer-events: none;
  overflow: hidden;
}

.slash-stripe {
  position: absolute;
  width: 200%;
  height: 120%;
  top: -10%;
  left: -50%;
  transform-origin: center center;
  transform: rotate(-45deg) translateY(100%);
  opacity: 0;
}

/* Staggered entrance */
.slash-enter-active .slash-stripe {
  animation: slashIn 0.4s cubic-bezier(0.7, 0, 0.3, 1) forwards;
}
.slash-leave-active .slash-stripe {
  animation: slashOut 0.3s cubic-bezier(0.7, 0, 0.3, 1) forwards;
}

.slash-stripe--1 { animation-delay: 0ms; opacity: 0.1; height: 30%; }
.slash-stripe--2 { animation-delay: 50ms; opacity: 0.15; height: 25%; top: 20%; }
.slash-stripe--3 { animation-delay: 100ms; opacity: 0.2; height: 35%; top: 35%; }
.slash-stripe--4 { animation-delay: 150ms; opacity: 0.15; height: 28%; top: 55%; }
.slash-stripe--5 { animation-delay: 200ms; opacity: 0.1; height: 32%; top: 70%; }

@keyframes slashIn {
  0% {
    transform: rotate(-45deg) translateY(100%);
    opacity: 0;
  }
  50% {
    opacity: 0.3;
  }
  100% {
    transform: rotate(-45deg) translateY(-100%);
    opacity: 0;
  }
}

@keyframes slashOut {
  0% {
    transform: rotate(-45deg) translateY(0%);
    opacity: 0.2;
  }
  100% {
    transform: rotate(-45deg) translateY(-100%);
    opacity: 0;
  }
}

.slash-enter-active {
  animation: none;
}
.slash-leave-active {
  animation: none;
}
.slash-enter-from, .slash-leave-to {
  opacity: 0;
}
</style>
