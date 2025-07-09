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
    const randomIndex = Math.floor(Math.random() * backgroundImages.length)
    return backgroundImages[randomIndex]
  }

  const currentBackground = ref<BackgroundImage | null>(null)

  const initializeBackground = () => {
    currentBackground.value = getRandomBackground()
  }

  return {
    currentBackground,
    initializeBackground,
    getRandomBackground
  }
}