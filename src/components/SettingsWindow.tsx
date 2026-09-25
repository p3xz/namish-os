import { Check } from 'lucide-react'
import { useAppearance, type WallpaperVariant } from '@/os/Appearance'

const VARIANTS: { id: WallpaperVariant; name: string; swatch: string; blurb: string }[] = [
  {
    id: 'nebula',
    name: 'Nebula',
    swatch: 'linear-gradient(135deg, #3f8fe8, #ff5d5d)',
    blurb: 'The default. Red waves over a blue sky.',
  },
  {
    id: 'sunset',
    name: 'Ember',
    swatch: 'linear-gradient(135deg, #f7b733, #e63e6d)',
    blurb: 'Golden hour, all day.',
  },
  {
    id: 'ocean',
    name: 'Abyss',
    swatch: 'linear-gradient(135deg, #43cea2, #1d6fb8)',
    blurb: 'Deep water focus mode.',
  },
]

export default function SettingsWindow() {
  const { variant, setVariant } = useAppearance()

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-white p-5">
      <h2 className="text-[15px] font-semibold text-neutral-900">Appearance</h2>
      <p className="mt-1 text-[12.5px] text-neutral-500">Pick a wallpaper. It changes instantly.</p>

      <div className="mt-4 space-y-2">
        {VARIANTS.map((v) => {
          const active = variant === v.id
          return (
            <button
              key={v.id}
              onClick={() => setVariant(v.id)}
              className={`flex w-full items-center gap-4 rounded-2xl border p-3 text-left transition-all ${
                active
                  ? 'border-sky-500/60 bg-sky-50'
                  : 'border-black/10 bg-black/[0.02] hover:bg-black/[0.05]'
              }`}
            >
              <div
                className="h-12 w-20 shrink-0 rounded-xl border border-black/10 shadow-inner"
                style={{ background: v.swatch }}
              />
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-semibold text-neutral-900">{v.name}</div>
                <div className="truncate text-[12px] text-neutral-500">{v.blurb}</div>
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

      <p className="mt-6 text-center text-[11.5px] text-neutral-300">NamishOS Settings · Version 26</p>
    </div>
  )
}
