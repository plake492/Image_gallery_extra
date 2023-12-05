import { imageGallery } from "@components/imageGallery/"
import { init as audioPlayer } from "@components/audioPlayer"
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
