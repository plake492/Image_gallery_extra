/**
 * Wait for a given amount of time
 * @param ms time to wait in milliseconds
 * @returns {Promise<void>} Promise that resolves after the given amount of time
 */
export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))
