import { useEffect, useState } from 'react'

/**
 * NamishOS sound effects.
 *
 * Every sound is synthesized with the Web Audio API, so there are no audio
 * assets to ship or load. The AudioContext is created lazily on the first
 * sound and unlocked on the first user gesture, because browsers block audio
 * before one (the boot chime plays silently until then).
 */

const MUTE_KEY = 'namishos.sound-muted'

let audioCtx: AudioContext | null = null
let unlockListenersAttached = false

function readStoredMuted(): boolean {
  try {
    return window.localStorage.getItem(MUTE_KEY) === '1'
  } catch {
    return false
  }
}

/** Muted state lives outside React so the window manager can check it cheaply. */
let muted = typeof window === 'undefined' ? false : readStoredMuted()

const subscribers = new Set<(m: boolean) => void>()

export function isSoundMuted(): boolean {
  return muted
}

export function setSoundMuted(m: boolean) {
  muted = m
  try {
    window.localStorage.setItem(MUTE_KEY, m ? '1' : '0')
  } catch {
    // Storage unavailable; the preference still applies for this session.
  }
  subscribers.forEach((fn) => fn(m))
}

/** Reactive mute toggle for the Settings UI. */
export function useSoundMuted(): [boolean, (m: boolean) => void] {
  const [m, setM] = useState(muted)
  useEffect(() => {
    subscribers.add(setM)
    return () => {
      subscribers.delete(setM)
    }
  }, [])
  return [m, setSoundMuted]
}

function attachUnlock() {
  if (unlockListenersAttached || typeof window === 'undefined') return
  unlockListenersAttached = true
  const unlock = () => {
    if (audioCtx && audioCtx.state === 'suspended') void audioCtx.resume()
  }
  window.addEventListener('pointerdown', unlock, { passive: true })
  window.addEventListener('keydown', unlock)
}

function audioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    attachUnlock()
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    audioCtx = new AC()
  }
  if (audioCtx.state === 'suspended') void audioCtx.resume()
  return audioCtx
}

interface ToneOpts {
  freq: number
  /** Seconds from now to start. */
  at?: number
  dur?: number
  type?: OscillatorType
  gain?: number
}

function tone({ freq, at = 0, dur = 0.08, type = 'sine', gain = 0.09 }: ToneOpts) {
  if (muted) return
  const c = audioContext()
  if (!c) return
  const t0 = c.currentTime + at
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  // Quick attack and smooth decay keeps each blip soft, never harsh.
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.008)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(g)
  g.connect(c.destination)
  osc.start(t0)
  osc.stop(t0 + dur + 0.05)
}

/** Soft upward tick when a window opens. */
export function playWindowOpen() {
  tone({ freq: 740, dur: 0.06, type: 'triangle', gain: 0.07 })
  tone({ freq: 988, at: 0.045, dur: 0.07, type: 'triangle', gain: 0.06 })
}

/** Soft downward tick when a window closes. */
export function playWindowClose() {
  tone({ freq: 988, dur: 0.06, type: 'triangle', gain: 0.07 })
  tone({ freq: 740, at: 0.045, dur: 0.07, type: 'triangle', gain: 0.06 })
}

/** A calm C-E-G chime when the desktop finishes booting. */
export function playBootChime() {
  tone({ freq: 523.25, dur: 0.5, type: 'sine', gain: 0.1 })
  tone({ freq: 659.25, at: 0.12, dur: 0.5, type: 'sine', gain: 0.1 })
  tone({ freq: 783.99, at: 0.24, dur: 0.7, type: 'sine', gain: 0.1 })
}
