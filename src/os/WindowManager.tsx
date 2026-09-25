import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { AppId, Bounds, FinderView, OpenAppOptions, OSWindow } from './types'

export type PowerAction = 'sleep' | 'restart' | 'shutdown'

interface WindowManagerCtx {
  windows: OSWindow[]
  openApp: (app: AppId, opts?: OpenAppOptions) => void
  closeWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  toggleMaximize: (id: string) => void
  focusWindow: (id: string) => void
  moveWindow: (id: string, x: number, y: number) => void
  setFolderPath: (id: string, path: string[]) => void
  finderView: FinderView
  setFinderView: (v: FinderView) => void
  activeApp: AppId
  topWindow: OSWindow | null
  powerAction: (a: PowerAction) => void
}

const Ctx = createContext<WindowManagerCtx | null>(null)

export function useWindows() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useWindows must be used inside WindowManagerProvider')
  return ctx
}

/** Apps that only ever have one window open at a time. */
const SINGLETONS: AppId[] = ['terminal', 'web', 'mail', 'notes', 'about', 'settings']

const DEFAULT_SIZE: Record<AppId, { w: number; h: number }> = {
  files: { w: 780, h: 480 },
  terminal: { w: 660, h: 430 },
  web: { w: 820, h: 540 },
  mail: { w: 640, h: 500 },
  notes: { w: 440, h: 440 },
  about: { w: 500, h: 400 },
  settings: { w: 580, h: 430 },
  quicklook: { w: 580, h: 460 },
}

function titleFor(app: AppId, opts?: OpenAppOptions): string {
  switch (app) {
    case 'files': {
      const p = opts?.folderPath ?? []
      return p.length > 0 ? p[p.length - 1] : 'Home'
    }
    case 'terminal':
      return 'namish — zsh'
    case 'web':
      return 'Web'
    case 'mail':
      return 'Mail'
    case 'notes':
      return 'Notes'
    case 'about':
      return 'About NamishOS'
    case 'settings':
      return 'Settings'
    case 'quicklook':
      return opts?.quickLook?.title ?? 'Preview'
  }
}

function sameTarget(a: OSWindow, app: AppId, opts?: OpenAppOptions): boolean {
  if (a.app !== app) return false
  if (app === 'files') {
    const pa = a.folderPath ?? []
    const pb = opts?.folderPath ?? []
    return pa.length === pb.length && pa.every((s, i) => s === pb[i])
  }
  if (app === 'quicklook') {
    return a.quickLook?.ref === opts?.quickLook?.ref && a.quickLook?.kind === opts?.quickLook?.kind
  }
  return SINGLETONS.includes(app)
}

function defaultBounds(app: AppId, cascade: number): Bounds {
  const vw = typeof window === 'undefined' ? 1280 : window.innerWidth
  const vh = typeof window === 'undefined' ? 800 : window.innerHeight
  const size = DEFAULT_SIZE[app]

  // Near-fullscreen on small screens
  if (vw < 640) {
    return { x: 8, y: 42, w: vw - 16, h: vh - 150 }
  }

  const w = Math.min(size.w, vw - 40)
  const h = Math.min(size.h, vh - 160)
  const x = Math.max(12, (vw - w) / 2 + ((cascade * 34) % 160) - 80)
  const y = Math.max(44, 90 + ((cascade * 28) % 120))
  return { x, y, w, h }
}

export function WindowManagerProvider({
  children,
  powerAction,
}: {
  children: ReactNode
  powerAction: (a: PowerAction) => void
}) {
  const [windows, setWindows] = useState<OSWindow[]>([])
  const [finderView, setFinderView] = useState<FinderView>('icons')
  const zRef = useRef(10)
  const idRef = useRef(0)

  const focusWindow = useCallback((id: string) => {
    zRef.current += 1
    const z = zRef.current
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, z, minimized: false } : w)))
  }, [])

  const openApp = useCallback(
    (app: AppId, opts?: OpenAppOptions) => {
      const existing = windows.find((w) => sameTarget(w, app, opts))
      if (existing) {
        focusWindow(existing.id)
        return
      }
      zRef.current += 1
      idRef.current += 1
      const bounds = defaultBounds(app, idRef.current)
      const win: OSWindow = {
        id: `win-${idRef.current}`,
        app,
        title: titleFor(app, opts),
        bounds,
        prevBounds: null,
        z: zRef.current,
        minimized: false,
        maximized: false,
        folderPath: app === 'files' ? (opts?.folderPath ?? []) : undefined,
        quickLook: app === 'quicklook' ? opts?.quickLook : undefined,
      }
      setWindows((ws) => [...ws, win])
    },
    [windows, focusWindow],
  )

  const closeWindow = useCallback((id: string) => {
    setWindows((ws) => ws.filter((w) => w.id !== id))
  }, [])

  const minimizeWindow = useCallback((id: string) => {
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, minimized: true } : w)))
  }, [])

  const toggleMaximize = useCallback((id: string) => {
    setWindows((ws) =>
      ws.map((w) => {
        if (w.id !== id) return w
        if (w.maximized && w.prevBounds) {
          return { ...w, maximized: false, bounds: w.prevBounds, prevBounds: null }
        }
        const vw = window.innerWidth
        const vh = window.innerHeight
        return {
          ...w,
          maximized: true,
          prevBounds: w.bounds,
          bounds: { x: 6, y: 38, w: vw - 12, h: vh - 46 },
        }
      }),
    )
  }, [])

  const moveWindow = useCallback((id: string, x: number, y: number) => {
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, bounds: { ...w.bounds, x, y } } : w)))
  }, [])

  const setFolderPath = useCallback(
    (id: string, path: string[]) => {
      setWindows((ws) =>
        ws.map((w) =>
          w.id === id ? { ...w, folderPath: path, title: titleFor('files', { folderPath: path }) } : w,
        ),
      )
    },
    [],
  )

  const topWindow = useMemo(() => {
    const visible = windows.filter((w) => !w.minimized)
    if (visible.length === 0) return null
    return visible.reduce((a, b) => (a.z > b.z ? a : b))
  }, [windows])

  const activeApp: AppId = topWindow?.app ?? 'files'

  const value: WindowManagerCtx = {
    windows,
    openApp,
    closeWindow,
    minimizeWindow,
    toggleMaximize,
    focusWindow,
    moveWindow,
    setFolderPath,
    finderView,
    setFinderView,
    activeApp,
    topWindow,
    powerAction,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
