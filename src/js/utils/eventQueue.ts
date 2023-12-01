export const eventQueue = (limit?: number) => {
  const eventQueue: { func: Function; args: Event[] }[] = []

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
    if (limit && eventQueue.length > limit) return

    eventQueue.push({
      func,
      args,
    })
  }

  return { runEventQueue, addToEventQueue }
}
