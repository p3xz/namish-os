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

export type PowerAction = 'sleep' | 'lock' | 'restart' | 'shutdown'

/** Edge a window can be snapped to: left/right half, or top for fullscreen. */
export type SnapEdge = 'left' | 'right' | 'top'

/** Bounds for a window snapped to a screen edge, matching maximize geometry. */
function snapBounds(edge: SnapEdge): Bounds {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const gap = 6
  const y = 38
  const h = vh - 46
  if (edge === 'top') return { x: gap, y, w: vw - gap * 2, h }
  const w = (vw - gap * 3) / 2
  return edge === 'left'
    ? { x: gap, y, w, h }
    : { x: gap * 2 + w, y, w, h }
}

/** An in-flight genie minimize/restore animation, rendered by GenieOverlay. */
export interface GenieRequest {
  winId: string
  direction: 'out' | 'in'
  /** Window rect in viewport coords: live rect for 'out', target rect for 'in'. */
  rect: Bounds
  /** Center of the window's Dock icon in viewport coords. */
  target: { x: number; y: number }
}

/** Map a window's app to the Dock icon it minimizes into. Null when the app has no Dock icon. */
export function dockIdForApp(app: AppId): string | null {
  switch (app) {
    case 'files':
    case 'quicklook':
      return 'files'
    case 'terminal':
    case 'web':
    case 'messages':
    case 'notes':
    case 'ai':
    case 'insidcode':
    case 'calculator':
      return app
    default:
      return null
  }
}

interface WindowManagerCtx {
  windows: OSWindow[]
  openApp: (app: AppId, opts?: OpenAppOptions) => void
  closeWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  /** Minimize with the genie effect; falls back to a plain minimize when no Dock target exists. */
  beginGenieMinimize: (id: string) => void
  /** Called by GenieOverlay when its animation completes. */
  finishGenie: () => void
  /** The currently running genie animation, if any. */
  genie: GenieRequest | null
  toggleMaximize: (id: string) => void
  focusWindow: (id: string) => void
  moveWindow: (id: string, x: number, y: number) => void
  /** Snap a window to a screen edge: left/right halves, or top for fullscreen. */
  snapWindow: (id: string, edge: SnapEdge) => void
  /** Restore a snapped window to its pre-snap bounds. */
  unsnapWindow: (id: string) => void
  setFolderPath: (id: string, path: string[]) => void
  finderView: FinderView
  setFinderView: (v: FinderView) => void
  activeApp: AppId
  topWindow: OSWindow | null
  powerAction: (a: PowerAction) => void
  /** Set when a brand-new window is launched (not on focus). Dock bounces the icon. */
  lastLaunch: { dockId: string; at: number } | null
}

const Ctx = createContext<WindowManagerCtx | null>(null)

export function useWindows() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useWindows must be used inside WindowManagerProvider')
  return ctx
}

/** Apps that only ever have one window open at a time. */
const SINGLETONS: AppId[] = ['terminal', 'web', 'messages', 'notes', 'about', 'settings', 'ai', 'insidcode', 'calculator']

/** Which dock icon represents a freshly launched app. */
function dockIdForLaunch(app: AppId, opts?: OpenAppOptions): string | null {
  if (app === 'files') return opts?.folderPath?.[0] === 'Projects' ? 'projects' : 'files'
  if (app === 'quicklook') return 'files'
  if (app === 'terminal' || app === 'web' || app === 'messages' || app === 'notes' || app === 'ai' || app === 'insidcode' || app === 'calculator')
    return app
  return null
}

const DEFAULT_SIZE: Record<AppId, { w: number; h: number }> = {
  files: { w: 820, h: 520 },
  terminal: { w: 660, h: 430 },
  web: { w: 820, h: 540 },
  messages: { w: 760, h: 520 },
  notes: { w: 440, h: 440 },
  about: { w: 500, h: 400 },
  settings: { w: 580, h: 430 },
  quicklook: { w: 580, h: 460 },
  ai: { w: 520, h: 560 },
  insidcode: { w: 920, h: 620 },
  calculator: { w: 320, h: 500 },
}

