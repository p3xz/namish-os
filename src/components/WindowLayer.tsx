import { AnimatePresence } from 'framer-motion'
import { useWindows } from '@/os/WindowManager'
import WindowFrame from './WindowFrame'
import FinderWindow from './FinderWindow'
import QuickLook from './QuickLook'
import TerminalApp from './TerminalApp'
import WebApp from './WebApp'
import MailApp from './MailApp'
import NotesApp from './NotesApp'
import AboutDialog from './AboutDialog'
import SettingsWindow from './SettingsWindow'
import type { OSWindow } from '@/os/types'

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
    case 'mail':
      return <MailApp />
    case 'notes':
      return <NotesApp />
    case 'about':
      return <AboutDialog />
    case 'settings':
      return <SettingsWindow />
  }
}

export default function WindowLayer() {
  const { windows } = useWindows()

  return (
    <div className="pointer-events-none absolute inset-0 z-40">
      <AnimatePresence>
        {windows.map((win) => (
          <WindowFrame key={win.id} win={win}>
            <WindowContent win={win} />
          </WindowFrame>
        ))}
      </AnimatePresence>
    </div>
  )
}
