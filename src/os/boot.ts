import { useEffect, useState } from 'react'

/**
 * NamishOS verbose boot mode.
 *
 * When enabled, the boot screen streams kernel-style log lines instead of the
 * calm logo boot, like macOS verbose mode (Cmd+V). The preference is a plain
 * localStorage flag, so it applies on the next restart.
 */

const VERBOSE_KEY = 'namishos.verbose-boot'

function readStoredVerbose(): boolean {
  try {
    return window.localStorage.getItem(VERBOSE_KEY) === '1'
  } catch {
    return false
  }
}

/** Verbose state lives outside React so the boot screen can read it cheaply. */
let verbose = typeof window === 'undefined' ? false : readStoredVerbose()

const subscribers = new Set<(v: boolean) => void>()

export function isVerboseBoot(): boolean {
  return verbose
}

export function setVerboseBoot(v: boolean) {
  verbose = v
  try {
    window.localStorage.setItem(VERBOSE_KEY, v ? '1' : '0')
  } catch {
    // Storage unavailable; the preference still applies for this session.
  }
  subscribers.forEach((fn) => fn(v))
}

/** Reactive verbose-boot toggle for the Settings UI and the boot screen. */
export function useVerboseBoot(): [boolean, (v: boolean) => void] {
  const [v, setV] = useState(verbose)
  useEffect(() => {
    subscribers.add(setV)
    return () => {
      subscribers.delete(setV)
    }
  }, [])
  return [v, setVerboseBoot]
}
