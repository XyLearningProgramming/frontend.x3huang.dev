export interface ScrollSpySection {
  id: string
  label: string
}

export const useScrollSpy = (sectionIds: Ref<string[]> | string[]) => {
  const activeId = ref<string>('')

  const ids = computed(() => {
    return Array.isArray(sectionIds) ? sectionIds : sectionIds.value
  })

  let observer: IntersectionObserver | null = null

  const setup = () => {
    if (!import.meta.client) return

    cleanup()

    observer = new IntersectionObserver(
      (entries) => {
        // Find the first entry that is intersecting
        for (const entry of entries) {
          if (entry.isIntersecting) {
            activeId.value = entry.target.id
            break
          }
        }
      },
      {
        rootMargin: '-10% 0px -80% 0px',
        threshold: 0,
      },
    )

    for (const id of ids.value) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
  }

  const cleanup = () => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }

  onMounted(() => {
    // Slight delay to ensure DOM is settled
    nextTick(() => setup())
  })

  onUnmounted(() => {
    cleanup()
  })

  // Re-setup when section IDs change
  watch(ids, () => {
    nextTick(() => setup())
  })

  return {
    activeId,
  }
}
