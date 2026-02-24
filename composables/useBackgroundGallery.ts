export interface GalleryImage {
  url: string
  note?: string
  title?: string
  alt?: string
}

export const usePhotoGallery = () => {
  const images: GalleryImage[] = [
    {
      url: '/images/bg_20250630.jpg',
      note: "Petals cradle the echoes of a temple's chime",
      title: 'Zhenru Temple, photographed by Yu',
      alt: 'Zhenru Temple flowers',
    },
    // Add more photos here as the collection grows
  ]

  return {
    images,
  }
}
