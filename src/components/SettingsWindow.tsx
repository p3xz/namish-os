import { Check } from 'lucide-react'
import { useAppearance, type TerminalTheme, type WallpaperVariant } from '@/os/Appearance'
import { WALLPAPER_IMAGES, WALLPAPER_META } from './Wallpaper'

const VARIANTS: WallpaperVariant[] = ['tide', 'drift', 'ember']

const TERMINAL_THEMES: { id: TerminalTheme; name: string; blurb: string; bg: string; fg: string; accent: string }[] = [
  { id: 'dark', name: 'Dark', blurb: 'The classic NamishOS dark terminal.', bg: '#101014', fg: '#f4f4f5', accent: '#6ee7b7' },
  { id: 'light', name: 'Light', blurb: 'A paper-bright terminal for daytime work.', bg: '#f7f7f5', fg: '#3f3f46', accent: '#059669' },
  { id: 'phosphor', name: 'Green Phosphor', blurb: 'Retro CRT glow, like the old monitors.', bg: '#000000', fg: '#4ade80', accent: '#bbf7d0' },
]

function ThemePreview({ bg, fg, accent }: { bg: string; fg: string; accent: string }) {
  return (
    <div
      aria-hidden
      className="flex h-12 w-20 shrink-0 flex-col justify-center gap-1.5 overflow-hidden rounded-xl border border-black/10 px-2.5 shadow-inner"
      style={{ backgroundColor: bg }}
    >
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-[9px] font-semibold" style={{ color: accent }}>
          namish
        </span>
        <span className="font-mono text-[9px]" style={{ color: fg }}>
          %
        </span>
      </div>
      <div className="h-1 rounded-full" style={{ backgroundColor: fg, opacity: 0.75 }} />
      <div className="h-1 w-2/3 rounded-full" style={{ backgroundColor: accent, opacity: 0.75 }} />
    </div>
  )
}

export default function SettingsWindow() {
  const { variant, setVariant, terminalTheme, setTerminalTheme } = useAppearance()

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

      <h2 className="mt-8 text-[15px] font-semibold text-neutral-900">Terminal theme</h2>
      <p className="mt-1 text-[12.5px] text-neutral-500">
        Recolors the Terminal. It persists across restarts, and you can also run <span className="font-mono">theme</span> inside the Terminal.
      </p>

      <div className="mt-4 space-y-2">
        {TERMINAL_THEMES.map((t) => {
          const active = terminalTheme === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTerminalTheme(t.id)}
              className={`flex w-full items-center gap-4 rounded-2xl border p-3 text-left transition-all ${
                active
                  ? 'border-sky-500/60 bg-sky-50'
                  : 'border-black/10 bg-black/[0.02] hover:bg-black/[0.05]'
              }`}
            >
              <ThemePreview bg={t.bg} fg={t.fg} accent={t.accent} />
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-semibold text-neutral-900">{t.name}</div>
                <div className="truncate text-[12px] text-neutral-500">{t.blurb}</div>
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
