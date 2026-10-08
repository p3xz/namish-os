import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { WindowManagerProvider, type PowerAction, useWindows } from './os/WindowManager'
import { AppearanceProvider } from './os/Appearance'
import { resolveHash, findEntryAt } from './os/deeplinks'
import BootScreen from './components/BootScreen'
import LockScreen from './components/LockScreen'
import Desktop from './components/Desktop'
import GlobalShortcuts from './components/GlobalShortcuts'
import NLogo from './components/NLogo'

type Phase = 'boot' | 'desktop' | 'lock' | 'sleep' | 'shutdown'

export default function App() {
  const [phase, setPhase] = useState<Phase>('boot')

  const powerAction = useCallback((a: PowerAction) => {
    if (a === 'sleep') setPhase('sleep')
    else if (a === 'lock') setPhase('lock')
    else if (a === 'restart') setPhase('boot')
    else setPhase('shutdown')
  }, [])

  return (
    <WindowManagerProvider powerAction={powerAction}>
      <AppearanceProvider>
        <h1 className="sr-only">NamishOS, the portfolio of Namish Yadav</h1>
        <DeepLinkHandler />
        {/* Global shortcuts only run on the unlocked desktop. */}
        {phase === 'desktop' && <GlobalShortcuts />}
        <AnimatePresence>
          {phase === 'boot' && <BootScreen key="boot" onDone={() => setPhase('desktop')} />}
        </AnimatePresence>

        {(phase === 'desktop' || phase === 'sleep' || phase === 'lock') && <Desktop />}

        <AnimatePresence>
          {phase === 'lock' && <LockScreen key="lock" onUnlock={() => setPhase('desktop')} />}
        </AnimatePresence>

        <AnimatePresence>
          {phase === 'sleep' && <SleepOverlay key="sleep" onWake={() => setPhase('desktop')} />}
        </AnimatePresence>

        {phase === 'shutdown' && <ShutdownScreen onPower={() => setPhase('boot')} />}
      </AppearanceProvider>
    </WindowManagerProvider>
  )
}

/**
 * Opens the file or folder named by a shared deep link like
 * `#/file/Projects/Rideoxy` (see "Copy Link" in the Finder context menu).
 * Runs once at boot; the window is waiting on the desktop when it appears.
 */
function DeepLinkHandler() {
  const { openApp } = useWindows()
  const opened = useRef(false)

  useEffect(() => {
    if (opened.current) return
    opened.current = true
    const path = resolveHash(window.location.hash)
    if (!path) return
    const entry = findEntryAt(path)
    if (!entry) return
    if (entry.type === 'folder') {
      openApp('files', { folderPath: path })
    } else {
      openApp('quicklook', {
        quickLook: { kind: entry.kind, ref: entry.ref, title: entry.name },
      })
    }
  }, [openApp])

  return null
}

function SleepOverlay({ onWake }: { onWake: () => void }) {
  useEffect(() => {
    const t = setTimeout(onWake, 2400)
    return () => clearTimeout(t)
  }, [onWake])

  return (
    <motion.div
      className="fixed inset-0 z-[300] bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: 'easeInOut' }}
    />
  )
}

function ShutdownScreen({ onPower }: { onPower: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <NLogo size={56} className="opacity-80" />
      <p className="mt-6 text-[15px] text-white/60">It is now safe to close this tab.</p>
      <button
        onClick={onPower}
        className="mt-8 rounded-full border border-white/20 bg-white/10 px-6 py-2 text-[13px] font-medium text-white/90 transition-colors hover:bg-white/20"
      >
        Power On
      </button>
    </motion.div>
  )
}
