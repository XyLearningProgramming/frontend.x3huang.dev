export interface GalleryImage {
  url: string
  note?: string
  title?: string
  alt?: string
  /** Original image width in pixels — used for aspect-ratio hints to prevent layout shift */
  width?: number
  /** Original image height in pixels — used for aspect-ratio hints to prevent layout shift */
  height?: number
}

export const usePhotoGallery = () => {
  const images: GalleryImage[] = [
    {
      url: '/images/bg_20250630.jpg',
      note: "Petals cradle the echoes of a temple's chime",
      title: 'Zhenru Temple, photographed by Yu',
      alt: 'Zhenru Temple flowers',
      width: 1920,
      height: 1280,
    },
    // Add more photos here as the collection grows
  ]

  return {
    images,
  }
}
