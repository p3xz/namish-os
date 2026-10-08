import { useEffect, useRef } from 'react'
import { useWindows } from '@/os/WindowManager'
import { onMissionControlChange } from '@/os/missionControlBus'

/**
 * System-wide keyboard shortcuts, macOS-style. Rendered only on the unlocked
 * desktop (see App), so the lock and sleep screens never receive them.
 *
 * - Cmd/Ctrl+W: close the frontmost window
 * - Cmd/Ctrl+M: minimize the frontmost window (genie effect into the Dock)
 * - Cmd/Ctrl+1/2/3: switch the frontmost Finder window between the
 *   icon, list, and gallery views
 *
 * Shortcuts stay quiet while Spotlight or Mission Control are open, so a Cmd
 * keypress from inside those overlays never closes or minimizes a window
 * hiding behind them. Follows the same window-keydown pattern as Spotlight.
 */
export default function GlobalShortcuts() {
  const { topWindow, closeWindow, beginGenieMinimize, setFinderView } = useWindows()
  const stateRef = useRef({ topWindow, closeWindow, beginGenieMinimize, setFinderView })
  stateRef.current = { topWindow, closeWindow, beginGenieMinimize, setFinderView }

  // Track Mission Control so shortcuts stay quiet while it is open.
  const missionOpenRef = useRef(false)
  useEffect(
    () =>
      onMissionControlChange((open) => {
        missionOpenRef.current = open
      }),
    [],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.altKey || e.shiftKey) return
      if (missionOpenRef.current) return
      const target = e.target as HTMLElement | null
      // Spotlight open: its input holds focus, so any Cmd+key press from inside
      // the overlay means the user is typing there, not commanding a window.
      if (target?.closest('[data-spotlight-overlay]')) return

      const key = e.key.toLowerCase()
      const s = stateRef.current
      const top = s.topWindow

      if (key === 'w') {
        if (!top || top.genieAnim) return
        e.preventDefault()
        s.closeWindow(top.id)
      } else if (key === 'm') {
        if (!top || top.minimized || top.genieAnim) return
        e.preventDefault()
        s.beginGenieMinimize(top.id)
      } else if (top?.app === 'files' && (key === '1' || key === '2' || key === '3')) {
        e.preventDefault()
        s.setFinderView(key === '1' ? 'icons' : key === '2' ? 'list' : 'gallery')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return null
}
