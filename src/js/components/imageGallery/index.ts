import {
  generateImages,
  generateMainImg,
  generateMainImgOverlay,
} from "./helpers"
import { init as initPhotoSwipe } from "../../utils/photoSwipe"
import { GalleryState } from "./types"
import { imageList } from "@lib/images"
import { setState } from "@utils/state"
import { wait } from "@utils/index"
import { eventQueue } from "@utils/eventQueue"
import { imageGalleryEls, getQuerySelectors } from "./querySelectors"
import { grabEvents } from "@utils/grabEvents"

/**
 * Initialize the image gallery
 */
export const imageGallery = async (): Promise<void> => {
  await Promise.all(
    [...imageGalleryEls].map(async (imageGalleryEl) => {
      const {
        mainImgEl,
        thumbnailWrapperEl,
        navButtonEls,
        currentImageNumberEl,
      } = getQuerySelectors(imageGalleryEl)

      const animationDuration = 500
      const deltaVelocity = 40
      const touchVelocity = 60
      // An event queue to handle events that are triggered during animation
      const { runEventQueue, addToEventQueue } = eventQueue(2)

      // *** HOOKS *** //
      // Register Grab events for the main image
      const { state: grabState, updateState: updateGrabState } = grabEvents({
        target: mainImgEl,
        listenerTarget: imageGalleryEl,
        dragVelocity: 40,
        onDragRight: () => navButtonEls[1].click(),
        onDragLeft: () => navButtonEls[0].click(),
        hasExternalPreventMouseMove: true,
      })

      // * ====================================== * //
      // * ====================================== * //
      // *** STATE MANAGMENT *** //
      const stateActions = async (key: string, value: any) => {
        switch (key) {
          case "currentImageIndex":
            setCurrentImageNumber()
            highlightActiveThumb()
            await updateMainImg()
            break

          case "allImagesLoaded":
            if (value === true) {
              setCurrentImageNumber()
              highlightActiveThumb()
            }
            break
        }
      }

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
          isMouseDown: false,
          hasMouseAnimated: false,
          currentOverlayEl: null,
        },
        async (_, key, value): Promise<void> => {
          await stateActions(key, value)
        },
      )

      const tocuhState = setState<{ touchstartX: number; touchendX: number }>({
        touchstartX: 0,
        touchendX: 0,
      })

      // * ====================================== * //
      // * ====================================== * //
      // *** PRIMARY FUNCTIONS *** //

      /**
       * Update the main image
       */
      const updateMainImg = async (): Promise<void> => {
        const {
          currentMainImgEl: outgoingPicture,
          nextDir,
          activeThumb,
        } = state
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
          outgoingImgEl.classList.add(`fade-out-${nextDir}`)
          // Wait for the fade-out animation to finish before removing the element
          await wait(animationDuration)
          // After the animation is finished, remove the element from the DOM
          mainImgEl.removeChild(outgoingPicture as Node)
        }

        state.isAnmiating = false

        // ? Reset any animation states that prevent mutliple actions from being added to the event queue

        // Check if the animation was triggered by a touch event
        if (state.isTouchAnimation) {
          state.isTouchAnimation = false
        }

        // Check if the animation was triggered by a mouse even
        if (grabState.extrenalPreventMouseMove) {
          updateGrabState("extrenalPreventMouseMove", false)
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
      const loadMainImage = async (): Promise<void> => {
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
        mainImgEl.appendChild(anchorEl)
        // Wait for the image to load
        await imgEl.decode()
        // Initialize the lightbox
        state.lightBoxInstance = initPhotoSwipe(
          anchorEl,
          imgEl,
          ".img-main-screen a",
        )
        // Remove the fade-in class to trigger the enter animation
        imgEl.classList.remove(`fade-in-${nextDir}`)
      }

      /**
       * Load the thumbnail image
       * @param imgWrapper the img wrapper element
       */
      const generateThumbImg = async (
        imgWrapper: HTMLDivElement,
      ): Promise<void> => {
        const imgEl = imgWrapper.querySelector("img") as HTMLImageElement
        // Hide the image before load
        imgEl.style.opacity = "0"
        // Set Image elements
        thumbnailWrapperEl.appendChild(imgWrapper)
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
        const { overlayEl, overlayLightboxBtnEl } = generateMainImgOverlay(
          title,
          description,
        )
        if (state.currentOverlayEl)
          mainImgEl.removeChild(state.currentOverlayEl)
        state.currentOverlayEl = overlayEl
        updateGrabState("target", overlayEl)
        mainImgEl.prepend(overlayEl)
        overlayLightboxBtnEl.addEventListener("click", handleOpenLightBox)
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
        if (!el) return
        const scrollAmount = el.offsetLeft - thumbnailWrapperEl.offsetWidth / 2

        thumbnailWrapperEl.scrollTo({
          left: scrollAmount,
          behavior: "smooth",
        })
      }

      /**
       * Handle touch events on the x axis
       */
      const handleGesture = (): void => {
        const touchGesture = Math.abs(
          tocuhState.touchendX - tocuhState.touchstartX,
        )

        if (touchGesture > touchVelocity) {
          state.isTouchAnimation = true
          if (tocuhState.touchendX < tocuhState.touchstartX) {
            navButtonEls[1].click()
          }
          if (tocuhState.touchendX > tocuhState.touchstartX) {
            navButtonEls[0].click()
          }
        }
      }

      /**
       * Set the animation duration css variable
       */
      const setAnimationCssVar = (): void => {
        mainImgEl.style.setProperty(
          "--animation-duration",
          `${animationDuration}ms`,
        )
      }

      /**
       * Initialize the image gallery
       */
      const init = async (): Promise<void> => {
        setAnimationCssVar()
        await loadMainImage()
        updateMainImgOverlayText()
      }

      // * ====================================== * //
      // * ====================================== * //
      // *** EVENT HANDLERS *** //

      /**
       * Hnadle the click event on the expand button
       */
      const handleOpenLightBox = (): void => {
        state.lightBoxInstance!.loadAndOpen(0, {
          gallery: document.querySelector(
            ".image-gallery__main-image a",
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
          state.nextDir =
            state.currentImageIndex > Number(imgIndex) ? "backward" : "forward"

          // Updating the current image index will trigger the updateMainImg function
          state.currentImageIndex = Number(imgIndex)
        }
      }

      /**
       * Handle the click event on the prev and next buttons
       * @param e click event
       */
      const handleMainScreenBtnClick = (e: Event): void => {
        if (state.isAnmiating) {
          if (state.isTouchAnimation || state.isMouseAnimation) return
          addToEventQueue(handleMainScreenBtnClick, [e])
          return
        }

        state.isAnmiating = true

        const target = e.target as HTMLButtonElement
        const dir = target.dataset.dir

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
       * Set state on touch start
       * @param e TouchEvent
       */
      const touchstartEvent = (e: TouchEvent): void => {
        tocuhState.touchstartX = e.changedTouches[0].screenX
      }
      /**
       * Set state on touch end and determine if the user swiped left or right
       * @param e TouchEvent
       */
      const touchendEvent = (e: TouchEvent): void => {
        tocuhState.touchendX = e.changedTouches[0].screenX
        handleGesture()
      }

      /**
       * Handle mouse wheel events on the x axis
       * @param e Event
       */
      const handleMouseWheelEvent = (e: Event): void => {
        if (state.isTouchAnimation) return
        const element = (<WheelEvent>e).target as HTMLElement

        if (
          element.isEqualNode(mainImgEl) ||
          element.isEqualNode(state.currentOverlayEl) ||
          mainImgEl.contains(element)
        ) {
          const deltaX = (<WheelEvent>e).deltaX

          // Left scroll
          if (deltaX < deltaVelocity * -1) {
            state.isTouchAnimation = true
            navButtonEls[0].click()
          }

          // Right Scroll
          if (deltaX > deltaVelocity) {
            state.isTouchAnimation = true
            navButtonEls[1].click()
          }
        }
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
        thumbnailWrapperEl.addEventListener("click", handleThumbnailClick)
      })

      // Add event listener to the main screen buttons
      navButtonEls.forEach((btn) =>
        btn.addEventListener("click", handleMainScreenBtnClick),
      )

      mainImgEl.addEventListener("touchstart", touchstartEvent, false)
      mainImgEl.addEventListener("touchend", touchendEvent, false)
      window.addEventListener("mousewheel", handleMouseWheelEvent)

      // * ====================================== * //
      // * ====================================== * //
      // *** INIT *** //

      await init()
    }),
  )
}
