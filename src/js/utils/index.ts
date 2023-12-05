/**
 * Wait for a given amount of time
 * @param ms time to wait in milliseconds
 * @returns {Promise<void>} Promise that resolves after the given amount of time
 */
export const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Create a bem class string
 * @param base the base class name
 * @returns {Function} function that takes a class name and returns a bem class string
 */
export const className = (base: string) => (className?: string) =>
  className ? `${base}__${className}` : base
