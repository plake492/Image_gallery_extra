import { ImgRef } from "@customTypes/types"
import { imageList } from "@lib/images"

const createPictureEl = (img: any, query?: string | null | undefined) => {
  const pictureEl = document.createElement("picture")

  img.forEach((imgSrc: any) => {
    const sourceEl = document.createElement("source")

    for (const [key, value] of Object.entries(imgSrc)) {
      sourceEl.setAttribute(key, value as string)
    }
    if (query) {
      sourceEl.media = `(max-width: ${query}px)`
    }
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
      imgWrapper.classList.add("img-wrapper", "img-thumb-wrapper")

      const picutureEl = createPictureEl(img)
      const imgEl = document.createElement("img")

      for (const [key, value] of Object.entries(img[img.length - 1])) {
        // Apply the attributes to the image element from the
        // imagePresets in vite.config.ts
        imgEl.setAttribute(key, value as string)
      }

      imgEl.loading = "eager"
      imgEl.decoding = "async"

      imgEl.alt = alt
      imgEl.dataset.thumbPath = img[img.length - 1].src
      imgEl.dataset.thumbAlt = alt
      imgEl.dataset.thumbIndex = String(index)
      imgEl.width = 100
      imgEl.height = 100

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
export const generateMainImg = async function (
  imgData: ImgRef,
): Promise<HTMLPictureElement> {
  const { src, alt, type } = imgData
  const { default: img } = await import(
    `../../../assets/images/${src}.${type}?preset=large`
  )

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

  return pictureEl
}
