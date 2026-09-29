import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Calculator,
  FileText,
  Folder,
  Globe,
  Info,
  MessageCircle,
  NotebookPen,
  Plus,
  Search,
  Settings2,
  Sparkles,
  SquareTerminal,
  Swords,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useWindows } from '@/os/WindowManager'
import { onMissionControlChange, setMissionControlOpen, toggleMissionControl } from '@/os/missionControlBus'
import { onSpotlightOpen } from '@/os/spotlightBus'
import type { AppId, OSWindow } from '@/os/types'

/* ------------------------------------------------------------------ icons */

const APP_GLYPH: Record<AppId, { icon: LucideIcon; chip: string; iconColor: string; label: string }> = {
  files: { icon: Folder, chip: 'bg-blue-100', iconColor: 'text-blue-600', label: 'Files' },
  terminal: { icon: SquareTerminal, chip: 'bg-neutral-900', iconColor: 'text-emerald-400', label: 'Terminal' },
  web: { icon: Globe, chip: 'bg-sky-100', iconColor: 'text-sky-600', label: 'Web' },
  messages: { icon: MessageCircle, chip: 'bg-green-100', iconColor: 'text-green-600', label: 'Messages' },
  notes: { icon: NotebookPen, chip: 'bg-amber-100', iconColor: 'text-amber-600', label: 'Notes' },
  about: { icon: Info, chip: 'bg-neutral-200', iconColor: 'text-neutral-600', label: 'About' },
  settings: { icon: Settings2, chip: 'bg-neutral-200', iconColor: 'text-neutral-600', label: 'Settings' },
  quicklook: { icon: FileText, chip: 'bg-violet-100', iconColor: 'text-violet-600', label: 'Preview' },
  ai: { icon: Sparkles, chip: 'bg-fuchsia-100', iconColor: 'text-fuchsia-600', label: 'AI' },
  insidcode: { icon: Swords, chip: 'bg-orange-100', iconColor: 'text-orange-600', label: 'InsidCode' },
  calculator: { icon: Calculator, chip: 'bg-orange-100', iconColor: 'text-orange-600', label: 'Calculator' },
}

/* ------------------------------------------------------------------ layout */

/** Target rectangle (in viewport coords) for a tiled window. */
interface TileRect {
  x: number
  y: number
  w: number
  h: number
}

/** Arrange windows in a grid that fills the available area, preserving aspect ratios. */
function layoutTiles(
  wins: OSWindow[],
  vw: number,
  vh: number,
  topOffset: number,
): Map<string, TileRect> {
  const rects = new Map<string, TileRect>()
  if (wins.length === 0) return rects

  const aspect = vw / vh
  const cols = Math.max(1, Math.ceil(Math.sqrt(wins.length * aspect)))
  const rows = Math.ceil(wins.length / cols)
  const pad = 28
  const cellW = vw / cols
  const cellH = vh / rows

  wins.forEach((w, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    const bw = Math.max(w.bounds.w, 220)
    const bh = Math.max(w.bounds.h, 150)
    // Never blow a window up more than 1.25x; never shrink a tile below usable size.
    const s = Math.min((cellW - pad) / bw, (cellH - pad) / bh, 1.25)
    const tw = Math.max(bw * s, 170)
    const th = Math.max(bh * s, 118)
    rects.set(w.id, {
      x: col * cellW + (cellW - tw) / 2,
      y: topOffset + row * cellH + (cellH - th) / 2,
      w: tw,
      h: th,
    })
  })
  return rects
}

/* ------------------------------------------------------------------ tile */

function TrafficLights() {
  return (
    <span className="flex shrink-0 items-center gap-1.5" aria-hidden>
      <span className="size-2.5 rounded-full bg-[#ff5f57] ring-1 ring-black/10" />
      <span className="size-2.5 rounded-full bg-[#febc2e] ring-1 ring-black/10" />
      <span className="size-2.5 rounded-full bg-[#28c840] ring-1 ring-black/10" />
    </span>
  )
}

