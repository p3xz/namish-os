import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type WallpaperVariant = 'tide' | 'drift' | 'ember'
export type TerminalTheme = 'dark' | 'light' | 'phosphor'
export type SystemTheme = 'light' | 'dark'
export type AccentColor = 'blue' | 'green' | 'orange' | 'purple' | 'pink'

const TERMINAL_THEME_KEY = 'namishos.terminal-theme'
const SYSTEM_THEME_KEY = 'namishos.system-theme'
const ACCENT_COLOR_KEY = 'namishos.accent-color'

const SYSTEM_THEMES: SystemTheme[] = ['light', 'dark']
const ACCENT_COLORS: AccentColor[] = ['blue', 'green', 'orange', 'purple', 'pink']

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

interface AppearanceCtx {
  variant: WallpaperVariant
  setVariant: (v: WallpaperVariant) => void
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
  const [variant, setVariant] = useState<WallpaperVariant>('tide')
  const [terminalTheme, setTerminalThemeState] = useState<TerminalTheme>(readStoredTerminalTheme)
  const [systemTheme, setSystemThemeState] = useState<SystemTheme>(readStoredSystemTheme)
  const [accentColor, setAccentColorState] = useState<AccentColor>(readStoredAccentColor)

  // The CSS variables in index.css read these attributes to theme the
  // menu bar, window chrome, and Dock without re-rendering anything.
  useEffect(() => {
    document.documentElement.dataset.systemTheme = systemTheme
    document.documentElement.dataset.accent = accentColor
  }, [systemTheme, accentColor])

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
      value={{ variant, setVariant, terminalTheme, setTerminalTheme, systemTheme, setSystemTheme, accentColor, setAccentColor }}
    >
      {children}
    </Ctx.Provider>
  )
}
