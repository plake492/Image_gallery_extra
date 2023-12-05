/**
 * Convert seconds to minutes and seconds
 * @param time
 * @returns string of minutes and seconds
 */
export const convertTime = (time: number): string => {
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  const returnedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`
  return `${minutes}:${returnedSeconds}`
}
