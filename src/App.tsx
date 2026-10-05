import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { WindowManagerProvider, type PowerAction } from './os/WindowManager'
import { AppearanceProvider } from './os/Appearance'
import BootScreen from './components/BootScreen'
import LockScreen from './components/LockScreen'
import Desktop from './components/Desktop'
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
