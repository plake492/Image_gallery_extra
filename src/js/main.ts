import { imageGallery } from "@components/imageGallery/"
import { audioPlayer } from "@components/audioPlayer/"
import "../scss/main.scss"

/**
 * Initialize the app
 */
;((): void => {
  window.addEventListener("load", () => {
    imageGallery()
    audioPlayer()
  })
})()
