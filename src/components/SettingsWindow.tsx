import { Check } from 'lucide-react'
import { useAppearance, type WallpaperVariant } from '@/os/Appearance'
import { WALLPAPER_IMAGES, WALLPAPER_META } from './Wallpaper'

const VARIANTS: WallpaperVariant[] = ['tide', 'drift', 'ember']

export default function SettingsWindow() {
  const { variant, setVariant } = useAppearance()

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-white p-5">
      <h2 className="text-[15px] font-semibold text-neutral-900">Appearance</h2>
      <p className="mt-1 text-[12.5px] text-neutral-500">Pick a wallpaper. It changes instantly.</p>

      <div className="mt-4 space-y-2">
        {VARIANTS.map((id) => {
          const active = variant === id
          const meta = WALLPAPER_META[id]
          return (
            <button
              key={id}
              onClick={() => setVariant(id)}
              className={`flex w-full items-center gap-4 rounded-2xl border p-3 text-left transition-all ${
                active
                  ? 'border-sky-500/60 bg-sky-50'
                  : 'border-black/10 bg-black/[0.02] hover:bg-black/[0.05]'
              }`}
            >
              <img
                src={WALLPAPER_IMAGES[id]}
                alt={meta.name}
                draggable={false}
                className="h-12 w-20 shrink-0 rounded-xl border border-black/10 object-cover shadow-inner"
              />
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-semibold text-neutral-900">{meta.name}</div>
                <div className="truncate text-[12px] text-neutral-500">{meta.blurb}</div>
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
