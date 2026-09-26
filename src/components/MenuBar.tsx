import {
  Code2,
  Folder,
  Globe,
  Info,
  MessageCircle,
  Moon,
  NotebookPen,
  Power,
  RotateCcw,
  Sparkles,
  Settings as SettingsIcon,
  SquareTerminal,
  Swords,
} from 'lucide-react'
import MacOSMenuBar from './ui/mac-os-menu-bar'
import { useWindows } from '@/os/WindowManager'
import { openSpotlight } from '@/os/spotlightBus'
import type { AppId } from '@/os/types'

const APP_NAMES: Record<AppId, string> = {
  files: 'Files',
  terminal: 'Terminal',
  web: 'Web',
  messages: 'Messages',
  notes: 'Notes',
  about: 'NamishOS',
  settings: 'NamishOS',
  quicklook: 'Preview',
  ai: 'AI',
  insidcode: 'InsidCode',
}

const icon = (Icon: typeof Folder) => <Icon size={15} strokeWidth={2} />

/** N menu: everything in the OS is reachable from here. */
const N_MENU = [
  { label: 'About NamishOS', action: 'about', icon: icon(Info) },
  { type: 'separator' as const },
  { label: 'System Settings...', action: 'settings', icon: icon(SettingsIcon) },
  { type: 'separator' as const },
  { label: 'Files', action: 'open-files', icon: icon(Folder) },
  { label: 'Projects', action: 'open-projects', icon: icon(Code2) },
  { label: 'Terminal', action: 'open-terminal', icon: icon(SquareTerminal) },
  { label: 'Web', action: 'open-web', icon: icon(Globe) },
  { label: 'Messages', action: 'open-messages', icon: icon(MessageCircle) },
  { label: 'AI', action: 'open-ai', icon: icon(Sparkles) },
  { label: 'InsidCode', action: 'open-insidcode', icon: icon(Swords) },
  { label: 'Notes', action: 'open-notes', icon: icon(NotebookPen) },
  { type: 'separator' as const },
  { label: 'Sleep', action: 'sleep', icon: icon(Moon) },
  { label: 'Restart...', action: 'restart', icon: icon(RotateCcw) },
  { label: 'Shut Down...', action: 'shutdown', icon: icon(Power) },
]

export default function MenuBar() {
  const {
    activeApp,
    topWindow,
    windows,
    openApp,
    closeWindow,
    minimizeWindow,
    toggleMaximize,
    focusWindow,
    setFinderView,
    powerAction,
  } = useWindows()

  const handleAction = (action: string) => {
    switch (action) {
      case 'about':
        openApp('about')
        break
      case 'settings':
        openApp('settings')
        break
      case 'open-files':
        openApp('files', { folderPath: [] })
        break
      case 'open-projects':
        openApp('files', { folderPath: ['Projects'] })
        break
      case 'open-terminal':
        openApp('terminal')
        break
      case 'open-web':
        openApp('web')
        break
      case 'open-messages':
        openApp('messages')
        break
      case 'open-ai':
        openApp('ai')
        break
      case 'open-insidcode':
        openApp('insidcode')
        break
      case 'open-notes':
        openApp('notes')
        break
      case 'sleep':
        powerAction('sleep')
        break
      case 'restart':
        powerAction('restart')
        break
      case 'shutdown':
        powerAction('shutdown')
        break
      case 'new-window':
        openApp('files', { folderPath: [] })
        break
      case 'close-window':
        if (topWindow) closeWindow(topWindow.id)
        break
      case 'minimize':
        if (topWindow) minimizeWindow(topWindow.id)
        break
      case 'zoom':
        if (topWindow) toggleMaximize(topWindow.id)
        break
      case 'bring-to-front':
        windows.forEach((w) => focusWindow(w.id))
        break
      case 'view-icons':
        setFinderView('icons')
        break
      case 'view-list':
        setFinderView('list')
        break
      case 'help':
        openApp('quicklook', { quickLook: { kind: 'text', ref: 'help', title: 'NamishOS Help' } })
        break
      default:
        break
    }
  }

  return <MacOSMenuBar appName={APP_NAMES[activeApp]} nMenuItems={N_MENU} onMenuAction={handleAction} onSpotlight={openSpotlight} />
}
