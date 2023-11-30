import { ImgRef } from "@customTypes/types"
import { imageList, imagePath, imageType } from "@lib/images"

export const constructImgPath = (src: string): string =>
  `${imagePath}${src}.${imageType}`

/**
 * Generate the Img Elements
 * @returns {string} HTML string of images
 */
export const generateImages = (): HTMLDivElement[] => {
  return imageList.map(({ src, alt }: ImgRef, index: number) => {
    const imgPath = constructImgPath(src)
    const imgWrapper = document.createElement("div")
    imgWrapper.classList.add("img-wrapper")
    const imgEl = document.createElement("img")
    imgEl.src = imgPath
    imgEl.alt = alt
    imgEl.dataset.thumbPath = imgPath
    imgEl.dataset.thumbAlt = alt
    imgEl.dataset.thumbIndex = String(index)
    imgEl.width = 100
    imgEl.height = 100
    imgWrapper.appendChild(imgEl)
    return imgWrapper
  })
}

/**
 * Genreates the main image
 * @param imgPath path the image
 * @param imgAlt alt text for the image
 * @returns
 */
export const generateMainImg = (
  imgPath: string,
  imgAlt: string,
): HTMLImageElement => {
  const imgEl = document.createElement("img")
  imgEl.src = imgPath
  imgEl.alt = imgAlt
  imgEl.width = 100
  imgEl.height = 100
  return imgEl
}
