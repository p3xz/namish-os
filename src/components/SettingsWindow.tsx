import { Check } from 'lucide-react'
import { useAppearance, type WallpaperVariant } from '@/os/Appearance'

const VARIANTS: { id: WallpaperVariant; name: string; swatch: string; blurb: string }[] = [
  {
    id: 'nebula',
    name: 'Nebula',
    swatch: 'linear-gradient(135deg, #38bdf8, #a855f7, #f472b6)',
    blurb: 'The default. Cyan auroras over deep indigo.',
  },
  {
    id: 'sunset',
    name: 'Ember',
    swatch: 'linear-gradient(135deg, #fb923c, #f43f5e, #a855f7)',
    blurb: 'Golden hour, all day.',
  },
  {
    id: 'ocean',
    name: 'Abyss',
    swatch: 'linear-gradient(135deg, #38bdf8, #2dd4bf, #2563eb)',
    blurb: 'Deep water focus mode.',
  },
]

export default function SettingsWindow() {
  const { variant, setVariant } = useAppearance()

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-black/30 p-5">
      <h2 className="text-[15px] font-semibold text-white">Appearance</h2>
      <p className="mt-1 text-[12.5px] text-white/45">Pick a wallpaper. It changes instantly.</p>

      <div className="mt-4 space-y-2">
        {VARIANTS.map((v) => {
          const active = variant === v.id
          return (
            <button
              key={v.id}
              onClick={() => setVariant(v.id)}
              className={`flex w-full items-center gap-4 rounded-2xl border p-3 text-left transition-all ${
                active
                  ? 'border-sky-400/60 bg-white/[0.08]'
                  : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.07]'
              }`}
            >
              <div
                className="h-12 w-20 shrink-0 rounded-xl border border-white/20 shadow-inner"
                style={{ background: v.swatch }}
              />
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-semibold text-white">{v.name}</div>
                <div className="truncate text-[12px] text-white/50">{v.blurb}</div>
              </div>
              {active && (
                <span className="flex size-6 items-center justify-center rounded-full bg-sky-500">
                  <Check size={14} className="text-white" strokeWidth={3} />
                </span>
              )}
            </button>
          )
        })}
      </div>

      <p className="mt-6 text-center text-[11.5px] text-white/30">NamishOS Settings · Version 26</p>
    </div>
  )
}
