import { imageGallery } from "@components/imageGallery/"
import "../scss/main.scss"

/**
 * Initialize the app
 */
;((): void => {
  window.addEventListener("load", () => {
    imageGallery()
  })
})()
