import { AnimatePresence } from 'framer-motion'
import { useWindows } from '@/os/WindowManager'
import WindowFrame, { type WindowTone } from './WindowFrame'
import FinderWindow from './FinderWindow'
import QuickLook from './QuickLook'
import TerminalApp from './TerminalApp'
import WebApp from './WebApp'
import MessagesApp from './MessagesApp'
import NotesApp from './NotesApp'
import AboutDialog from './AboutDialog'
import SettingsWindow from './SettingsWindow'
import AIWindow from './AIWindow'
import type { AppId, OSWindow } from '@/os/types'

const TONES: Record<AppId, WindowTone> = {
  files: 'light',
  terminal: 'dark',
  web: 'light',
  messages: 'light',
  notes: 'light',
  about: 'light',
  settings: 'light',
  quicklook: 'light',
  ai: 'light',
}

function WindowContent({ win }: { win: OSWindow }) {
  switch (win.app) {
    case 'files':
      return <FinderWindow win={win} />
    case 'quicklook':
      return <QuickLook win={win} />
    case 'terminal':
      return <TerminalApp winId={win.id} />
    case 'web':
      return <WebApp />
    case 'messages':
      return <MessagesApp />
    case 'notes':
      return <NotesApp />
    case 'about':
      return <AboutDialog />
    case 'settings':
      return <SettingsWindow />
    case 'ai':
      return <AIWindow />
  }
}

export default function WindowLayer() {
  const { windows } = useWindows()

  return (
    <div className="pointer-events-none absolute inset-0 z-40">
      <AnimatePresence>
        {windows.map((win) => (
          <WindowFrame key={win.id} win={win} tone={TONES[win.app]}>
            <WindowContent win={win} />
          </WindowFrame>
        ))}
      </AnimatePresence>
    </div>
  )
}
