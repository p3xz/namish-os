import { useState } from 'react'
import { Check, ImagePlus, Loader2, Trash2, Volume2, VolumeX } from 'lucide-react'
import { useAppearance, type AccentColor, type SystemTheme, type TerminalTheme, type WallpaperVariant } from '@/os/Appearance'
import { playWindowOpen, useSoundMuted } from '@/os/sound'
import { WALLPAPER_IMAGES, WALLPAPER_META } from './Wallpaper'

const VARIANTS: Exclude<WallpaperVariant, 'custom'>[] = ['tide', 'drift', 'ember']

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
  const {
    variant,
    setVariant,
    customWallpaper,
    uploadCustomWallpaper,
    clearCustomWallpaper,
    terminalTheme,
    setTerminalTheme,
    systemTheme,
    setSystemTheme,
    accentColor,
    setAccentColor,
  } = useAppearance()
  const [soundMuted, setSoundMuted] = useSoundMuted()
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleUpload = async () => {
    setUploading(true)
    setUploadError(null)
    const result = await uploadCustomWallpaper()
    setUploading(false)
    if (!result.ok && result.message) setUploadError(result.message)
  }

  const toggleSound = () => {
    const next = !soundMuted
    setSoundMuted(next)
    // Let the user hear what they just turned on.
    if (!next) playWindowOpen()
  }

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

      {/* Custom wallpaper upload */}
      <div
        className={`mt-2 flex w-full items-center gap-4 rounded-2xl border p-3 text-left transition-all ${
          variant === 'custom'
            ? 'border-sky-500/60 bg-sky-50'
            : 'border-black/10 bg-black/[0.02] hover:bg-black/[0.05]'
        }`}
      >
        {customWallpaper ? (
          <button
            onClick={() => setVariant('custom')}
            aria-label="Use your photo as the wallpaper"
            className="shrink-0"
          >
            <img
              src={customWallpaper}
              alt="Your uploaded wallpaper"
              draggable={false}
              className="h-12 w-20 rounded-xl border border-black/10 object-cover shadow-inner"
            />
          </button>
        ) : (
          <button
            onClick={handleUpload}
            disabled={uploading}
            aria-label="Upload your own wallpaper"
            className="flex h-12 w-20 shrink-0 items-center justify-center rounded-xl border border-dashed border-neutral-400 bg-white text-neutral-500 transition-colors hover:border-sky-500 hover:text-sky-600 disabled:opacity-60"
          >
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} />}
          </button>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-semibold text-neutral-900">Your Photo</div>
          <div className="truncate text-[12px] text-neutral-500">
            {customWallpaper
              ? 'Saved in this browser. Tap the thumbnail to switch back to it.'
              : 'Upload one of your own images as the desktop background.'}
          </div>
          {uploadError && <div className="mt-0.5 text-[12px] text-red-500">{uploadError}</div>}
        </div>
        {customWallpaper && !uploading && (
          <button
            onClick={handleUpload}
            title="Replace your photo"
            aria-label="Replace your photo"
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-black/[0.06] hover:text-neutral-800"
          >
            <ImagePlus size={16} />
          </button>
        )}
        {customWallpaper && !uploading && (
          <button
            onClick={clearCustomWallpaper}
            title="Remove your photo"
            aria-label="Remove your photo"
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={16} />
          </button>
        )}
        {variant === 'custom' && (
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-sky-500">
            <Check size={14} className="text-white" strokeWidth={3} />
          </span>
        )}
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

      <h2 className="mt-8 text-[15px] font-semibold text-neutral-900">Sound effects</h2>
      <p className="mt-1 text-[12.5px] text-neutral-500">
        Soft clicks when windows open and close, plus a chime when NamishOS boots.
      </p>

      <button
        onClick={toggleSound}
        aria-pressed={!soundMuted}
        className={`mt-4 flex w-full items-center gap-4 rounded-2xl border p-3 text-left transition-all ${
          !soundMuted
            ? 'border-sky-500/60 bg-sky-50'
            : 'border-black/10 bg-black/[0.02] hover:bg-black/[0.05]'
        }`}
      >
        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
            soundMuted ? 'bg-neutral-200 text-neutral-500' : 'bg-sky-500 text-white'
          }`}
        >
          {soundMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-semibold text-neutral-900">System sounds</div>
          <div className="truncate text-[12px] text-neutral-500">
            {soundMuted ? 'Off. NamishOS stays silent.' : 'On. Clicks and the boot chime play.'}
          </div>
        </div>
        <span
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
            soundMuted ? 'bg-neutral-300' : 'bg-sky-500'
          }`}
        >
          <span
            className={`absolute top-1 size-5 rounded-full bg-white shadow transition-all ${
              soundMuted ? 'left-1' : 'left-6'
            }`}
          />
        </span>
      </button>

      <p className="mt-6 text-center text-[11.5px] text-neutral-300">NamishOS Settings · Version 26</p>
    </div>
  )
}
