import { AnimatePresence } from 'framer-motion'
import { useWindows } from '@/os/WindowManager'
import WindowFrame from './WindowFrame'
import FinderWindow from './FinderWindow'
import QuickLook from './QuickLook'
import NLogo from './NLogo'
import type { OSWindow } from '@/os/types'

const PLACEHOLDER_TITLES: Record<string, string> = {
  terminal: 'Terminal',
  web: 'Web',
  mail: 'Mail',
  notes: 'Notes',
  about: 'About NamishOS',
  settings: 'Settings',
}

function ComingSoon({ name }: { name: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
      <NLogo size={48} className="opacity-90" />
      <p className="text-[14px] font-semibold text-white/85">{name}</p>
      <p className="max-w-[240px] text-[13px] leading-relaxed text-white/45">
        This app is still being built. Check back after the next update.
      </p>
    </div>
  )
}

function WindowContent({ win }: { win: OSWindow }) {
  switch (win.app) {
    case 'files':
      return <FinderWindow win={win} />
    case 'quicklook':
      return <QuickLook win={win} />
    default:
      return <ComingSoon name={PLACEHOLDER_TITLES[win.app] ?? 'App'} />
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
