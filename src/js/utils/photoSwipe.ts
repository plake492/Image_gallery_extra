// Include Lightbox
import PhotoSwipeLightbox from "photoswipe/lightbox"
import "photoswipe/style.css"

export const init = (
  picutureEl: HTMLAnchorElement,
  imgEl: HTMLImageElement,
  gallery: string,
): PhotoSwipeLightbox => {
  picutureEl.href = imgEl.src
  picutureEl.dataset.pswpWidth = imgEl.naturalWidth.toString()
  picutureEl.dataset.pswpHeight = imgEl.naturalHeight.toString()
  picutureEl.dataset.cropped = "true"
  picutureEl.target = "_blank"

  const lightbox = new PhotoSwipeLightbox({
    // may select multiple "galleries"
    gallery,
    // setup PhotoSwipe Core dynamic import
    pswpModule: () => import("photoswipe"),
  })

  lightbox.init()

  return lightbox
}
