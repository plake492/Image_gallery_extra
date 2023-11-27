import { ImgRef } from "@customTypes/types"

export const imageList: ImgRef[] = [
  { src: "a", alt: "ALT_TEXT_HERE" },
  { src: "b", alt: "ALT_TEXT_HERE" },
  { src: "c", alt: "ALT_TEXT_HERE" },
  { src: "d", alt: "ALT_TEXT_HERE" },
  { src: "e", alt: "ALT_TEXT_HERE" },
  { src: "f", alt: "ALT_TEXT_HERE" },
  { src: "g", alt: "ALT_TEXT_HERE" },
  { src: "h", alt: "ALT_TEXT_HERE" },
  { src: "i", alt: "ALT_TEXT_HERE" },
  { src: "j", alt: "ALT_TEXT_HERE" },
  { src: "k", alt: "ALT_TEXT_HERE" },
  { src: "l", alt: "ALT_TEXT_HERE" },
  { src: "m", alt: "ALT_TEXT_HERE" },
  { src: "n", alt: "ALT_TEXT_HERE" },
  { src: "o", alt: "ALT_TEXT_HERE" },
]

export const imagePath: string = "images/"
export const imageType: string = "webp"

export const startingImage: string = `${imagePath}${imageList[0].src}.${imageType}`
export const startingImageAlt: string = imageList[0].alt
