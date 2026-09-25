import { useMemo } from 'react'
import MacOSDock from './ui/mac-os-dock'
import { useWindows } from '@/os/WindowManager'

/**
 * Original glossy app icon artwork rendered as SVG data URIs.
 * Evocative of macOS iconography but drawn from scratch: no Apple assets.
 */
function iconSvg(inner: string): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
    `<defs>` +
    `<clipPath id="c"><rect x="2" y="2" width="60" height="60" rx="15"/></clipPath>` +
    `<linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0" stop-color="#ffffff" stop-opacity="0.35"/>` +
    `<stop offset="0.45" stop-color="#ffffff" stop-opacity="0.06"/>` +
    `<stop offset="0.55" stop-color="#ffffff" stop-opacity="0"/>` +
    `</linearGradient>` +
    `</defs>` +
    `<g clip-path="url(#c)">${inner}` +
    `<rect x="2" y="2" width="60" height="60" fill="url(#gloss)"/>` +
    `</g>` +
    `<rect x="2.5" y="2.5" width="59" height="59" rx="14.5" fill="none" stroke="#ffffff" stroke-opacity="0.25" stroke-width="1"/>` +
    `</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

const sq = (body: string) =>
  `<rect x="2" y="2" width="60" height="60" rx="15" fill="#8e8e93"/>${body}`

const ICONS = {
  /** Smiling face on a two-tone field, Files */
  files: iconSvg(
    `<rect x="2" y="2" width="60" height="60" rx="15" fill="#5ac8fa"/>` +
      `<rect x="32" y="2" width="30" height="60" fill="#f2f2f7"/>` +
      `<circle cx="24" cy="26" r="3.2" fill="#1c1c1e"/>` +
      `<circle cx="42" cy="26" r="3.2" fill="#1c1c1e"/>` +
      `<path d="M20 38 Q33 50 46 38" stroke="#1c1c1e" stroke-width="3.4" fill="none" stroke-linecap="round"/>`,
  ),
  /** Code brackets, Projects */
  projects: iconSvg(
    sq(
      `<defs><linearGradient id="pj" x1="0" y1="0" x2="0" y2="1">` +
        `<stop offset="0" stop-color="#3b3b4f"/><stop offset="1" stop-color="#17171f"/>` +
        `</linearGradient></defs>` +
        `<rect x="2" y="2" width="60" height="60" rx="15" fill="url(#pj)"/>` +
        `<text x="32" y="42" text-anchor="middle" font-family="monospace" font-size="24" font-weight="bold" fill="#c4b5fd">&lt;/&gt;</text>`,
    ),
  ),
  /** Terminal prompt */
  terminal: iconSvg(
    sq(
      `<rect x="2" y="2" width="60" height="60" rx="15" fill="#101014"/>` +
        `<text x="14" y="42" font-family="monospace" font-size="22" font-weight="bold" fill="#f4f4f5">&gt;_</text>`,
    ),
  ),
  /** Compass, Web */
  web: iconSvg(
    `<defs><linearGradient id="wb" x1="0" y1="0" x2="0" y2="1">` +
      `<stop offset="0" stop-color="#4da3ff"/><stop offset="1" stop-color="#1a5fd7"/>` +
      `</linearGradient></defs>` +
      `<rect x="2" y="2" width="60" height="60" rx="15" fill="url(#wb)"/>` +
      `<circle cx="32" cy="32" r="17" fill="#f4f4f5"/>` +
      `<circle cx="32" cy="32" r="17" fill="none" stroke="#c9c9d2" stroke-width="1.5"/>` +
      `<polygon points="32,18 36,32 32,46 28,32" fill="#ff3b30"/>` +
      `<polygon points="32,18 36,32 28,32" fill="#ff8a80"/>` +
      `<polygon points="18,32 32,28 32,36" fill="#8e8e93"/>` +
      `<polygon points="46,32 32,28 32,36" fill="#c7c7cc"/>` +
      `<circle cx="32" cy="32" r="2.6" fill="#1c1c1e"/>`,
  ),
  /** Green chat bubble, Messages */
  messages: iconSvg(
    `<defs><linearGradient id="mg" x1="0" y1="0" x2="0" y2="1">` +
      `<stop offset="0" stop-color="#5df08a"/><stop offset="1" stop-color="#0bb84f"/>` +
      `</linearGradient></defs>` +
      `<rect x="2" y="2" width="60" height="60" rx="15" fill="url(#mg)"/>` +
      `<ellipse cx="32" cy="28" rx="17" ry="13.5" fill="#ffffff"/>` +
      `<polygon points="24,39 20,48 31,40" fill="#ffffff"/>` +
      `<circle cx="25" cy="28" r="2.4" fill="#0bb84f"/>` +
      `<circle cx="32" cy="28" r="2.4" fill="#0bb84f"/>` +
      `<circle cx="39" cy="28" r="2.4" fill="#0bb84f"/>`,
  ),
  /** Sparkle, AI assistant */
  ai: iconSvg(
    `<defs><linearGradient id="ai" x1="0" y1="0" x2="0" y2="1">` +
      `<stop offset="0" stop-color="#7aa5ff"/><stop offset="1" stop-color="#8b5cf6"/>` +
      `</linearGradient></defs>` +
      `<rect x="2" y="2" width="60" height="60" rx="15" fill="url(#ai)"/>` +
      `<path d="M33 11 C34 22 37 27 48 30 C37 33 34 38 33 49 C32 38 29 33 18 30 C29 27 32 22 33 11 Z" fill="#ffffff"/>` +
      `<path d="M47 36 C48 40 49 42 53 43 C49 44 48 46 47 50 C46 46 45 44 41 43 C45 42 46 40 47 36 Z" fill="#ffffff" opacity="0.85"/>`,
  ),
  /** Notepad, Notes */
  notes: iconSvg(
    `<rect x="2" y="2" width="60" height="60" rx="15" fill="#ffffff"/>` +
      `<rect x="2" y="2" width="60" height="18" fill="#ffd60a"/>` +
      `<rect x="2" y="18" width="60" height="3" fill="#e0b400"/>` +
      `<rect x="12" y="30" width="40" height="2.6" rx="1.3" fill="#d1d1d6"/>` +
      `<rect x="12" y="37" width="40" height="2.6" rx="1.3" fill="#d1d1d6"/>` +
      `<rect x="12" y="44" width="26" height="2.6" rx="1.3" fill="#d1d1d6"/>`,
  ),
  /** Wire bin, Trash */
  trash: iconSvg(
    `<defs><linearGradient id="tr" x1="0" y1="0" x2="0" y2="1">` +
      `<stop offset="0" stop-color="#e8e8ee"/><stop offset="1" stop-color="#b9b9c4"/>` +
      `</linearGradient></defs>` +
      `<rect x="2" y="2" width="60" height="60" rx="15" fill="url(#tr)"/>` +
      `<rect x="20" y="18" width="24" height="30" rx="3" fill="none" stroke="#7a7a85" stroke-width="2.6"/>` +
      `<line x1="26" y1="18" x2="26" y2="48" stroke="#7a7a85" stroke-width="2.2"/>` +
      `<line x1="32" y1="18" x2="32" y2="48" stroke="#7a7a85" stroke-width="2.2"/>` +
      `<line x1="38" y1="18" x2="38" y2="48" stroke="#7a7a85" stroke-width="2.2"/>` +
      `<rect x="18" y="14" width="28" height="4.5" rx="2.2" fill="#7a7a85"/>` +
      `<rect x="28" y="10" width="8" height="4.5" rx="2.2" fill="#7a7a85"/>`,
  ),
}

interface DockEntry {
  id: string
  name: string
  icon: string
}

const DOCK_APPS: DockEntry[] = [
  { id: 'files', name: 'Files', icon: ICONS.files },
  { id: 'projects', name: 'Projects', icon: ICONS.projects },
  { id: 'terminal', name: 'Terminal', icon: ICONS.terminal },
  { id: 'web', name: 'Web', icon: ICONS.web },
  { id: 'messages', name: 'Messages', icon: ICONS.messages },
  { id: 'ai', name: 'AI', icon: ICONS.ai },
  { id: 'notes', name: 'Notes', icon: ICONS.notes },
  { id: 'trash', name: 'Trash', icon: ICONS.trash },
]

/** Map running windows to dock entries for the indicator dots. */
function dockIdForApp(app: string): string | null {
  switch (app) {
    case 'files':
    case 'quicklook':
      return 'files'
    case 'terminal':
    case 'web':
    case 'messages':
    case 'notes':
    case 'ai':
      return app
    default:
      return null
  }
}

export default function Dock() {
  const { windows, openApp, lastLaunch } = useWindows()

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
      case 'messages':
        openApp('messages')
        break
      case 'trash':
        openApp('files', { folderPath: ['Trash'] })
        break
      case 'terminal':
      case 'web':
      case 'notes':
      case 'ai':
        openApp(appId)
        break
      default:
        break
    }
  }

  return (
    <div className="fixed bottom-3 left-1/2 z-[150] -translate-x-1/2">
      <MacOSDock apps={apps} onAppClick={handleAppClick} openApps={openApps} launchSignal={lastLaunch ? { id: lastLaunch.dockId, at: lastLaunch.at } : null} />
    </div>
  )
}
