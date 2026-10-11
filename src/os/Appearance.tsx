import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type WallpaperVariant = 'tide' | 'drift' | 'ember' | 'custom'
export type TerminalTheme = 'dark' | 'light' | 'phosphor'
export type SystemTheme = 'light' | 'dark'
export type AccentColor = 'blue' | 'green' | 'orange' | 'purple' | 'pink'

const WALLPAPER_VARIANT_KEY = 'namishos.wallpaper-variant'
const CUSTOM_WALLPAPER_KEY = 'namishos.custom-wallpaper'
const TERMINAL_THEME_KEY = 'namishos.terminal-theme'
const SYSTEM_THEME_KEY = 'namishos.system-theme'
const ACCENT_COLOR_KEY = 'namishos.accent-color'

const WALLPAPER_VARIANTS: WallpaperVariant[] = ['tide', 'drift', 'ember', 'custom']
const SYSTEM_THEMES: SystemTheme[] = ['light', 'dark']
const ACCENT_COLORS: AccentColor[] = ['blue', 'green', 'orange', 'purple', 'pink']

/** Largest dimension a custom wallpaper is kept at; keeps localStorage writes small. */
const CUSTOM_WALLPAPER_MAX_SIZE = 1920
const CUSTOM_WALLPAPER_QUALITY = 0.85

function readStoredWallpaperVariant(): WallpaperVariant {
  try {
    const raw = window.localStorage.getItem(WALLPAPER_VARIANT_KEY)
    if (WALLPAPER_VARIANTS.includes(raw as WallpaperVariant)) return raw as WallpaperVariant
  } catch {
    // Storage unavailable; fall back to the default.
  }
  return 'tide'
}

function readStoredCustomWallpaper(): string | null {
  try {
    const raw = window.localStorage.getItem(CUSTOM_WALLPAPER_KEY)
    if (typeof raw === 'string' && raw.startsWith('data:image/')) return raw
  } catch {
    // Storage unavailable; fall back to no custom image.
  }
  return null
}

function readStoredTerminalTheme(): TerminalTheme {
  try {
    const raw = window.localStorage.getItem(TERMINAL_THEME_KEY)
    if (raw === 'dark' || raw === 'light' || raw === 'phosphor') return raw
  } catch {
    // Storage unavailable; fall back to the default.
  }
  return 'dark'
}

function readStoredSystemTheme(): SystemTheme {
  try {
    const raw = window.localStorage.getItem(SYSTEM_THEME_KEY)
    if (SYSTEM_THEMES.includes(raw as SystemTheme)) return raw as SystemTheme
  } catch {
    // Storage unavailable; fall back to the default.
  }
  return 'light'
}

function readStoredAccentColor(): AccentColor {
  try {
    const raw = window.localStorage.getItem(ACCENT_COLOR_KEY)
    if (ACCENT_COLORS.includes(raw as AccentColor)) return raw as AccentColor
  } catch {
    // Storage unavailable; fall back to the default.
  }
  return 'blue'
}

/**
 * Downscales an image file and returns it as a compact JPEG data URL.
 * Keeps custom wallpapers small enough to fit comfortably in localStorage.
 */
function processWallpaperFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('That file is not an image.'))
      return
    }
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(
        1,
        CUSTOM_WALLPAPER_MAX_SIZE / Math.max(img.width, img.height),
      )
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(img.width * scale))
      canvas.height = Math.max(1, Math.round(img.height * scale))
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Could not process that image.'))
        return
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', CUSTOM_WALLPAPER_QUALITY))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read that image.'))
    }
    img.src = url
  })
}

export type UploadResult = { ok: true } | { ok: false; message: string }

interface AppearanceCtx {
  variant: WallpaperVariant
  setVariant: (v: WallpaperVariant) => void
  customWallpaper: string | null
  /** Opens a file picker and saves the chosen image as the desktop background. */
  uploadCustomWallpaper: () => Promise<UploadResult>
  clearCustomWallpaper: () => void
  terminalTheme: TerminalTheme
  setTerminalTheme: (t: TerminalTheme) => void
  systemTheme: SystemTheme
  setSystemTheme: (t: SystemTheme) => void
  accentColor: AccentColor
  setAccentColor: (c: AccentColor) => void
}

const Ctx = createContext<AppearanceCtx | null>(null)

