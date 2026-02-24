/**
 * Composable for scroll-triggered animation variants.
 * Use with motion-v's `v-motion` directive or `<Motion>` component.
 *
 * Provides both "visibleOnce" (animate on first enter) and "enter/leave"
 * (animate in and out as elements enter/leave viewport) presets.
 */

export type AnimationPreset =
  | 'fadeUp'
  | 'fadeLeft'
  | 'fadeRight'
  | 'fadeIn'
  | 'scaleUp'
  | 'slideUp'
  | 'flyInLeft'
  | 'flyInRight'
  | 'flyInBottom'
  | 'flyOut'
  | 'floatIn'
  | 'springBounce'
  | 'tiltIn'

export interface ScrollAnimationOptions {
  delay?: number
  duration?: number
  distance?: number
}

export const useScrollAnimation = () => {
  const presets: Record<AnimationPreset, (opts?: ScrollAnimationOptions) => {
    initial: Record<string, number>
    visibleOnce: Record<string, number | object>
    enter?: Record<string, number | object>
    leave?: Record<string, number | object>
  }> = {
    fadeUp: (opts = {}) => ({
      initial: { opacity: 0, y: opts.distance ?? 40 },
      visibleOnce: {
        opacity: 1,
        y: 0,
        transition: {
          duration: opts.duration ?? 600,
          delay: opts.delay ?? 0,
        },
      },
    }),
    fadeLeft: (opts = {}) => ({
      initial: { opacity: 0, x: -(opts.distance ?? 40) },
      visibleOnce: {
        opacity: 1,
        x: 0,
        transition: {
          duration: opts.duration ?? 600,
          delay: opts.delay ?? 0,
        },
      },
    }),
    fadeRight: (opts = {}) => ({
      initial: { opacity: 0, x: opts.distance ?? 40 },
      visibleOnce: {
        opacity: 1,
        x: 0,
        transition: {
          duration: opts.duration ?? 600,
          delay: opts.delay ?? 0,
        },
      },
    }),
    fadeIn: (opts = {}) => ({
      initial: { opacity: 0 },
      visibleOnce: {
        opacity: 1,
        transition: {
          duration: opts.duration ?? 600,
          delay: opts.delay ?? 0,
        },
      },
    }),
    scaleUp: (opts = {}) => ({
      initial: { opacity: 0, scale: 0.85 },
      visibleOnce: {
        opacity: 1,
        scale: 1,
        transition: {
          duration: opts.duration ?? 500,
          delay: opts.delay ?? 0,
          type: 'spring',
          stiffness: 200,
          damping: 15,
        },
      },
    }),
    slideUp: (opts = {}) => ({
      initial: { opacity: 0, y: opts.distance ?? 60 },
      visibleOnce: {
        opacity: 1,
        y: 0,
        transition: {
          duration: opts.duration ?? 700,
          delay: opts.delay ?? 0,
        },
      },
    }),

    // === New flying animation presets ===

    flyInLeft: (opts = {}) => ({
      initial: { opacity: 0, x: -(opts.distance ?? 120) },
      visibleOnce: {
        opacity: 1,
        x: 0,
        transition: {
          duration: opts.duration ?? 800,
          delay: opts.delay ?? 0,
          type: 'spring',
          stiffness: 100,
          damping: 14,
        },
      },
      enter: {
        opacity: 1,
        x: 0,
        transition: {
          duration: opts.duration ?? 800,
          delay: opts.delay ?? 0,
          type: 'spring',
          stiffness: 100,
          damping: 14,
        },
      },
      leave: {
        opacity: 0,
        y: -(opts.distance ?? 80),
        transition: { duration: 400 },
      },
    }),

    flyInRight: (opts = {}) => ({
      initial: { opacity: 0, x: opts.distance ?? 120 },
      visibleOnce: {
        opacity: 1,
        x: 0,
        transition: {
          duration: opts.duration ?? 800,
          delay: opts.delay ?? 0,
          type: 'spring',
          stiffness: 100,
          damping: 14,
        },
      },
      enter: {
        opacity: 1,
        x: 0,
        transition: {
          duration: opts.duration ?? 800,
          delay: opts.delay ?? 0,
          type: 'spring',
          stiffness: 100,
          damping: 14,
        },
      },
      leave: {
        opacity: 0,
        y: -(opts.distance ?? 80),
        transition: { duration: 400 },
      },
    }),

    flyInBottom: (opts = {}) => ({
      initial: { opacity: 0, y: opts.distance ?? 100 },
      visibleOnce: {
        opacity: 1,
        y: 0,
        transition: {
          duration: opts.duration ?? 800,
          delay: opts.delay ?? 0,
          type: 'spring',
          stiffness: 120,
          damping: 16,
        },
      },
      enter: {
        opacity: 1,
        y: 0,
        transition: {
          duration: opts.duration ?? 800,
          delay: opts.delay ?? 0,
          type: 'spring',
          stiffness: 120,
          damping: 16,
        },
      },
      leave: {
        opacity: 0,
        y: -(opts.distance ?? 60),
        transition: { duration: 350 },
      },
    }),

    flyOut: (opts = {}) => ({
      initial: { opacity: 1, y: 0 },
      visibleOnce: {
        opacity: 0,
        y: -(opts.distance ?? 80),
        transition: {
          duration: opts.duration ?? 400,
          delay: opts.delay ?? 0,
        },
      },
    }),

    floatIn: (opts = {}) => ({
      initial: { opacity: 0, scale: 0.9, y: opts.distance ?? 30 },
      visibleOnce: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
          duration: opts.duration ?? 900,
          delay: opts.delay ?? 0,
          type: 'spring',
          stiffness: 80,
          damping: 12,
        },
      },
    }),

    springBounce: (opts = {}) => ({
      initial: { opacity: 0, scale: 0.6, y: opts.distance ?? 40 },
      visibleOnce: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
          duration: opts.duration ?? 700,
          delay: opts.delay ?? 0,
          type: 'spring',
          stiffness: 300,
          damping: 10,
        },
      },
    }),

    tiltIn: (opts = {}) => ({
      initial: { opacity: 0, rotate: opts.distance ?? -5, scale: 0.95 },
      visibleOnce: {
        opacity: 1,
        rotate: 0,
        scale: 1,
        transition: {
          duration: opts.duration ?? 600,
          delay: opts.delay ?? 0,
          type: 'spring',
          stiffness: 150,
          damping: 12,
        },
      },
    }),
  }

  const getAnimation = (preset: AnimationPreset, opts?: ScrollAnimationOptions) => {
    return presets[preset](opts)
  }

  /**
   * Generate staggered animations for a list of items.
   * Returns an array of animation configs with incremental delays.
   */
  const getStaggered = (
    preset: AnimationPreset,
    count: number,
    opts?: ScrollAnimationOptions & { staggerMs?: number },
  ) => {
    const stagger = opts?.staggerMs ?? 100
    return Array.from({ length: count }, (_, i) =>
      presets[preset]({ ...opts, delay: (opts?.delay ?? 0) + i * stagger }),
    )
  }

  /**
   * Alternating left/right fly-in for card grids.
   */
  const getAlternating = (
    count: number,
    opts?: ScrollAnimationOptions & { staggerMs?: number },
  ) => {
    const stagger = opts?.staggerMs ?? 120
    return Array.from({ length: count }, (_, i) => {
      const preset: AnimationPreset = i % 2 === 0 ? 'flyInLeft' : 'flyInRight'
      return presets[preset]({ ...opts, delay: (opts?.delay ?? 0) + i * stagger })
    })
  }

  return {
    getAnimation,
    getStaggered,
    getAlternating,
    presets,
  }
}
