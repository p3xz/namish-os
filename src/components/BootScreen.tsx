import { useEffect } from 'react'
import { motion } from 'framer-motion'
import NLogo from './NLogo'

export default function BootScreen({ onDone }: { onDone: () => void }) {
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