export function useAppearance() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAppearance must be used inside AppearanceProvider')
  return ctx
}

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [variant, setVariantState] = useState<WallpaperVariant>(() => {
    const stored = readStoredWallpaperVariant()
    // A custom variant without a saved image cannot be shown; fall back gracefully.
    if (stored === 'custom' && !readStoredCustomWallpaper()) return 'tide'
    return stored
  })
  const [customWallpaper, setCustomWallpaper] = useState<string | null>(readStoredCustomWallpaper)
  const [terminalTheme, setTerminalThemeState] = useState<TerminalTheme>(readStoredTerminalTheme)
  const [systemTheme, setSystemThemeState] = useState<SystemTheme>(readStoredSystemTheme)
  const [accentColor, setAccentColorState] = useState<AccentColor>(readStoredAccentColor)

  // The CSS variables in index.css read these attributes to theme the
  // menu bar, window chrome, and Dock without re-rendering anything.
  useEffect(() => {
    document.documentElement.dataset.systemTheme = systemTheme
    document.documentElement.dataset.accent = accentColor
  }, [systemTheme, accentColor])

  const setVariant = (v: WallpaperVariant) => {
    // Never select the custom variant without an image behind it.
    if (v === 'custom' && !customWallpaper) {
      void uploadCustomWallpaper()
      return
    }
    setVariantState(v)
    try {
      window.localStorage.setItem(WALLPAPER_VARIANT_KEY, v)
    } catch {
      // Storage unavailable; the wallpaper still applies for this session.
    }
  }

  const applyCustomWallpaper = (dataUrl: string) => {
    setCustomWallpaper(dataUrl)
    setVariantState('custom')
    try {
      window.localStorage.setItem(CUSTOM_WALLPAPER_KEY, dataUrl)
      window.localStorage.setItem(WALLPAPER_VARIANT_KEY, 'custom')
    } catch {
      // Quota or storage failure: keep the wallpaper for this session only.
    }
  }

  const uploadCustomWallpaper = (): Promise<UploadResult> => {
    return new Promise((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = () => {
        const file = input.files?.[0]
        if (!file) {
          resolve({ ok: false, message: '' })
          return
        }
        processWallpaperFile(file)
          .then((dataUrl) => {
            try {
              // Probe quota before committing to state so a failure is reported cleanly.
              window.localStorage.setItem(CUSTOM_WALLPAPER_KEY, dataUrl)
            } catch {
              resolve({
                ok: false,
                message: 'That image is too large to save in the browser. Try a smaller one.',
              })
              return
            }
            applyCustomWallpaper(dataUrl)
            resolve({ ok: true })
          })
          .catch((err: unknown) => {
            resolve({
              ok: false,
              message: err instanceof Error ? err.message : 'Could not read that image.',
            })
          })
      }
      input.oncancel = () => resolve({ ok: false, message: '' })
      input.click()
    })
  }

  const clearCustomWallpaper = () => {
    setCustomWallpaper(null)
    if (variant === 'custom') setVariantState('tide')
    try {
      window.localStorage.removeItem(CUSTOM_WALLPAPER_KEY)
      if (variant === 'custom') window.localStorage.setItem(WALLPAPER_VARIANT_KEY, 'tide')
    } catch {
      // Storage unavailable; nothing more to do.
    }
  }

  const setTerminalTheme = (t: TerminalTheme) => {
    setTerminalThemeState(t)
    try {
      window.localStorage.setItem(TERMINAL_THEME_KEY, t)
    } catch {
      // Storage unavailable; the theme still applies for this session.
    }
  }

  const setSystemTheme = (t: SystemTheme) => {
    setSystemThemeState(t)
    try {
      window.localStorage.setItem(SYSTEM_THEME_KEY, t)
    } catch {
      // Storage unavailable; the theme still applies for this session.
    }
  }

  const setAccentColor = (c: AccentColor) => {
    setAccentColorState(c)
    try {
      window.localStorage.setItem(ACCENT_COLOR_KEY, c)
    } catch {
      // Storage unavailable; the accent still applies for this session.
    }
  }

  return (
    <Ctx.Provider
      value={{
        variant,
        setVariant,
        customWallpaper,
        uploadCustomWallpaper,
        clearCustomWallpaper,
        terminalTheme,
        setTerminalTheme,
        systemTheme,
        setSystemTheme,
        accentColor,
        setAccentColor,
      }}
    >
      {children}
    </Ctx.Provider>
  )
}
