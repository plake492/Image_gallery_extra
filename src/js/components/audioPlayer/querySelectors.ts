import { className } from "@utils/index"
const cn = className("audio-player")
const selector = (className?: string) => `.${cn(className)}`

export const audioPlayerEls = document.querySelectorAll(
  selector(),
) as NodeListOf<HTMLDivElement>

export const getQuerySelectors = (audioPlayerEl: HTMLDivElement) => {
  const audioEl = audioPlayerEl.querySelector("audio") as HTMLAudioElement
  const playBtnEl = audioPlayerEl.querySelector(
    selector("play"),
  ) as HTMLButtonElement
  const pauseBtnEl = audioPlayerEl.querySelector(
    selector("pause"),
  ) as HTMLButtonElement
  const currentTimeEl = audioPlayerEl.querySelector(
    selector("current-time"),
  ) as HTMLDivElement
  const durationEl = audioPlayerEl.querySelector(
    selector("duration"),
  ) as HTMLDivElement
  const seekSliderEl = audioPlayerEl.querySelector(
    selector("seek-slider"),
  ) as HTMLInputElement
  const fowardBtnEl = audioPlayerEl.querySelector(
    selector("forward-30"),
  ) as HTMLButtonElement
  const rewindBtnEl = audioPlayerEl.querySelector(
    selector("prev-30"),
  ) as HTMLButtonElement
  const volumeSliderEl = audioPlayerEl.querySelector(
    selector("volume-slider"),
  ) as HTMLInputElement
  const volumnDisplayEl = audioPlayerEl.querySelector(
    selector("volume-display"),
  ) as HTMLDivElement
  const muteBtnEl = audioPlayerEl.querySelector(
    selector("mute"),
  ) as HTMLButtonElement
  const playbackSpeedEl = audioPlayerEl.querySelector(
    selector("playback-speed"),
  ) as HTMLSelectElement

  return {
    audioEl,
    playBtnEl,
    pauseBtnEl,
    currentTimeEl,
    durationEl,
    seekSliderEl,
    fowardBtnEl,
    rewindBtnEl,
    volumeSliderEl,
    volumnDisplayEl,
    muteBtnEl,
    playbackSpeedEl,
  }
}
