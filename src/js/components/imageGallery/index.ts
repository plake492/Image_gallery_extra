import { imageList } from "@lib/images"
import { generateImages, generateMainImg } from "./helpers"
import { setState } from "@utils/state"
import { GalleryState } from "./types"
import { wait } from "@utils/index"
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
export const imageGallery = async () => {
  // *** STATE *** //
  // An event queue to handle events that are triggered
  const eventQueue: { func: Function; args: Event[] }[] = []

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
    async (_, key, value) => {
      if (key === "allImagesLoaded" && value === true) {
        turnOffOpacity()
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
    const {
      currentImageIndex,
      currentMainImgEl: outgoingPicture,
      nextDir,
    } = state
    // Grab new image
    const { src, alt } = imageList[currentImageIndex]
    // Generate new image
    const newPictureEl = await generateMainImg(src, alt)

    const newImg = newPictureEl.querySelector("img") as HTMLImageElement
    // Add the fade-in class to trigger enter animation
    newImg.classList.add(`fade-in-${nextDir}`)
    // Append the new image to the DOM
    imgMainScreenEl!.appendChild(newPictureEl)
    // Update state
    state.currentMainImgEl = newPictureEl
    // Wait for the image to load
    await newImg.decode()

    // Remove the fade-in class to trigger enter animation
    newImg.classList.remove(`fade-in-${nextDir}`)

    if (state.currentMainImgEl) {
      // Trigger the fade-out animation
      const outgoingImg = outgoingPicture!.querySelector(
        "img",
      ) as HTMLImageElement

      outgoingImg!.classList.add(`fade-out-${nextDir}`)

      // Wait for the fade-out animation to finish before removing the element
      //? 700 is the transition duration applied to the main image class
      await wait(700)

      imgMainScreenEl!.removeChild(outgoingPicture as Node)
    }

    state.isAnmiating = false

    // Update the overlay content
    updateMainImgOverlayText()
    // Run the event queue
    runEventQueue()
  }

  /**
   * Load the first image
   */
  const loadFirstImage = async () => {
    // Generate the first image
    const firstPicutre = await generateMainImg(
      imageList[0].src,
      imageList[0].alt,
    )

    const firstImg = firstPicutre.querySelector("img") as HTMLImageElement
    // Set current main image
    state.currentMainImgEl = firstPicutre

    firstImg.style.opacity = "0"
    firstImg.addEventListener("load", () => (firstImg.style.opacity = "1"))

    imgMainScreenEl!.appendChild(firstPicutre)
    updateMainImgOverlayText()
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

    const parentNode = currentThumb?.parentNode as HTMLDivElement

    if (parentNode) {
      parentNode.classList.add("active")
      state.activeThumb = currentThumb?.parentNode as HTMLDivElement
    }
  }

  /**
   * Load the thumbnail image
   * @param imgWrapper the img wrapper element
   */
  const generateThumbImg = (imgWrapper: HTMLDivElement) => {
    const imgEl = imgWrapper.querySelector("img") as HTMLImageElement
    imgEl.style.opacity = "0"

    imgEl.addEventListener("load", (e) => {
      imgEl.style.opacity = "1"
      checkAllImagesLoaded(e)
    })

    imgEl.onerror = (e) => {
      console.log("error:::", e)
    }

    // Set Image elements
    thumbnailWrapperEl!.appendChild(imgWrapper)
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
  const imgThumbnailEls: HTMLDivElement[] = await generateImages()

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

  await loadFirstImage()
}