function titleFor(app: AppId, opts?: OpenAppOptions): string {
  switch (app) {
    case 'files': {
      const p = opts?.folderPath ?? []
      return p.length > 0 ? p[p.length - 1] : 'Home'
    }
    case 'terminal':
      return 'namish - zsh'
    case 'web':
      return 'Web'
    case 'messages':
      return 'Messages'
    case 'notes':
      return 'Notes'
    case 'about':
      return 'About NamishOS'
    case 'settings':
      return 'Settings'
    case 'ai':
      return 'AI Assistant'
    case 'insidcode':
      return 'InsidCode'
    case 'calculator':
      return 'Calculator'
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
  const [lastLaunch, setLastLaunch] = useState<{ dockId: string; at: number } | null>(null)
  const [genie, setGenie] = useState<GenieRequest | null>(null)
  const zRef = useRef(10)
  const idRef = useRef(0)

  /** Center of the window's Dock icon in viewport coords, or null when unavailable. */
  const dockTargetFor = (app: AppId): { x: number; y: number } | null => {
    const dockId = dockIdForApp(app)
    if (!dockId) return null
    const el = document.querySelector(`[data-dock-app="${dockId}"]`)
    if (!el) return null
    const r = el.getBoundingClientRect()
    if (r.width === 0) return null
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
  }

  const minimizeWindow = useCallback((id: string) => {
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, minimized: true } : w)))
  }, [])

  /** Minimize with the true macOS-style genie effect. Only one genie runs at a
   *  time; anything else (no Dock icon, another genie in flight) falls back to
   *  the plain scale minimize so the window never gets stuck. */
  const beginGenieMinimize = useCallback(
    (id: string) => {
      const win = windows.find((w) => w.id === id)
      if (!win || win.minimized || win.genieAnim) return
      const target = !genie ? dockTargetFor(win.app) : null
      if (!target) {
        minimizeWindow(id)
        return
      }
      const node = document.querySelector(`#window-layer [data-window-id="${id}"]`)
      const r = node?.getBoundingClientRect()
      const rect: Bounds =
        r && r.width > 4 && r.height > 4
          ? { x: r.left, y: r.top, w: r.width, h: r.height }
          : { ...win.bounds }
      setGenie({ winId: id, direction: 'out', rect, target })
      setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, genieAnim: 'out' as const } : w)))
    },
    [windows, genie, minimizeWindow],
  )

  /** Apply the end state once a genie animation completes. */
  const finishGenie = useCallback(() => {
    if (!genie) return
    const g = genie
    setGenie(null)
    if (g.direction === 'out') {
      setWindows((ws) =>
        ws.map((w) => (w.id === g.winId ? { ...w, minimized: true, genieAnim: null } : w)),
      )
    } else {
      zRef.current += 1
      const z = zRef.current
      setWindows((ws) =>
        ws.map((w) =>
          w.id === g.winId ? { ...w, minimized: false, genieAnim: null, z, snap: true } : w,
        ),
      )
      // Clear the snap flag after the frame paints so later moves animate normally.
      window.setTimeout(() => {
        setWindows((ws) => ws.map((w) => (w.id === g.winId ? { ...w, snap: false } : w)))
      }, 100)
    }
  }, [genie])

  const focusWindow = useCallback(
    (id: string) => {
      const win = windows.find((w) => w.id === id)
      if (!win || win.genieAnim) return
      if (win.minimized) {
        // Restore with the genie effect: the window un-sucks out of the Dock.
        const target = !genie ? dockTargetFor(win.app) : null
        if (target) {
          setGenie({ winId: id, direction: 'in', rect: { ...win.bounds }, target })
          setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, genieAnim: 'in' as const } : w)))
          return
        }
      }
      zRef.current += 1
      const z = zRef.current
      setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, z, minimized: false } : w)))
    },
    [windows, genie],
  )

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
      const dockId = dockIdForLaunch(app, opts)
      if (dockId) setLastLaunch({ dockId, at: Date.now() })
    },
    [windows, focusWindow],
  )

  const closeWindow = useCallback((id: string) => {
    setWindows((ws) => ws.filter((w) => w.id !== id))
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

  const snapWindow = useCallback((id: string, edge: SnapEdge) => {
    setWindows((ws) =>
      ws.map((w) => {
        if (w.id !== id || w.minimized || w.genieAnim) return w
        // Preserve the pre-snap bounds so a drag restores them; re-snapping a
        // snapped window keeps the original bounds.
        const prev = w.snapped || w.maximized ? w.prevBounds : w.bounds
        if (!prev) return w
        if (edge === 'top') {
          return { ...w, maximized: true, snapped: null, prevBounds: prev, bounds: snapBounds(edge) }
        }
        return { ...w, maximized: false, snapped: edge, prevBounds: prev, bounds: snapBounds(edge) }
      }),
    )
  }, [])

  const unsnapWindow = useCallback((id: string) => {
    setWindows((ws) =>
      ws.map((w) =>
        w.id === id && w.snapped && w.prevBounds
          ? { ...w, snapped: null, bounds: w.prevBounds, prevBounds: null }
          : w,
      ),
    )
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
    beginGenieMinimize,
    finishGenie,
    genie,
    toggleMaximize,
    focusWindow,
    moveWindow,
    snapWindow,
    unsnapWindow,
    setFolderPath,
    finderView,
    setFinderView,
    activeApp,
    topWindow,
    powerAction,
    lastLaunch,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
