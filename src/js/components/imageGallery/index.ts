import { imageList, startingImage, startingImageAlt } from "@lib/images"
import {
  constructImgPath,
  generateImages,
  generateMainImg,
} from "@utils/imageHelper"
import { setState } from "@utils/state"

// *** TYPES *** //
interface GalleryState {
  [key: string]: any
  currentImageIndex: number
  allImagesLoaded: boolean
  imgThumbElements: HTMLImageElement[]
  imgThumbAmount: number
  activeThumb: HTMLDivElement | null
  currentMainImgEl: HTMLImageElement | null
  isAnmiating: boolean
}

// *** DOM ELEMENTS *** //
const thumbnailWrapperEl =
  document.querySelector<HTMLDivElement>(".img-thumbnails")
const imgMainScreenEl =
  document.querySelector<HTMLImageElement>(".img-main-screen")
const imgMainScreenPrevBtnEl = document.querySelectorAll<HTMLButtonElement>(
  ".img-main-screen-btn",
)
const currentImageNumberEl = document.querySelector<HTMLDivElement>(
  ".current-img-number",
)

/**
 * Initialize the image gallery
 */
export const imageGallery = () => {
  // Function state
  const state = setState<GalleryState>(
    {
      currentImageIndex: 0,
      allImagesLoaded: false,
      imgThumbElements: [],
      imgThumbAmount: imageList.length,
      activeThumb: null,
      currentMainImgEl: null,
      isAnmiating: false,
    },
    (_, key, value) => {
      if (key === "allImagesLoaded" && value === true) turnOffOpacity()
      if (key === "currentImageIndex") {
        updateMainImg()
        setCurrentImageNumber()
      }
    },
  )

  // *** FUNCTIONS *** //
  const turnOffOpacity = () => {
    state.imgThumbElements.forEach((imgEl) => {
      imgEl.style.opacity = "1"
    })
  }

  const setCurrentImageNumber = () => {
    currentImageNumberEl!.textContent = `${String(
      state.currentImageIndex + 1,
    )} / ${state.imgThumbAmount}`
  }

  const checkAllImagesLoaded = (e: Event): void => {
    const target = e.target as HTMLImageElement
    state.imgThumbElements.push(target)

    state.allImagesLoaded =
      state.imgThumbElements.length === state.imgThumbAmount
  }

  const updateMainImg = () => {
    const currentThumb: HTMLImageElement | undefined =
      state.imgThumbElements.find(
        (el) => el.dataset.thumbIndex === String(state.currentImageIndex),
      )

    if (state.activeThumb) {
      state.activeThumb!.classList.remove("active")
    }
    state.activeThumb = currentThumb?.parentNode as HTMLDivElement
    ;(currentThumb?.parentNode as HTMLDivElement).classList.add("active")

    const { src, alt } = imageList[state.currentImageIndex]
    imgMainScreenEl!.style.opacity = "0"
    imgMainScreenEl!.style.transform = "translateX(100px)"

    setTimeout(() => {
      if (state.currentMainImgEl) {
        imgMainScreenEl!.removeChild(state.currentMainImgEl)
      }

      const newImg = generateMainImg(constructImgPath(src), alt)

      state.currentMainImgEl = newImg

      imgMainScreenEl!.appendChild(newImg)

      newImg.onload = () => {
        imgMainScreenEl!.style.opacity = "1"
        imgMainScreenEl!.style.transform = "translateX(0px)"
        state.isAnmiating = false
      }
    }, 500)
  }
  // * ====================================== * //
  // * ====================================== * //

  // *** EVENT HANDLERS *** //
  /**
   * Handle the click event on the thumbnail
   * @param e click event
   */
  const handleThumbnailClick = (e: Event): void => {
    if (state.isAnmiating) return
    state.isAnmiating = true

    const target = e.target as HTMLImageElement
    const imgIndex = target.dataset.thumbIndex

    if (imgIndex) {
      state.currentImageIndex = Number(imgIndex)
    }
  }

  /**
   * Handle the click event on the prev and next buttons
   * @param e click event
   */
  const handleMainScreenBtnClick = (e: Event): void => {
    if (state.isAnmiating) return
    state.isAnmiating = true

    const target = e.target as HTMLButtonElement
    const dir = target.dataset.dir

    if (dir === "prev") {
      if (state.currentImageIndex === 0) {
        state.currentImageIndex = imageList.length
      } else {
        state.currentImageIndex--
      }
    }
    if (dir === "next") {
      if (state.currentImageIndex === imageList.length - 1) {
        state.currentImageIndex = 0
      } else {
        state.currentImageIndex++
      }
    }
  }
  // * ====================================== * //
  // * ====================================== * //

  // *** REGISTER EVENTS LISTENERS *** //
  // Get image elements
  const imgThumbnailEls: HTMLDivElement[] = generateImages()

  imgThumbnailEls.forEach((imgWrapper: HTMLDivElement) => {
    const imgEl = imgWrapper.childNodes[0] as HTMLImageElement
    imgEl.addEventListener("load", checkAllImagesLoaded)
    imgEl.style.opacity = "0"

    // Set Image elements
    thumbnailWrapperEl!.appendChild(imgWrapper)
    // Add event listener to the thumbnail wrapper
    thumbnailWrapperEl!.addEventListener("click", handleThumbnailClick)
  })

  // Add event listener to the main screen buttons
  imgMainScreenPrevBtnEl.forEach((btn) => {
    btn.addEventListener("click", handleMainScreenBtnClick)
  })
  // * ====================================== * //
  // * ====================================== * //

  // Set first image
  const firstImg: HTMLImageElement = generateMainImg(
    startingImage,
    startingImageAlt,
  )
  state.currentMainImgEl = firstImg
  firstImg.style.opacity = "0"
  firstImg.style.transition = "opacity 1s ease-in-out"
  imgMainScreenEl!.appendChild(firstImg)
  firstImg.onload = () => {
    firstImg.style.opacity = "1"
  }
  setCurrentImageNumber()
}
