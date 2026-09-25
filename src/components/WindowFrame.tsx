import { motion } from 'framer-motion'
import { Minus, Plus, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { useWindows } from '@/os/WindowManager'
import type { OSWindow } from '@/os/types'

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
  const { closeWindow, minimizeWindow, toggleMaximize, focusWindow, moveWindow } = useWindows()
  const [dragging, setDragging] = useState(false)

  const onTitlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('[data-traffic]')) return
    if ((e.target as HTMLElement).closest('button')) return
    focusWindow(win.id)
    if (win.maximized) return
    setDragging(true)
    const startX = e.clientX
    const startY = e.clientY
    const origX = win.bounds.x
    const origY = win.bounds.y
    const onMove = (ev: PointerEvent) => {
      const nx = origX + ev.clientX - startX
      const ny = Math.max(34, origY + ev.clientY - startY)
      moveWindow(win.id, nx, ny)
    }
    const onUp = () => {
      setDragging(false)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const minimizeY = typeof window === 'undefined' ? 600 : window.innerHeight - win.bounds.y
  const dark = tone === 'dark'

  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.9,
        x: win.bounds.x,
        y: win.bounds.y + 16,
        width: win.bounds.w,
        height: win.bounds.h,
      }}
      animate={
        win.minimized
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
              transition: dragging
                ? { duration: 0 }
                : { type: 'spring', stiffness: 420, damping: 38 },
            }
      }
      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.15, ease: 'easeIn' } }}
      style={{
        zIndex: win.z,
        transformOrigin: '50% 100%',
        pointerEvents: win.minimized ? 'none' : 'auto',
      }}
      className={`absolute left-0 top-0 flex flex-col overflow-hidden rounded-xl border backdrop-blur-2xl ${
        dark
          ? 'border-white/15 bg-[#232328]/90 shadow-[0_24px_80px_rgba(0,0,0,0.55)]'
          : 'border-black/15 bg-[#f2f2f4]/90 shadow-[0_24px_80px_rgba(0,0,0,0.35)]'
      }`}
      onPointerDown={() => focusWindow(win.id)}
    >
      {/* Title bar */}
      <div
        className={`relative flex h-11 shrink-0 touch-none items-center border-b ${
          dark ? 'border-white/10 bg-white/[0.06]' : 'border-black/10 bg-white/40'
        }`}
        onPointerDown={onTitlePointerDown}
        onDoubleClick={() => toggleMaximize(win.id)}
      >
        <div className="absolute left-4 flex items-center gap-2">
          <TrafficButton color="#ff5f57" hoverBg="text-red-900" label="Close" onClick={() => closeWindow(win.id)}>
            <X size={8} strokeWidth={3} />
          </TrafficButton>
          <TrafficButton color="#febc2e" hoverBg="text-amber-900" label="Minimize" onClick={() => minimizeWindow(win.id)}>
            <Minus size={8} strokeWidth={3} />
          </TrafficButton>
          <TrafficButton color="#28c840" hoverBg="text-green-900" label="Zoom" onClick={() => toggleMaximize(win.id)}>
            <Plus size={8} strokeWidth={3} />
          </TrafficButton>
        </div>
        <div className="pointer-events-none mx-auto flex max-w-[60%] items-center gap-2">
          <span
            className={`truncate text-[13px] font-semibold ${
              dark ? 'text-white/90' : 'text-neutral-800'
            }`}
          >
            {win.title}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </motion.div>
  )
}
