import { useAppearance, type WallpaperVariant } from '@/os/Appearance'
import tide from '../assets/wallpapers/tide.jpg'
import drift from '../assets/wallpapers/drift.jpg'
import ember from '../assets/wallpapers/ember.jpg'

/** Original macOS-style generated wallpapers (no Apple artwork used). */
export const WALLPAPER_IMAGES: Record<Exclude<WallpaperVariant, 'custom'>, string> = {
  tide,
  drift,
  ember,
}

/** Resolves the image source for a wallpaper variant, including a custom upload. */
export function resolveWallpaperSrc(variant: WallpaperVariant, custom: string | null): string {
  if (variant === 'custom' && custom) return custom
  return WALLPAPER_IMAGES[variant === 'custom' ? 'tide' : variant]
}

export const WALLPAPER_META: Record<WallpaperVariant, { name: string; blurb: string }> = {
  tide: { name: 'Crimson Tide', blurb: 'The default. Silk ribbons over a deep blue sky.' },
  drift: { name: 'Abyssal Drift', blurb: 'Slow light trails in deep water. Focus mode.' },
  ember: { name: 'Ember Bloom', blurb: 'Golden hour, all day.' },
  custom: { name: 'Your Photo', blurb: 'One of your own images, saved in this browser.' },
}

export default function Wallpaper() {
  const { variant, customWallpaper } = useAppearance()
  const showingCustom = variant === 'custom' && customWallpaper

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#1a2b4a] transition-all duration-700">
      {(Object.keys(WALLPAPER_IMAGES) as (Exclude<WallpaperVariant, 'custom'>)[]).map((v) => (
        <img
          key={v}
          src={WALLPAPER_IMAGES[v]}
          alt=""
          draggable={false}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            v === variant ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
      {customWallpaper && (
        <img
          src={customWallpaper}
          alt=""
          draggable={false}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            showingCustom ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
      <div className="wallpaper-noise absolute inset-0" />
    </div>
  )
}