function WindowTile({
  win,
  rect,
  onPick,
  onClose,
}: {
  win: OSWindow
  rect: TileRect
  onPick: () => void
  onClose: () => void
}) {
  const glyph = APP_GLYPH[win.app]
  const GlyphIcon = glyph.icon

  return (
    <motion.div
      className="group absolute cursor-pointer overflow-hidden rounded-[10px] border border-black/25 bg-white shadow-[0_18px_50px_rgba(0,0,0,0.45)]"
      initial={{
        x: win.bounds.x,
        y: win.bounds.y,
        width: win.bounds.w,
        height: win.bounds.h,
        opacity: 0.4,
      }}
      animate={{ x: rect.x, y: rect.y, width: rect.w, height: rect.h, opacity: 1 }}
      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.16 } }}
      transition={{ type: 'spring', stiffness: 300, damping: 32 }}
      onClick={onPick}
      role="button"
      aria-label={`Switch to ${win.title}`}
    >
      {/* Mini title bar */}
      <div className="flex h-7 items-center gap-2 border-b border-black/[0.07] bg-neutral-100/95 px-2.5">
        <TrafficLights />
        <span className="min-w-0 flex-1 truncate text-center text-[11px] font-medium text-neutral-700">
          {win.title}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          className="flex size-5 shrink-0 items-center justify-center rounded-full text-neutral-400 opacity-0 transition-all hover:bg-red-500 hover:text-white group-hover:opacity-100"
          title={`Close ${win.title}`}
          aria-label={`Close ${win.title}`}
        >
          <X size={13} strokeWidth={2.5} />
        </button>
      </div>
      {/* Body: app identity */}
      <div className="flex h-[calc(100%-28px)] flex-col items-center justify-center gap-2 bg-gradient-to-b from-white to-neutral-100">
        <span className={`flex size-12 items-center justify-center rounded-2xl ${glyph.chip} shadow-sm`}>
          <GlyphIcon size={24} className={glyph.iconColor} strokeWidth={1.8} />
        </span>
        <span className="text-[12px] font-medium text-neutral-500">{glyph.label}</span>
      </div>
      {/* Hover ring */}
      <div className="pointer-events-none absolute inset-0 rounded-[10px] ring-2 ring-inset ring-transparent transition group-hover:ring-[#0a84ff]" />
    </motion.div>
  )
}

/* ------------------------------------------------------------------ view */

const QUICK_LAUNCH: AppId[] = ['files', 'terminal', 'notes', 'web', 'ai', 'calculator']

