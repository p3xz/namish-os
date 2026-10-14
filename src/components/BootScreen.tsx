import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import NLogo from './NLogo'
import { useVerboseBoot } from '@/os/boot'

export default function BootScreen({ onDone }: { onDone: () => void }) {
  const [verbose] = useVerboseBoot()
  if (verbose) return <VerboseBootScreen onDone={onDone} />
  return <StandardBootScreen onDone={onDone} />
}

function StandardBootScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <motion.div
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-black"
      exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeInOut' } }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="flex flex-col items-center"
      >
        <NLogo size={88} className="drop-shadow-[0_0_45px_rgba(139,92,246,0.55)]" />
        <div className="mt-6 text-[26px] font-semibold tracking-tight text-white">NamishOS</div>
        <div className="mt-2 text-[13px] text-white/40">Version 26 &ldquo;Nebula&rdquo;</div>
        <div className="mt-10 h-[5px] w-52 overflow-hidden rounded-full bg-white/15">
          <div className="bootbar-fill h-full rounded-full bg-white/90" />
        </div>
      </motion.div>
    </motion.div>
  )
}

const BOOT_LINES: string[] = [
  'NamishOS verbose boot: on',
  'kernel: NamishOS Version 26 "Nebula" (Build 26F01)',
  'Probing hardware: N-Chip Pro, 24 GB unified memory',
  'Mounting NamishHD... OK',
  'Scanning filesystem: 1337 objects indexed',
  'Loading kernel extensions... OK',
  'Calibrating determination... OK',
  'Polishing menu bar pixels... done',
  'Warming up the Dock... done',
  'Linking InsidCode duel engine... OK',
  'Starting window server... OK',
  'Boot complete. Welcome back, Namish.',
]

/** Milliseconds between log lines. */
const LINE_DELAY = 220

/**
 * Verbose boot: streams kernel-style log lines top to bottom, macOS Cmd+V
 * style, then hands off to the desktop.
 */
function VerboseBootScreen({ onDone }: { onDone: () => void }) {
  const [shown, setShown] = useState(1)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (shown < BOOT_LINES.length) {
      const t = setTimeout(() => setShown((n) => n + 1), LINE_DELAY)
      return () => clearTimeout(t)
    }
    // Hold the finished log a beat so the last line reads.
    const t = setTimeout(() => onDoneRef.current(), 700)
    return () => clearTimeout(t)
  }, [shown])

  useEffect(() => {
    // Keep the newest line in view as the log grows.
    const el = logRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [shown])

  return (
    <motion.div
      className="fixed inset-0 z-[300] bg-black"
      exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeInOut' } }}
    >
      <div
        ref={logRef}
        className="h-full overflow-hidden px-6 py-6 font-mono text-[13px] leading-[1.9] text-white/85 sm:px-10 sm:py-10"
      >
        {BOOT_LINES.slice(0, shown).map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className="whitespace-pre-wrap break-words"
          >
            <span className="mr-3 text-white/30">
              [{((i * LINE_DELAY) / 1000).toFixed(3).padStart(7, ' ')}]
            </span>
            <span className={i === BOOT_LINES.length - 1 ? 'text-emerald-300' : undefined}>
              {line}
            </span>
          </motion.div>
        ))}
        <motion.span
          className="inline-block h-[15px] w-[8px] bg-white/80"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.9, repeat: Infinity }}
        />
      </div>
    </motion.div>
  )
}
