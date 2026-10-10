import { motion } from 'framer-motion'
import { Minus, Plus, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { useWindows, type SnapEdge } from '@/os/WindowManager'
import { useAppearance } from '@/os/Appearance'
import type { OSWindow } from '@/os/types'

/** Pixel distance from a screen edge that counts as a snap zone while dragging. */
const SNAP_EDGE_PX = 8

/** Which edge, if any, the pointer is in the snap zone for. */
function snapZoneAt(clientX: number, clientY: number): SnapEdge | null {
  if (clientX <= SNAP_EDGE_PX) return 'left'
  if (clientX >= window.innerWidth - SNAP_EDGE_PX) return 'right'
  if (clientY <= SNAP_EDGE_PX / 2) return 'top'
  return null
}

/** Preview rect for a snap zone, matching the snapped window geometry. */
function snapPreviewBounds(edge: SnapEdge) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const gap = 6
  const y = 38
  const h = vh - 46
  if (edge === 'top') return { x: gap, y, w: vw - gap * 2, h }
  const w = (vw - gap * 3) / 2
  return edge === 'left' ? { x: gap, y, w, h } : { x: gap * 2 + w, y, w, h }
}

export type WindowTone = 'light' | 'dark'

function TrafficButton({
  color,
  hoverBg,
  label,
  onClick,
  children,
}: {
  color: string
  hoverBg: string
  label: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      data-traffic
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      onPointerDown={(e) => e.stopPropagation()}
      className="group flex size-3 items-center justify-center rounded-full"
      style={{ backgroundColor: color }}
    >
      <span className={`opacity-0 transition-opacity group-hover:opacity-100 ${hoverBg}`}>{children}</span>
    </button>
  )
}

export default function WindowFrame({
  win,
  tone = 'light',
  children,
}: {
  win: OSWindow
  tone?: WindowTone
  children: ReactNode
}) {
  const { closeWindow, beginGenieMinimize, toggleMaximize, focusWindow, moveWindow, snapWindow, unsnapWindow } = useWindows()
  const [dragging, setDragging] = useState(false)
  const [snapPreview, setSnapPreview] = useState<SnapEdge | null>(null)

  const onTitlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('[data-traffic]')) return
    if ((e.target as HTMLElement).closest('button')) return
    focusWindow(win.id)
    if (win.maximized) return
    setDragging(true)
    const startX = e.clientX
    const startY = e.clientY
    let baseX: number
    let baseY: number
    if (win.snapped && win.prevBounds) {
      // Dragging a snapped window frees it: restore the original size and
      // re-anchor the drag so the cursor keeps its relative position on the
      // title bar (macOS-style).
      const restored = win.prevBounds
      const frac = Math.min(
        0.95,
        Math.max(0.05, (e.clientX - win.bounds.x) / win.bounds.w),
      )
      baseX = e.clientX - restored.w * frac
      baseY = Math.max(34, restored.y)
      unsnapWindow(win.id)
    } else {
      baseX = win.bounds.x
      baseY = win.bounds.y
    }
    const onMove = (ev: PointerEvent) => {
      const nx = baseX + ev.clientX - startX
      const ny = Math.max(34, baseY + ev.clientY - startY)
      moveWindow(win.id, nx, ny)
      setSnapPreview(snapZoneAt(ev.clientX, ev.clientY))
    }
    const onUp = (ev: PointerEvent) => {
      setDragging(false)
      setSnapPreview(null)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      const zone = snapZoneAt(ev.clientX, ev.clientY)
      if (zone) snapWindow(win.id, zone)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const minimizeY = typeof window === 'undefined' ? 600 : window.innerHeight - win.bounds.y
  const { systemTheme } = useAppearance()
  // Apps with a dark tone (Terminal) keep dark chrome even when the system
  // is in light mode; everything else follows the system theme.
  const dark = tone === 'dark' || systemTheme === 'dark'
  // While a genie animation is in flight the window hides instantly; the
  // GenieOverlay animates slices of a live clone instead.
  const genieRunning = win.genieAnim != null

  const preview = snapPreview ? snapPreviewBounds(snapPreview) : null

  return (
    <>
      {preview && (
        <div
          aria-hidden
          className="pointer-events-none fixed z-[5] rounded-xl border-2 transition-all duration-150 ease-out"
          style={{
            left: preview.x,
            top: preview.y,
            width: preview.w,
            height: preview.h,
            borderColor: 'var(--accent)',
            backgroundColor: 'color-mix(in srgb, var(--accent) 18%, transparent)',
          }}
        />
      )}
      <motion.div
      data-window-id={win.id}
      initial={{
        opacity: 0,
        scale: 0.9,
        x: win.bounds.x,
        y: win.bounds.y + 16,
        width: win.bounds.w,
        height: win.bounds.h,
      }}
      animate={
        genieRunning
          ? { opacity: 0, transition: { duration: 0 } }
          : win.minimized
            ? {
                opacity: 0,
                scale: 0.05,
                x: win.bounds.x,
                y: minimizeY,
                width: win.bounds.w,
                height: win.bounds.h,
                transition: { duration: 0.28, ease: 'easeIn' },
              }
            : {
                opacity: 1,
                scale: 1,
                x: win.bounds.x,
                y: win.bounds.y,
                width: win.bounds.w,
                height: win.bounds.h,
                transition: win.snap
                  ? { duration: 0 }
                  : dragging
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 420, damping: 38 },
              }
      }
      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.15, ease: 'easeIn' } }}
      style={{
        zIndex: win.z,
        transformOrigin: '50% 100%',
        pointerEvents: win.minimized || genieRunning ? 'none' : 'auto',
      }}
      className={`chrome-window absolute left-0 top-0 flex flex-col overflow-hidden rounded-xl border backdrop-blur-2xl ${
        dark ? 'win-tone-dark' : ''
      }`}
      onPointerDown={() => focusWindow(win.id)}
    >
      {/* Title bar */}
      <div
        className="chrome-titlebar relative flex h-11 shrink-0 touch-none items-center"
        onPointerDown={onTitlePointerDown}
        onDoubleClick={() => toggleMaximize(win.id)}
      >
        <div className="absolute left-4 flex items-center gap-2">
          <TrafficButton color="#ff5f57" hoverBg="text-red-900" label="Close" onClick={() => closeWindow(win.id)}>
            <X size={8} strokeWidth={3} />
          </TrafficButton>
          <TrafficButton color="#febc2e" hoverBg="text-amber-900" label="Minimize" onClick={() => beginGenieMinimize(win.id)}>
            <Minus size={8} strokeWidth={3} />
          </TrafficButton>
          <TrafficButton color="#28c840" hoverBg="text-green-900" label="Zoom" onClick={() => toggleMaximize(win.id)}>
            <Plus size={8} strokeWidth={3} />
          </TrafficButton>
        </div>
        <div className="pointer-events-none mx-auto flex max-w-[60%] items-center gap-2">
          <span className="chrome-title truncate text-[13px] font-semibold">{win.title}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </motion.div>
    </>
  )
}
