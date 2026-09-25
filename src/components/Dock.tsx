import { useMemo } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  Code2,
  Folder,
  Globe,
  Mail,
  NotebookPen,
  SquareTerminal,
  Trash2,
  type LucideIcon,
} from 'lucide-react'
import MacOSDock from './ui/mac-os-dock'
import { useWindows } from '@/os/WindowManager'

/**
 * Render a lucide glyph inside an original gradient squircle and return it
 * as a data URI. No Apple artwork is used anywhere in the dock.
 */
function glyphInner(Icon: LucideIcon): string {
  const full = renderToStaticMarkup(<Icon size={24} strokeWidth={2} />)
  return full.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')
}

function dockIcon(Icon: LucideIcon, from: string, to: string): string {
  const inner = glyphInner(Icon)
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>` +
    `</linearGradient></defs>` +
    `<rect x="2" y="2" width="60" height="60" rx="15" fill="url(#g)"/>` +
    `<rect x="2" y="2" width="60" height="60" rx="15" fill="white" opacity="0.07"/>` +
    `<g transform="translate(18 18) scale(1.1667)" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</g>` +
    `</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

interface DockEntry {
  id: string
  name: string
  icon: string
}

const DOCK_APPS: DockEntry[] = [
  { id: 'files', name: 'Files', icon: dockIcon(Folder, '#38bdf8', '#0369a1') },
  { id: 'projects', name: 'Projects', icon: dockIcon(Code2, '#a78bfa', '#6d28d9') },
  { id: 'terminal', name: 'Terminal', icon: dockIcon(SquareTerminal, '#3f3f46', '#09090b') },
  { id: 'web', name: 'Web', icon: dockIcon(Globe, '#2dd4bf', '#0f766e') },
  { id: 'mail', name: 'Mail', icon: dockIcon(Mail, '#60a5fa', '#1d4ed8') },
  { id: 'notes', name: 'Notes', icon: dockIcon(NotebookPen, '#fbbf24', '#b45309') },
  { id: 'trash', name: 'Trash', icon: dockIcon(Trash2, '#a1a1aa', '#52525b') },
]

/** Map running windows to dock entries for the indicator dots. */
function dockIdForApp(app: string): string | null {
  switch (app) {
    case 'files':
    case 'quicklook':
      return 'files'
    case 'terminal':
    case 'web':
    case 'mail':
    case 'notes':
      return app
    default:
      return null
  }
}

export default function Dock() {
  const { windows, openApp } = useWindows()

  const apps = useMemo(() => DOCK_APPS, [])

  const openApps = useMemo(() => {
    const ids = new Set<string>()
    for (const w of windows) {
      const id = dockIdForApp(w.app)
      if (id) ids.add(id)
    }
    return [...ids]
  }, [windows])

  const handleAppClick = (appId: string) => {
    switch (appId) {
      case 'files':
        openApp('files', { folderPath: [] })
        break
      case 'projects':
        openApp('files', { folderPath: ['Projects'] })
        break
      case 'trash':
        openApp('files', { folderPath: ['Trash'] })
        break
      case 'terminal':
      case 'web':
      case 'mail':
      case 'notes':
        openApp(appId)
        break
      default:
        break
    }
  }

  return (
    <div className="fixed bottom-3 left-1/2 z-[150] -translate-x-1/2">
      <MacOSDock apps={apps} onAppClick={handleAppClick} openApps={openApps} />
    </div>
  )
}
