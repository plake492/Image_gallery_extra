// Include Lightbox
import PhotoSwipeLightbox from "photoswipe/lightbox"
import "photoswipe/style.css"

export const init = (
  picutureEl: HTMLAnchorElement,
  imgEl: HTMLImageElement,
): PhotoSwipeLightbox => {
  picutureEl.href = imgEl.src
  picutureEl.dataset.pswpWidth = imgEl.naturalWidth.toString()
  picutureEl.dataset.pswpHeight = imgEl.naturalHeight.toString()
  picutureEl.dataset.cropped = "true"
  picutureEl.target = "_blank"

  const lightbox = new PhotoSwipeLightbox({
    // may select multiple "galleries"
    gallery: ".img-main-screen a",

    bgOpacity: 0.9,
    // setup PhotoSwipe Core dynamic import
    pswpModule: () => import("photoswipe"),
  })

  lightbox.init()

  return lightbox
}
