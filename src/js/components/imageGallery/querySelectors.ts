import { className } from "@utils/index"
export const cn = className("image-gallery")
const selector = (className?: string) => `.${cn(className)}`

// *** DOM ELEMENTS *** //
export const imageGalleryEls = document.querySelectorAll(
  selector(),
) as NodeListOf<HTMLDivElement>

export const getQuerySelectors = (imageGalleryEl: HTMLDivElement) => {
  const mainImgEl = imageGalleryEl.querySelector(
    selector("main-image"),
  ) as HTMLImageElement

  const navButtonEls = imageGalleryEl.querySelectorAll(
    selector("navigation-button"),
  ) as NodeListOf<HTMLButtonElement>

  const thumbnailWrapperEl = imageGalleryEl.querySelector(
    selector("thumbnails"),
  ) as HTMLDivElement

  const currentImageNumberEl = imageGalleryEl.querySelector(
    selector("current-image-number"),
  ) as HTMLDivElement

  return {
    mainImgEl,
    thumbnailWrapperEl,
    navButtonEls,
    currentImageNumberEl,
  }
}