export default function MissionControl() {
  const { windows, openApp, focusWindow, closeWindow } = useWindows()
  const [open, setOpen] = useState(false)
  const [viewport, setViewport] = useState({ vw: 1280, vh: 800 })

  // Bus: menu bar icon, N menu, and hot corner toggles call in here.
  useEffect(() => onMissionControlChange(setOpen), [])

  // Ctrl+Up (macOS's Mission Control gesture on keyboards) toggles it.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey && e.code === 'ArrowUp') {
        e.preventDefault()
        toggleMissionControl()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Opening Spotlight dismisses Mission Control, like the real thing.
  useEffect(() => onSpotlightOpen(() => setMissionControlOpen(false)), [])

  // Escape closes.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMissionControlOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // Snapshot the viewport while open so tiles stay put.
  useEffect(() => {
    if (open) setViewport({ vw: window.innerWidth, vh: window.innerHeight })
  }, [open])

  const visible = useMemo(() => windows.filter((w) => !w.minimized), [windows])
  const minimized = useMemo(() => windows.filter((w) => w.minimized), [windows])

  const headerH = 76
  const stripH = minimized.length > 0 ? 172 : 0
  const rects = useMemo(
    () =>
      open
        ? layoutTiles(visible, viewport.vw, viewport.vh - headerH - stripH, headerH)
        : new Map<string, TileRect>(),
    [open, visible, viewport, stripH],
  )

  const pick = (id: string) => {
    focusWindow(id)
    setMissionControlOpen(false)
  }
  const closeOne = (id: string) => closeWindow(id)
  const closeAll = () => windows.forEach((w) => closeWindow(w.id))

  const windowWord = visible.length === 1 ? 'window' : 'windows'

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[250]" role="dialog" aria-label="Mission Control">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-[#1c1c22]/72 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setMissionControlOpen(false)}
          />

          {/* Header */}
          <motion.div
            className="absolute inset-x-0 top-[30px] flex items-center justify-between px-6"
            style={{ height: headerH - 30 }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
          >
            <div className="flex items-baseline gap-3">
              <h2 className="text-[17px] font-semibold text-white">Mission Control</h2>
              {visible.length > 0 && (
                <span className="text-[13px] text-white/60">
                  {visible.length} {windowWord} open
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {windows.length > 0 && (
                <button
                  onClick={closeAll}
                  className="rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-white/20"
                >
                  Close All
                </button>
              )}
              <span className="hidden text-[12px] text-white/50 sm:inline">Esc to exit</span>
            </div>
          </motion.div>

          {/* Tiles */}
          <AnimatePresence>
            {visible.map((win) => {
              const rect = rects.get(win.id)
              if (!rect) return null
              return (
                <WindowTile
                  key={win.id}
                  win={win}
                  rect={rect}
                  onPick={() => pick(win.id)}
                  onClose={() => closeOne(win.id)}
                />
              )
            })}
          </AnimatePresence>

          {/* Empty state */}
          {windows.length === 0 && (
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center gap-5"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
            >
              <span className="flex size-16 items-center justify-center rounded-3xl bg-white/10">
                <Search size={28} className="text-white/70" />
              </span>
              <div className="text-center">
                <p className="text-[17px] font-semibold text-white">No windows open</p>
                <p className="mt-1 text-[13.5px] text-white/60">
                  Open an app to get started, or press Esc to leave Mission Control.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                {QUICK_LAUNCH.map((app) => {
                  const g = APP_GLYPH[app]
                  const Icon = g.icon
                  return (
                    <button
                      key={app}
                      onClick={() => {
                        openApp(app)
                        setMissionControlOpen(false)
                      }}
                      className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[13.5px] font-medium text-white transition-colors hover:bg-white/25"
                    >
                      <Icon size={15} />
                      {g.label}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Minimized strip */}
          {minimized.length > 0 && (
            <motion.div
              className="absolute inset-x-0 bottom-0 px-6 pb-5"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-white/50">
                Minimized
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {minimized.map((win) => {
                  const g = APP_GLYPH[win.app]
                  const Icon = g.icon
                  return (
                    <div
                      key={win.id}
                      className="group relative w-44 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-white/20 bg-white/95 shadow-lg transition-transform hover:-translate-y-0.5"
                      onClick={() => pick(win.id)}
                      role="button"
                      aria-label={`Restore ${win.title}`}
                    >
                      <div className="flex h-6 items-center gap-1.5 bg-neutral-100 px-2">
                        <TrafficLights />
                        <span className="min-w-0 flex-1 truncate text-center text-[10.5px] font-medium text-neutral-600">
                          {win.title}
                        </span>
                      </div>
                      <div className="flex h-[72px] items-center justify-center gap-2 bg-gradient-to-b from-white to-neutral-100">
                        <span className={`flex size-9 items-center justify-center rounded-xl ${g.chip}`}>
                          <Icon size={18} className={g.iconColor} />
                        </span>
                        <span className="text-[12px] font-medium text-neutral-600">{g.label}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          closeOne(win.id)
                        }}
                        className="absolute right-1.5 top-1 flex size-5 items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-opacity hover:bg-red-500 group-hover:opacity-100"
                        title={`Close ${win.title}`}
                        aria-label={`Close ${win.title}`}
                      >
                        <X size={12} strokeWidth={2.5} />
                      </button>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Desktop hint: click empty space to start fresh */}
          {windows.length > 0 && (
            <motion.button
              className="absolute bottom-5 right-6 flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-white/25"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMissionControlOpen(false)}
            >
              <Plus size={14} />
              Show Desktop
            </motion.button>
          )}
        </div>
      )}
    </AnimatePresence>
  )
}
