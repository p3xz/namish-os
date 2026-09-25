import { useAppearance, type WallpaperVariant } from '@/os/Appearance'

const BLOBS: Record<WallpaperVariant, [string, string, string]> = {
  nebula: ['bg-cyan-400/25', 'bg-fuchsia-500/25', 'bg-indigo-500/30'],
  sunset: ['bg-orange-400/30', 'bg-rose-500/30', 'bg-purple-500/25'],
  ocean: ['bg-sky-400/30', 'bg-teal-400/25', 'bg-blue-600/30'],
}

const BASE: Record<WallpaperVariant, string> = {
  nebula:
    'radial-gradient(1100px 750px at 12% 8%, rgba(56, 189, 248, 0.5), transparent 62%), radial-gradient(1000px 700px at 88% 18%, rgba(168, 85, 247, 0.52), transparent 62%), radial-gradient(950px 950px at 72% 92%, rgba(244, 114, 182, 0.42), transparent 64%), radial-gradient(850px 650px at 18% 88%, rgba(52, 211, 153, 0.32), transparent 62%), linear-gradient(155deg, #0a0f28 0%, #171036 42%, #2a0f45 78%, #12081f 100%)',
  sunset:
    'radial-gradient(1100px 750px at 12% 8%, rgba(251, 146, 60, 0.5), transparent 62%), radial-gradient(1000px 700px at 88% 18%, rgba(244, 63, 94, 0.5), transparent 62%), radial-gradient(950px 950px at 72% 92%, rgba(168, 85, 247, 0.45), transparent 64%), linear-gradient(155deg, #1c0f14 0%, #2b1030 45%, #3d0f2e 80%, #12081a 100%)',
  ocean:
    'radial-gradient(1100px 750px at 12% 8%, rgba(56, 189, 248, 0.55), transparent 62%), radial-gradient(1000px 700px at 88% 18%, rgba(45, 212, 191, 0.45), transparent 62%), radial-gradient(950px 950px at 72% 92%, rgba(37, 99, 235, 0.5), transparent 64%), linear-gradient(155deg, #04121f 0%, #062033 45%, #083344 80%, #020d16 100%)',
}

export default function Wallpaper() {
  const { variant } = useAppearance()
  const [b1, b2, b3] = BLOBS[variant]

  return (
    <div className="absolute inset-0 overflow-hidden transition-all duration-700" style={{ background: BASE[variant] }}>
      <div className={`aurora-blob animate-aurora-1 left-[-10%] top-[-15%] h-[55vmax] w-[55vmax] ${b1}`} />
      <div className={`aurora-blob animate-aurora-2 right-[-12%] top-[5%] h-[48vmax] w-[48vmax] ${b2}`} />
      <div className={`aurora-blob animate-aurora-3 bottom-[-18%] left-[30%] h-[52vmax] w-[52vmax] ${b3}`} />
      <div className="wallpaper-noise absolute inset-0" />
    </div>
  )
}
