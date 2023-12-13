import PhotoSwipeLightbox from "photoswipe/lightbox"

// *** TYPES *** //
export interface GalleryState {
  [key: string]: any
  currentImageIndex: number
  allImagesLoaded: boolean
  imgThumbElements: HTMLImageElement[]
  imgThumbAmount: number
  activeThumb: HTMLDivElement | undefined
  currentMainImgEl: HTMLPictureElement | null
  isAnmiating: boolean
  nextDir: string
  lightBoxInstance: PhotoSwipeLightbox | null
  lightboxOpen: boolean
  isTouchAnimation: boolean
  isMouseDown: boolean
  hasMouseAnimated: boolean
  currentOverlayEl: HTMLDivElement | null
}
