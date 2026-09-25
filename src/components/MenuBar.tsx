import MacOSMenuBar from './ui/mac-os-menu-bar'
import { useWindows } from '@/os/WindowManager'
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
}

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

  return <MacOSMenuBar appName={APP_NAMES[activeApp]} onMenuAction={handleAction} />
}
