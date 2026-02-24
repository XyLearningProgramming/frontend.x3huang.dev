<script setup lang="ts">
/**
 * FloatingShapes — Decorative neo-bordered shapes that drift in parallax on scroll.
 * Placed between content sections to add depth and playfulness.
 */

interface FloatingShape {
  type: 'circle' | 'square' | 'diamond' | 'cross'
  size: number
  x: string // CSS position (e.g., '10%', '85%')
  y: string // CSS position
  color: string
  speed: number // parallax speed multiplier (0.2 = slow, 1 = fast)
  rotate: number
  delay: number // animation delay
}

withDefaults(defineProps<{
  shapes?: FloatingShape[]
}>(), {
  shapes: () => [
    { type: 'circle', size: 40, x: '5%', y: '15%', color: 'var(--color-neo-yellow)', speed: 0.3, rotate: 0, delay: 0 },
    { type: 'square', size: 30, x: '90%', y: '25%', color: 'var(--color-neo-pink)', speed: 0.5, rotate: 15, delay: 200 },
    { type: 'diamond', size: 24, x: '15%', y: '55%', color: 'var(--color-neo-cyan)', speed: 0.4, rotate: 45, delay: 400 },
    { type: 'cross', size: 28, x: '80%', y: '70%', color: 'var(--color-neo-green)', speed: 0.6, rotate: -10, delay: 100 },
    { type: 'circle', size: 20, x: '50%', y: '40%', color: 'var(--color-neo-purple)', speed: 0.35, rotate: 0, delay: 300 },
    { type: 'square', size: 18, x: '70%', y: '10%', color: 'var(--color-neo-orange)', speed: 0.45, rotate: 30, delay: 500 },
  ],
})

const scrollY = ref(0)

function onScroll() {
  scrollY.value = window.scrollY
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})

function getTransform(shape: FloatingShape) {
  const parallaxY = scrollY.value * shape.speed * -0.15
  return `translate(0, ${parallaxY}px) rotate(${shape.rotate}deg)`
}
</script>

<template>
  <div class="floating-shapes-container absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
    <div
      v-for="(shape, idx) in shapes"
      :key="idx"
      class="floating-shape absolute"
      :style="{
        left: shape.x,
        top: shape.y,
        width: `${shape.size}px`,
        height: `${shape.size}px`,
        transform: getTransform(shape),
        animationDelay: `${shape.delay}ms`,
      }"
    >
      <!-- Circle -->
      <div
        v-if="shape.type === 'circle'"
        class="w-full h-full rounded-full border-2 border-neo-black floating-anim"
        :style="{ backgroundColor: shape.color, animationDelay: `${shape.delay}ms` }"
      />
      <!-- Square -->
      <div
        v-else-if="shape.type === 'square'"
        class="w-full h-full border-2 border-neo-black floating-anim"
        :style="{ backgroundColor: shape.color, animationDelay: `${shape.delay}ms` }"
      />
      <!-- Diamond -->
      <div
        v-else-if="shape.type === 'diamond'"
        class="w-full h-full border-2 border-neo-black floating-anim"
        :style="{ backgroundColor: shape.color, transform: 'rotate(45deg)', animationDelay: `${shape.delay}ms` }"
      />
      <!-- Cross -->
      <div
        v-else-if="shape.type === 'cross'"
        class="relative w-full h-full floating-anim"
        :style="{ animationDelay: `${shape.delay}ms` }"
      >
        <div
          class="absolute left-1/2 top-0 w-[30%] h-full -translate-x-1/2 border-2 border-neo-black"
          :style="{ backgroundColor: shape.color }"
        />
        <div
          class="absolute top-1/2 left-0 h-[30%] w-full -translate-y-1/2 border-2 border-neo-black"
          :style="{ backgroundColor: shape.color }"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.floating-anim {
  animation: floatGently 6s ease-in-out infinite;
}

@keyframes floatGently {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  33% {
    transform: translateY(-6px) rotate(2deg);
  }
  66% {
    transform: translateY(4px) rotate(-1deg);
  }
}

.floating-shape {
  opacity: 0.35;
  transition: transform 0.1s linear;
}
</style>
