import { generateImages, generateMainImg } from "./helpers"
import { init as initPhotoSwipe } from "./photoSwipe"
import { GalleryState } from "./types"
import { imageList } from "@lib/images"
import { setState } from "@utils/state"
import { wait } from "@utils/index"
import { eventQueue } from "@utils/eventQueue"
import {
  thumbnailWrapperEl,
  imgMainScreenEl,
  imgMainScreenPrevBtnEl,
  currentImageNumberEl,
  mainImgTitleEl,
  mainImgDescriptionEl,
  mainImgGallertBtnEl,
  overlayEl,
} from "./querySelectors"

/**
 * Initialize the image gallery
 */
export const imageGallery = async (): Promise<void> => {
  const deltaVelocity = 40

  const animationDuration = 700
  // An event queue to handle events that are triggered during animation
  const { runEventQueue, addToEventQueue } = eventQueue(2)

  // *** STATE *** //

  const state = setState<GalleryState>(
    {
      currentImageIndex: 0,
      allImagesLoaded: false,
      imgThumbElements: [],
      imgThumbAmount: imageList.length,
      activeThumb: undefined,
      currentMainImgEl: null,
      isAnmiating: false,
      nextDir: "forward",
      lightBoxInstance: null,
      lightboxOpen: false,
      isTouchAnimation: false,
    },
    async (_, key, value) => {
      if (key === "allImagesLoaded" && value === true) {
        setCurrentImageNumber()
        highlightActiveThumb()
      }
      if (key === "currentImageIndex") {
        setCurrentImageNumber()
        highlightActiveThumb()
        await updateMainImg()
      }
    },
  )

  // * ====================================== * //
  // * ====================================== * //
  // *** PRIMARY FUNCTIONS *** //

  /**
   * Update the main image
   */
  const updateMainImg = async () => {
    const { currentMainImgEl: outgoingPicture, nextDir, activeThumb } = state

    // Create and load the new main image
    await loadMainImage()

    // Scroll the active thumbnail to center
    scrollToThumbnail(activeThumb as HTMLImageElement)

    if (state.currentMainImgEl) {
      // Trigger the fade-out animation
      const outgoingImgEl = outgoingPicture!.querySelector(
        "img",
      ) as HTMLImageElement
      // Add the fade-out class to trigger the exit animation
      outgoingImgEl!.classList.add(`fade-out-${nextDir}`)
      // Wait for the fade-out animation to finish before removing the element
      await wait(animationDuration)
      // After the animation is finished, remove the element from the DOM
      imgMainScreenEl!.removeChild(outgoingPicture as Node)
    }

    // Reset the animation state
    state.isAnmiating = false

    if (state.isTouchAnimation) {
      state.isTouchAnimation = false
    }

    // Update the overlay content
    updateMainImgOverlayText()
    // Run the event queue
    runEventQueue()
  }

  /**
   * Highlight the active thumbnail
   */
  const highlightActiveThumb = (): void => {
    // Remove the active class from the previous active thumbnail if present
    state.activeThumb?.classList.remove("active")

    // Grab the current active thumbnail
    const currentThumb = state.imgThumbElements.find(
      (el) => el.dataset.thumbIndex === String(state.currentImageIndex),
    )

    currentThumb?.classList.add("active")
    state.activeThumb = currentThumb
  }

  /**
   * Handle Loading the new main image
   */
  const loadMainImage = async () => {
    const { currentImageIndex, nextDir } = state
    // Grab first image data
    const imgData = imageList[currentImageIndex]
    // Generate the first image Element
    const anchorEl = await generateMainImg(imgData)
    // Set current main image in state
    state.currentMainImgEl = anchorEl
    // Grab the image element from the new anchor element
    const imgEl = anchorEl.querySelector("img") as HTMLImageElement
    // Add the fade-in class to set up the enter animation
    imgEl.classList.add(`fade-in-${nextDir}`)
    // Append the new image to the DOM
    imgMainScreenEl!.appendChild(anchorEl)
    // Wait for the image to load
    await imgEl.decode()
    // Initialize the lightbox
    state.lightBoxInstance = initPhotoSwipe(anchorEl, imgEl)
    // Remove the fade-in class to trigger the enter animation
    imgEl.classList.remove(`fade-in-${nextDir}`)
  }

  /**
   * Load the thumbnail image
   * @param imgWrapper the img wrapper element
   */
  const generateThumbImg = async (imgWrapper: HTMLDivElement) => {
    const imgEl = imgWrapper.querySelector("img") as HTMLImageElement
    // Hide the image before load
    imgEl.style.opacity = "0"
    // Set Image elements
    thumbnailWrapperEl!.appendChild(imgWrapper)
    // Wait for the image to load
    await imgEl.decode()
    // Show the image after load
    imgEl.style.opacity = "1"
    // Check if all the thumbnail images are loaded
    checkAllImagesLoaded(imgEl)
  }

  // * ====================================== * //
  // * ====================================== * //
  // *** UTIL FUNCTIONS *** //
  /**
   * Update the main image overlay text
   */
  const updateMainImgOverlayText = (): void => {
    const { title, description } = imageList[state.currentImageIndex]
    mainImgTitleEl!.textContent = title
    mainImgDescriptionEl!.textContent = description
    mainImgGallertBtnEl!.addEventListener("click", handleOpenLightBox)
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
   * @param imgEl HTMLImageElement
   */
  const checkAllImagesLoaded = (imgEl: HTMLImageElement): void => {
    // Add the image element to the state array
    state.imgThumbElements = [...state.imgThumbElements, imgEl]

    state.allImagesLoaded =
      state.imgThumbElements.length === state.imgThumbAmount
  }

  /**
   * Scroll the active thumb element to center if possible
   * @param el active thumb element
   */
  const scrollToThumbnail = (el: HTMLDivElement): void => {
    const scrollAmount = el.offsetLeft - thumbnailWrapperEl!.offsetWidth / 2

    thumbnailWrapperEl!.scrollTo({
      left: scrollAmount,
      behavior: "smooth",
    })
  }

  /**
   * Set the animation duration css variable
   */
  const setAnimationCssVar = () => {
    imgMainScreenEl!.style.setProperty(
      "--animation-duration",
      `${animationDuration}ms`,
    )
  }

  // * ====================================== * //
  // * ====================================== * //
  // *** EVENT HANDLERS *** //

  /**
   * Hnadle the click event on the expand button
   */
  const handleOpenLightBox = () => {
    state.lightBoxInstance!.loadAndOpen(0, {
      gallery: document.querySelector(
        ".img-main-screen a",
      ) as HTMLAnchorElement,
    })
  }

  /**
   * Handle the click event on the thumbnail
   * @param e click event
   */
  const handleThumbnailClick = (e: Event): void => {
    const target = e.target as HTMLImageElement
    const imgIndex = target.dataset.thumbIndex

    // Avoid triggering the event if the user clicks on the active thumbnail
    if (state.currentImageIndex === Number(imgIndex)) return

    if (state.isAnmiating) {
      addToEventQueue(handleThumbnailClick, [e])
      return
    }
    state.isAnmiating = true

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
      if (state.isTouchAnimation) return
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

  /**
   * Initialize the image gallery
   */
  const init = async () => {
    setAnimationCssVar()
    await loadMainImage()
    updateMainImgOverlayText()
  }

  // * ====================================== * //
  // * ====================================== * //
  // *** REGISTER EVENTS LISTENERS *** //

  // Get image elements
  const imgThumbnailEls: HTMLDivElement[] = await generateImages()

  // Add the thumbnail images to the DOM and register their event listeners
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
  // *** INIT *** //

  await init()

  // TODO CLEAN UP THIS UNGLY ASS CODE //
  // SCREEN TOUCH FOR MOBILE DEVICES
  let touchstartX = 0
  let touchendX = 0

  imgMainScreenEl!.addEventListener(
    "touchstart",
    (event) => {
      touchstartX = event.changedTouches[0].screenX
    },
    false,
  )

  imgMainScreenEl!.addEventListener(
    "touchend",
    (event) => {
      touchendX = event.changedTouches[0].screenX
      handleGesture()
    },
    false,
  )

  const handleGesture = () => {
    const gestureSize = Math.abs(touchendX - touchstartX)

    if (gestureSize > 10) {
      document.body.style.height = "100%"
      document.body.style.overflow = "hidden"
    }

    if (state.isTouchAnimation) return

    if (gestureSize > window.innerWidth / 4) {
      state.isTouchAnimation = true

      if (touchendX < touchstartX) {
        imgMainScreenPrevBtnEl[1].click()
      }
      console.log("touchendX > touchstartX ==>", touchendX, touchstartX)

      if (touchendX > touchstartX) {
        imgMainScreenPrevBtnEl[0].click()
      }
    }
  }

  // SIDE SCROLL FOR DESKTOPS
  window.addEventListener("mousewheel", (e) => {
    const element = (<WheelEvent>e).target as HTMLElement

    if (
      element.isEqualNode(imgMainScreenEl) ||
      element.isEqualNode(overlayEl)
    ) {
      if (state.isTouchAnimation) return

      const deltaX = (<WheelEvent>e).deltaX

      // Left scroll
      if (deltaX < deltaVelocity * -1) {
        state.isTouchAnimation = true
        imgMainScreenPrevBtnEl[0].click()
        return false
      }

      // Right Scroll
      if (deltaX > deltaVelocity) {
        state.isTouchAnimation = true
        imgMainScreenPrevBtnEl[1].click()
        return false
      }
    }
  })
}
