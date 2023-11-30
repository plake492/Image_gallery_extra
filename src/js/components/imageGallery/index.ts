import { imageList, startingImage, startingImageAlt } from "@lib/images"
import { constructImgPath, generateImages, generateMainImg } from "./helpers"
import { setState } from "@utils/state"
import { GalleryState } from "./types"
import {
  thumbnailWrapperEl,
  imgMainScreenEl,
  imgMainScreenPrevBtnEl,
  currentImageNumberEl,
  mainImgTitleEl,
  mainImgDescriptionEl,
} from "./querySelectors"

/**
 * Initialize the image gallery
 */
export const imageGallery = () => {
  const eventQueue: { func: Function; args: Event[] }[] = []

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
      nextDir: "forward",
    },
    (_, key, value) => {
      if (key === "allImagesLoaded" && value === true) {
        turnOffOpacity()
        highlightActiveThumb()
        setCurrentImageNumber()
      }
      if (key === "currentImageIndex") {
        setCurrentImageNumber()
        highlightActiveThumb()
        updateMainImg()
      }
    },
  )

  // *** FUNCTIONS *** //
  /**
   * Update the main image overlay text
   */
  const updateMainImgOverlayText = (): void => {
    const { title, description } = imageList[state.currentImageIndex]
    mainImgTitleEl!.textContent = title
    mainImgDescriptionEl!.textContent = description
  }

  /**
   * Turn off the opacity of the thumbnail images
   */
  const turnOffOpacity = (): void => {
    state.imgThumbElements.forEach((imgEl) => {
      imgEl.style.opacity = "1"
    })
  }

  /**
   * Set the current image number text
   */
  const setCurrentImageNumber = (): void => {
    currentImageNumberEl!.textContent = `${String(
      state.currentImageIndex + 1,
    )} / ${state.imgThumbAmount}`
  }

  /**
   * Add thumbnail image to the state array
   * Check if all the thumbnail images are loaded
   * @param e load event
   */
  const checkAllImagesLoaded = (e: Event): void => {
    const target = e.target as HTMLImageElement
    state.imgThumbElements.push(target)

    state.allImagesLoaded =
      state.imgThumbElements.length === state.imgThumbAmount
  }

  /**
   * Highlight the active thumbnail
   */
  const highlightActiveThumb = (): void => {
    const currentThumb: HTMLImageElement | undefined =
      state.imgThumbElements.find(
        (el) => el.dataset.thumbIndex === String(state.currentImageIndex),
      )

    if (state.activeThumb) {
      state.activeThumb!.classList.remove("active")
    }
    ;(currentThumb?.parentNode as HTMLDivElement).classList.add("active")
    state.activeThumb = currentThumb?.parentNode as HTMLDivElement
  }

  /**
   * Run the event queue
   */
  const runEventQueue = (): void => {
    if (eventQueue.length > 0) {
      const event = eventQueue.shift()
      const { func, args } = event!
      func(...args)
    }
  }

  /**
   * Add function to the event queue
   * @param func Function to add to the event queue
   * @param args Event arguments
   */
  const addToEventQueue = (func: Function, args: Event[]): void => {
    if (eventQueue.length <= 3) {
      eventQueue.push({
        func,
        args,
      })
    }
  }

  /**
   * Update the main image
   */
  const updateMainImg = () => {
    const { currentImageIndex, currentMainImgEl: outgoingImg, nextDir } = state
    // Grab new image
    const { src, alt } = imageList[currentImageIndex]

    // Generate new image
    const newImg = generateMainImg(constructImgPath(src), alt)
    // Add the fade-in class to trigger enter animation
    newImg.classList.add(`fade-in-${nextDir}`)
    // Append the new image to the DOM
    imgMainScreenEl!.appendChild(newImg)
    // Update state
    state.currentMainImgEl = newImg

    // Start animation and remove the outgoing image on new image load
    newImg.addEventListener("load", () => {
      updateMainImgOverlayText()
      // Remove the fade-in class to trigger enter animation
      newImg.classList.remove(`fade-in-${nextDir}`)

      if (state.currentMainImgEl) {
        // Trigger the fade-out animation
        outgoingImg!.classList.add(`fade-out-${nextDir}`)

        setTimeout(() => {
          imgMainScreenEl!.removeChild(outgoingImg as Node)
          state.isAnmiating = false
          runEventQueue()
        }, 1000)
      } else {
        // make sure the animation state is set to false
        state.isAnmiating = false
      }
    })
  }

  /**
   * Load the first image
   */
  const loadFirstImage = () => {
    // Set first image
    const firstImg: HTMLImageElement = generateMainImg(
      startingImage,
      startingImageAlt,
    )
    // Set current main image
    state.currentMainImgEl = firstImg

    firstImg.style.opacity = "0"
    firstImg.addEventListener("load", () => (firstImg.style.opacity = "1"))
    imgMainScreenEl!.appendChild(firstImg)
    updateMainImgOverlayText()
  }

  /**
   * Load the thumbnail image
   * @param imgWrapper the img wrapper element
   */
  const generateThumbImg = (imgWrapper: HTMLDivElement) => {
    const imgEl = imgWrapper.childNodes[0] as HTMLImageElement
    imgEl.addEventListener("load", checkAllImagesLoaded)
    imgEl.style.opacity = "0"

    // Set Image elements
    thumbnailWrapperEl!.appendChild(imgWrapper)
  }
  // * ====================================== * //
  // * ====================================== * //

  // *** EVENT HANDLERS *** //
  /**
   * Handle the click event on the thumbnail
   * @param e click event
   */
  const handleThumbnailClick = (e: Event): void => {
    if (state.isAnmiating) {
      addToEventQueue(handleThumbnailClick, [e])
      return
    }
    state.isAnmiating = true

    const target = e.target as HTMLImageElement
    const imgIndex = target.dataset.thumbIndex

    if (imgIndex) {
      // Updating the current image index will
      // trigger the updateMainImg function
      state.nextDir =
        state.currentImageIndex > Number(imgIndex) ? "backward" : "forward"

      state.currentImageIndex = Number(imgIndex)
    }
  }

  /**
   * Handle the click event on the prev and next buttons
   * @param e click event
   */
  const handleMainScreenBtnClick = (e: Event): void => {
    if (state.isAnmiating) {
      addToEventQueue(handleMainScreenBtnClick, [e])

      return
    }
    state.isAnmiating = true

    const target = e.target as HTMLButtonElement
    const dir = target.dataset.dir

    // Updating the current image index will
    // trigger the updateMainImg function
    if (dir === "prev") {
      state.nextDir = "backward"
      if (state.currentImageIndex === 0) {
        state.currentImageIndex = imageList.length - 1
      } else {
        state.currentImageIndex--
      }
    }
    if (dir === "next") {
      state.nextDir = "forward"
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
    generateThumbImg(imgWrapper)
    // Add event listener to the thumbnail wrapper
    thumbnailWrapperEl!.addEventListener("click", handleThumbnailClick)
  })

  // Add event listener to the main screen buttons
  imgMainScreenPrevBtnEl.forEach((btn) =>
    btn.addEventListener("click", handleMainScreenBtnClick),
  )
  // * ====================================== * //
  // * ====================================== * //

  loadFirstImage()
}
