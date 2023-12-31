import { ImgRef } from "@customTypes/types"
import { imageList } from "@lib/images"
import { cn } from "./querySelectors"

/**
 * Generates a pitcure elenment with the source elements nested inside
 * @param img The image data
 * @returns HTMLPictureElement
 */
const createPictureEl = (img: any) => {
  const pictureEl = document.createElement("picture")

  img.forEach((imgSrc: any) => {
    const sourceEl = document.createElement("source")

    for (const [key, value] of Object.entries(imgSrc)) {
      sourceEl.setAttribute(key, value as string)
    }
    // TODO Add options for media queries if possible
    pictureEl.appendChild(sourceEl)
  })

  return pictureEl
}

/**
 * Generate the Img Elements
 * @returns {HTMLDivElement[]} Promise of an array of HTMLDivElement
 */
export const generateImages = async (): Promise<HTMLDivElement[]> => {
  return await Promise.all(
    imageList.map(async ({ src, alt, type }: ImgRef, index: number) => {
      const { default: img } = await import(
        `../../../assets/images/${src}.${type}?preset=thumbnail`
      )

      const imgWrapper = document.createElement("div")
      imgWrapper.classList.add(cn("thumbnail"))

      const picutureEl = createPictureEl(img)
      const imgEl = document.createElement("img")

      for (const [key, value] of Object.entries(img[img.length - 1])) {
        // Apply the attributes to the image element from the
        // imagePresets in vite.config.ts
        imgEl.setAttribute(key, value as string)
      }

      imgEl.alt = alt
      imgEl.dataset.thumbPath = img[img.length - 1].src
      imgEl.dataset.thumbAlt = alt
      imgEl.dataset.thumbIndex = String(index)
      imgEl.width = 100
      imgEl.height = 100
      imgEl.loading = "eager"
      imgEl.decoding = "async"

      picutureEl.appendChild(imgEl)
      imgWrapper.appendChild(picutureEl)

      return imgWrapper
    }),
  )
}

/**
 * Genreates the main image
 * @param imgPath path the image
 * @param imgAlt alt text for the image
 * @returns {HTMLImageElement} HTML image element
 */
export const generateMainImg = async (
  imgData: ImgRef,
): Promise<HTMLAnchorElement> => {
  const { src, alt, type } = imgData
  const { default: img } = await import(
    `../../../assets/images/${src}.${type}?preset=large`
  )

  const aEl = document.createElement("a")
  const pictureEl = createPictureEl(img)
  const imgEl = document.createElement("img")

  for (const [key, value] of Object.entries(img[img.length - 1])) {
    imgEl.setAttribute(key, value as string)
  }

  imgEl.alt = alt
  imgEl.width = 100
  imgEl.height = 100
  imgEl.loading = "eager"

  pictureEl.appendChild(imgEl)
  aEl.appendChild(pictureEl)

  return aEl
}

export const generateMainImgOverlay = (title: string, description: string) => {
  const overlayEl = document.createElement("div")
  overlayEl.classList.add(cn("main-image-overlay"))
  const overlayTitleEl = document.createElement("div")
  overlayTitleEl.classList.add(cn("main-image-overlay-content"), "title")
  const overlayTitleTextEl = document.createElement("p")
  overlayTitleTextEl.textContent = title
  overlayTitleEl.appendChild(overlayTitleTextEl)
  const overlayDescriptionEl = document.createElement("div")
  overlayDescriptionEl.classList.add(
    cn("main-image-overlay-content"),
    "description",
  )
  const overlayDescriptionTextEl = document.createElement("p")
  overlayDescriptionTextEl.textContent = description
  const overlayLightboxBtnEl = document.createElement("button")
  overlayLightboxBtnEl.classList.add(cn("lightbox-button"), "btn")
  overlayLightboxBtnEl.textContent = "Expand"
  overlayDescriptionEl.appendChild(overlayDescriptionTextEl)
  overlayDescriptionEl.appendChild(overlayLightboxBtnEl)
  overlayEl.appendChild(overlayTitleEl)
  overlayEl.appendChild(overlayDescriptionEl)
  return { overlayEl, overlayLightboxBtnEl }
}
