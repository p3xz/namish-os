import { Check } from 'lucide-react'
import { useAppearance, type AccentColor, type SystemTheme, type TerminalTheme, type WallpaperVariant } from '@/os/Appearance'
import { WALLPAPER_IMAGES, WALLPAPER_META } from './Wallpaper'

const VARIANTS: WallpaperVariant[] = ['tide', 'drift', 'ember']

const SYSTEM_THEMES: { id: SystemTheme; name: string; blurb: string }[] = [
  { id: 'light', name: 'Light', blurb: 'Bright chrome for the menu bar, windows, and Dock.' },
  { id: 'dark', name: 'Dark', blurb: 'Dim chrome for the menu bar, windows, and Dock.' },
]

const ACCENTS: { id: AccentColor; name: string; hex: string }[] = [
  { id: 'blue', name: 'Blue', hex: '#0a84ff' },
  { id: 'green', name: 'Green', hex: '#30d158' },
  { id: 'orange', name: 'Orange', hex: '#ff9f0a' },
  { id: 'purple', name: 'Purple', hex: '#bf5af2' },
  { id: 'pink', name: 'Pink', hex: '#ff375f' },
]

function SystemThemePreview({ id }: { id: SystemTheme }) {
  const dark = id === 'dark'
  return (
    <div
      aria-hidden
      className="flex h-12 w-20 shrink-0 flex-col overflow-hidden rounded-xl border border-black/10 shadow-inner"
      style={{ backgroundColor: dark ? '#1e1e22' : '#ececf0' }}
    >
      <div
        className="flex h-[10px] items-center gap-1 px-1.5"
        style={{ backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.55)' }}
      >
        <span className="size-1.5 rounded-full" style={{ backgroundColor: '#ff5f57' }} />
        <span className="size-1.5 rounded-full" style={{ backgroundColor: '#febc2e' }} />
        <span className="size-1.5 rounded-full" style={{ backgroundColor: '#28c840' }} />
      </div>
      <div className="flex flex-1 items-center justify-center gap-1 px-2">
        <span className="h-1.5 w-8 rounded-full" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.35)' }} />
        <span className="h-1.5 w-4 rounded-full" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.18)' }} />
      </div>
    </div>
  )
}

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
  const { variant, setVariant, terminalTheme, setTerminalTheme, systemTheme, setSystemTheme, accentColor, setAccentColor } = useAppearance()

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

      <h2 className="mt-8 text-[15px] font-semibold text-neutral-900">Appearance mode</h2>
      <p className="mt-1 text-[12.5px] text-neutral-500">
        Recolors the menu bar, window chrome, and Dock. Terminal keeps its own dark frame.
      </p>

      <div className="mt-4 space-y-2">
        {SYSTEM_THEMES.map((t) => {
          const active = systemTheme === t.id
          return (
            <button
              key={t.id}
              onClick={() => setSystemTheme(t.id)}
              className={`flex w-full items-center gap-4 rounded-2xl border p-3 text-left transition-all ${
                active
                  ? 'border-sky-500/60 bg-sky-50'
                  : 'border-black/10 bg-black/[0.02] hover:bg-black/[0.05]'
              }`}
            >
              <SystemThemePreview id={t.id} />
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

      <h2 className="mt-8 text-[15px] font-semibold text-neutral-900">Accent color</h2>
      <p className="mt-1 text-[12.5px] text-neutral-500">
        Tints selections, highlights, focus rings, and today markers across the system.
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        {ACCENTS.map((a) => {
          const active = accentColor === a.id
          return (
            <button
              key={a.id}
              onClick={() => setAccentColor(a.id)}
              title={a.name}
              aria-label={`${a.name} accent`}
              aria-pressed={active}
              className="flex size-11 items-center justify-center rounded-full transition-transform hover:scale-105"
              style={{
                backgroundColor: a.hex,
                boxShadow: active ? `0 0 0 2px #fff, 0 0 0 4px ${a.hex}` : undefined,
              }}
            >
              {active && <Check size={16} className="text-white" strokeWidth={3} />}
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
