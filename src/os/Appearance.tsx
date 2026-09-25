import { createContext, useContext, useState, type ReactNode } from 'react'

export type WallpaperVariant = 'nebula' | 'sunset' | 'ocean'

interface AppearanceCtx {
  variant: WallpaperVariant
  setVariant: (v: WallpaperVariant) => void
}

const Ctx = createContext<AppearanceCtx | null>(null)

export function useAppearance() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAppearance must be used inside AppearanceProvider')
  return ctx
}

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [variant, setVariant] = useState<WallpaperVariant>('nebula')
  return <Ctx.Provider value={{ variant, setVariant }}>{children}</Ctx.Provider>
}
