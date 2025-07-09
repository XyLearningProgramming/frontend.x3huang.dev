interface BackgroundImage {
  url: string
  note?: string
  title?: string
}

export const useBackgroundGallery = () => {
  const backgroundImages: BackgroundImage[] = [
    {
      url: '/images/bg_20250630.jpg',
      note: "Petals cradle the echoes of a temple's chime",
      title: "Zhenru Temple, photographed by Yu",
    },
    // Add more background images here as needed
    // {
    //   url: '/images/bg_20250631.jpg',
    //   note: 'Your photo description here',
    //   title: 'Photo Title'
    // },
  ]

  const getRandomBackground = (): BackgroundImage | null => {
    if (backgroundImages.length === 0) return null
    // For hydration consistency, use the first image instead of random
    // TODO: Re-enable random selection later with proper hydration handling
    return backgroundImages[0]
  }

  // Initialize with the first background to ensure server/client consistency
  const currentBackground = ref<BackgroundImage | null>(
    backgroundImages.length > 0 ? backgroundImages[0] : null
  )

  const initializeBackground = () => {
    // Only update if not already initialized (to prevent hydration issues)
    if (!currentBackground.value) {
      currentBackground.value = getRandomBackground()
    }
  }

  return {
    currentBackground,
    initializeBackground,
    getRandomBackground
  }
}