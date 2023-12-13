import { setState } from "./state"

type eventCallback = (e: Event) => void

interface GrabOptions {
  target: HTMLElement
  listenerTarget?: HTMLElement | Window
  mouseUpCallback?: eventCallback
  mouseDownCallback?: eventCallback
  onDragRight?: eventCallback
  onDragLeft?: eventCallback
  dragVelocity: number
  removeGrabCursors?: boolean
  /**
   * Prevent the mousemove event from firing untill externalPreventMouseMove is set to false
   * !CAUTION! This will prevent the mousemove event from firing on the listenerTarget unless externalPreventMouseMove is set to false manually with the updateState function
   */
  hasExternalPreventMouseMove?: boolean
  /**
   * This will allow the mousemove event to fire more than once per mousedown / mouseup cycle
   */
  allowContinuousAllowContinuousDrag?: boolean
}

interface MouseState {
  mouseDownX: number
  mouseDownY: number
  mouseMoveX: number
  mouseMoveY: number
}

interface StateTypes {
  target: HTMLElement
  listenerTarget: HTMLElement | Window | Document
  isMouseDown: boolean
  mouseState: MouseState
  extrenalPreventMouseMove: boolean
  /**
   * Prevent the mousemove event from firing more than once per mousedown / mouseup cycle
   */
  hasTriggered: boolean
  dragVelocity: number
}

/**
 * Adds event listeners for mouse up and mouse down events with
 * the ability to trigger functionality on drag left or right
 *
 * @param target Target element to grab
 * @param listenerTarget Target element to listen for events
 * @param mouseUpCallback Callback for mouse up event
 * @param mouseDownCallback Callback for mouse down event
 * @param onDragRight Callback for dragging right
 * @param onDragLeft Callback for dragging left
 * @param dragVelocity Drag velocity
 * @returns state and updateState function
 */
export const grabEvents = ({
  target,
  listenerTarget,
  mouseUpCallback,
  mouseDownCallback,
  onDragRight,
  onDragLeft,
  dragVelocity = 40,
  hasExternalPreventMouseMove = false,
  removeGrabCursors = false,
  allowContinuousAllowContinuousDrag = false,
}: GrabOptions) => {
  // Type guard for listenerTarget
  const listenerTargetEl =
    (listenerTarget as HTMLElement | Window | Document) ||
    (target as HTMLElement)

  // Set the initial state
  const state = setState<StateTypes>(
    {
      target: target,
      listenerTarget: listenerTargetEl,
      isMouseDown: false,
      mouseState: {
        mouseDownX: 0,
        mouseDownY: 0,
        mouseMoveX: 0,
        mouseMoveY: 0,
      },
      extrenalPreventMouseMove: false,
      hasTriggered: false,
      dragVelocity: dragVelocity,
    },
    (_, key, value) => {
      if (key === "isMouseDown") {
        // Add or remove the mousemove event listener based on the mousedown state
        const method = value ? "add" : "remove"
        state.listenerTarget[`${method}EventListener`](
          "mousemove",
          handleMousemove,
        )
      }
    },
  )

  // Handle the mousemove event
  function handleMousemove(e: Event) {
    if (
      !state.isMouseDown ||
      state.extrenalPreventMouseMove ||
      state.hasTriggered
    )
      return
    const xCoord = (<MouseEvent>e).clientX
    const deltaX = xCoord - state.mouseState.mouseDownX

    // If the distance is greater than the dragVelocity, trigger the onDragLeft callback
    if (deltaX > state.dragVelocity) {
      if (hasExternalPreventMouseMove) state.extrenalPreventMouseMove = true
      if (!allowContinuousAllowContinuousDrag) state.hasTriggered = true
      if (onDragLeft) onDragLeft(e)
    }
    // If the distance is less than the -dragVelocity, trigger the onDragRight callback
    if (deltaX < state.dragVelocity * -1) {
      if (hasExternalPreventMouseMove) state.extrenalPreventMouseMove = true
      if (!allowContinuousAllowContinuousDrag) state.hasTriggered = true
      if (onDragRight) onDragRight(e)
    }
  }

  // Handle the mousedown event
  function handleMouseDown(e: Event) {
    const el = (<MouseEvent>e).target as HTMLElement
    if (el.isEqualNode(state.target) || state.target.contains(el)) {
      state.isMouseDown = true
      state.mouseState.mouseDownX = (<MouseEvent>e).clientX
      if (!removeGrabCursors) state.target.style.cursor = "grabbing"
      if (mouseDownCallback) mouseDownCallback(e)
    }
  }

  // Handle the mouseup event
  function handleMouseUp(e: Event): void {
    state.hasTriggered = false
    state.isMouseDown = false
    if (!removeGrabCursors) state.target.style.cursor = "grab"
    if (mouseUpCallback) mouseUpCallback(e)
  }

  /**
   * Update the grab state
   * @param key
   * @param value
   */
  function updateState<T extends keyof StateTypes>(
    key: T,
    value: StateTypes[T],
  ): void {
    state[key] = value
  }

  // Register the event listeners
  state.listenerTarget!.addEventListener("mousedown", handleMouseDown)
  state.listenerTarget!.addEventListener("mouseup", handleMouseUp)

  return { state, updateState }
}
