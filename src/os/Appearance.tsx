import { createContext, useContext, useState, type ReactNode } from 'react'

export type WallpaperVariant = 'tide' | 'drift' | 'ember'
export type TerminalTheme = 'dark' | 'light' | 'phosphor'

const TERMINAL_THEME_KEY = 'namishos.terminal-theme'

function readStoredTerminalTheme(): TerminalTheme {
  try {
    const raw = window.localStorage.getItem(TERMINAL_THEME_KEY)
    if (raw === 'dark' || raw === 'light' || raw === 'phosphor') return raw
  } catch {
    // Storage unavailable; fall back to the default.
  }
  return 'dark'
}

interface AppearanceCtx {
  variant: WallpaperVariant
  setVariant: (v: WallpaperVariant) => void
  terminalTheme: TerminalTheme
  setTerminalTheme: (t: TerminalTheme) => void
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

  const setTerminalTheme = (t: TerminalTheme) => {
    setTerminalThemeState(t)
    try {
      window.localStorage.setItem(TERMINAL_THEME_KEY, t)
    } catch {
      // Storage unavailable; the theme still applies for this session.
    }
  }

  return <Ctx.Provider value={{ variant, setVariant, terminalTheme, setTerminalTheme }}>{children}</Ctx.Provider>
}
