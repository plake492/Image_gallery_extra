import { convertTime } from "./helpers"
import { audioPlayerEls, getQuerySelectors } from "./querySelectors"

export const init = () => {
  ;[...audioPlayerEls].forEach((audioPlayerEl) => {
    const {
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
    } = getQuerySelectors(audioPlayerEl)

    let rAF: number

    // *** DOM UPDATE FUNCTIONS *** //
    /**
     * Update the play button state
     */
    const updatePlayBtnState = () => {
      const currentPlayState = audioPlayerEl!.dataset.playing
      const updatedPlayState = currentPlayState === "true" ? "false" : "true"
      audioPlayerEl!.dataset.playing = updatedPlayState
    }

    /**
     * Update the mute button state
     */
    const updateMuteBtnState = () => {
      const currentMuteState = audioPlayerEl!.dataset.muted
      const updatedMuteState = currentMuteState === "true" ? "false" : "true"
      audioPlayerEl!.dataset.muted = updatedMuteState
    }
    // * ====================================== * //
    // * ====================================== * //

    // *** UTIL FUNCTIONS *** //
    /**
     * While playing, update the seek slider value and the current time
     */
    const whilePlaying = () => {
      // Get the current time in seconds
      seekSliderEl.value = Math.floor(audioEl.currentTime).toString()

      // Update the current time
      currentTimeEl.textContent = convertTime(
        Number(seekSliderEl.value),
      ).toString()

      // Update the seek before width
      audioPlayerEl.style.setProperty(
        "--seek-before-width",
        `${(Number(seekSliderEl.value) / Number(seekSliderEl.max)) * 100}%`,
      )

      // Update the buffered amount display
      displayBufferedAmount()

      // Call this function again when the browser is ready
      rAF = requestAnimationFrame(whilePlaying)

      // Once the audio has finished playing, reset the player
      if (audioEl.currentTime === audioEl.duration) {
        resetPlayer()
      }
    }

    /**
     * Get the buffered amount and update the CSS variable
     */
    const displayBufferedAmount = () => {
      console.log("audioEl.buffered ==>", audioEl.buffered)

      const bufferedAmount =
        audioEl.buffered.length > 0
          ? Math.floor(audioEl.buffered.end(audioEl.buffered.length - 1))
          : 0

      audioPlayerEl.style.setProperty(
        "--buffered-width",
        `${(bufferedAmount / Number(seekSliderEl!.max)) * 100}%`,
      )
    }

    /**
     * Reset the player to the initial state
     */
    const resetPlayer = () => {
      cancelAnimationFrame(rAF)
      audioEl.pause()
      audioPlayerEl.dataset.playing = "false"
      audioEl.currentTime = 0
      seekSliderEl.value = "0"
      audioPlayerEl.style.setProperty("--seek-before-width", "0%")
    }
    // * ====================================== * //
    // * ====================================== * //

    // *** EVENT HANDLERS *** //
    const handleSkipForward = () => {
      audioEl.currentTime += 30
    }
    const handleSkipReverse = () => {
      audioEl.currentTime -= 30
    }

    /**
     * Hande the play button click
     * Update the play button state and play the audio
     */
    const handlePlay = () => {
      updatePlayBtnState()
      audioEl.play()
      requestAnimationFrame(whilePlaying)
    }

    /**
     * Handle the pause button click
     * Update the play button state and pause the audio
     */
    const handlePause = () => {
      updatePlayBtnState()
      audioEl.pause()
      cancelAnimationFrame(rAF)
    }

    /**
     * Handle the mute button click
     * Update the audio muted state and the mute button state
     */
    const handleMute = () => {
      updateMuteBtnState()
      audioEl.muted = !audioEl.muted
    }

    /**
     * On audio load, update the duration and the seek slider max value
     */
    const handleAudioLoad = () => {
      const duration = audioEl.duration
      durationEl!.textContent = convertTime(duration)
      seekSliderEl!.max = Math.floor(duration).toString()
      displayBufferedAmount()
    }

    /**
     * On Seek slider value change, update the currentTime
     * This triggers while the user is moving the slider
     *
     * This will update the time display without affecting the audio
     */
    const handleUpdateCurrentTime = () => {
      currentTimeEl.textContent = convertTime(Number(seekSliderEl.value))
      if (!audioEl.paused) {
        cancelAnimationFrame(rAF)
      }
    }

    /**
     * On Seek slider value change, update the currentTime
     * This only triggers after the user stops moving the slider
     *
     * This will update the audio play position
     */
    const handleSeekSliderChange = () => {
      audioEl.currentTime = Number(seekSliderEl.value)
      if (!audioEl.paused) {
        requestAnimationFrame(whilePlaying)
      }
    }

    /**
     * Update the audio volume and the display of the audio volume
     * @param e Event
     */
    const handleVolumeChange = (e: Event) => {
      const value = (e.target as HTMLInputElement).value
      volumnDisplayEl.textContent = value
      audioEl.volume = Number(value) / 100
    }

    /**
     * Update the audio playback speed
     * @param e Event
     */
    const handlePlaybackSpeedChange = (e: Event) => {
      audioEl.playbackRate = Number((e.target as HTMLSelectElement).value)
    }
    // * ====================================== * //
    // * ====================================== * //

    // *** REGISTER EVENTS LISTENERS *** //
    playBtnEl.addEventListener("click", handlePlay)
    pauseBtnEl.addEventListener("click", handlePause)
    seekSliderEl.addEventListener("input", handleUpdateCurrentTime)
    seekSliderEl.addEventListener("change", handleSeekSliderChange)
    fowardBtnEl.addEventListener("click", handleSkipForward)
    rewindBtnEl.addEventListener("click", handleSkipReverse)
    volumeSliderEl.addEventListener("input", handleVolumeChange)
    muteBtnEl.addEventListener("click", handleMute)
    playbackSpeedEl.addEventListener("change", handlePlaybackSpeedChange)
    // TODO figure out how check if the audio is being controlled by another source
    // audioEl.addEventListener("playing", handlePlayEvent)
    // audioEl.addEventListener("pause", handlePauseEvent)

    // If the audio element is already loaded, else add a listener
    if (audioEl.readyState > 0) {
      handleAudioLoad()
    } else {
      audioEl.addEventListener("loadedmetadata", handleAudioLoad)
    }
  })
}
