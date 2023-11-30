// *** TYPES *** //
export interface GalleryState {
  [key: string]: any
  currentImageIndex: number
  allImagesLoaded: boolean
  imgThumbElements: HTMLImageElement[]
  imgThumbAmount: number
  activeThumb: HTMLDivElement | null
  currentMainImgEl: HTMLImageElement | null
  isAnmiating: boolean
  nextDir: string
}