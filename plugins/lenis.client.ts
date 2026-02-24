import Lenis from 'lenis'

export default defineNuxtPlugin(() => {
  const lenis = new Lenis({
    autoRaf: true,
  })

  return {
    provide: {
      lenis,
    },
  }
})
