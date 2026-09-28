import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAppearance } from '@/os/Appearance'
import { WALLPAPER_IMAGES } from './Wallpaper'
import NLogo from './NLogo'

function useNow() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return now
}

export default function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const { variant } = useAppearance()
  const now = useNow()

  useEffect(() => {
    const unlock = () => onUnlock()
    window.addEventListener('keydown', unlock)
    return () => window.removeEventListener('keydown', unlock)
  }, [onUnlock])

  const date = now.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
  const time = now.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  return (
    <motion.div
      className="fixed inset-0 z-[300] cursor-pointer overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.06, transition: { duration: 0.45, ease: 'easeInOut' } }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      onClick={onUnlock}
    >
      {/* Blurred wallpaper, distinct from the black sleep screen */}
      <img
        src={WALLPAPER_IMAGES[variant]}
        alt=""
        draggable={false}
        className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl brightness-[0.55]"
      />
      <div className="absolute inset-0 bg-black/25" />

      <motion.div
        className="relative flex h-full flex-col items-center"
        initial={{ y: 18, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
      >
        {/* Clock */}
        <div className="mt-[11vh] text-center">
          <div className="text-[22px] font-medium text-white/85">{date}</div>
          <div className="mt-1 text-[104px] font-bold leading-none tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)]">
            {time}
          </div>
        </div>

        {/* User */}
        <div className="mt-[9vh] flex flex-col items-center">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.4)] ring-2 ring-white/30">
            <NLogo size={80} />
          </div>
          <div className="mt-3 text-[21px] font-medium text-white">Namish Yadav</div>
        </div>

        {/* Hint */}
        <div className="absolute bottom-[9vh] text-center">
          <motion.div
            className="text-[15px] font-medium text-white/80"
            animate={{ opacity: [0.55, 1, 0.55] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            Click anywhere to log back in
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}
