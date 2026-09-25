import { useAppearance, type WallpaperVariant } from '@/os/Appearance'

/**
 * Original macOS-esque flowing wave wallpapers. Each variant is a set of
 * smooth translucent wave bands over a bright gradient sky, rendered as
 * inline SVG so they scale to any screen. No Apple artwork is used.
 */

function Waves({ bands, sky }: { bands: string[]; sky: string }) {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <linearGradient id="wp-sky" x1="0" y1="0" x2="1" y2="1">
          {sky
            .split(';')
            .filter(Boolean)
            .map((s, i) => {
              const [offset, color] = s.split(':')
              return <stop key={i} offset={offset} stopColor={color} />
            })}
        </linearGradient>
        <filter id="wp-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
      </defs>
      <rect width="1600" height="900" fill="url(#wp-sky)" />
      {bands.map((fill, i) => (
        <g key={i} filter="url(#wp-soft)" opacity={0.9 - i * 0.12}>
          <path
            fill={fill}
            d={
              i === 0
                ? 'M0,520 C240,430 420,560 640,500 C880,432 1040,580 1280,520 C1440,482 1540,520 1600,540 L1600,900 L0,900 Z'
                : i === 1
                  ? 'M0,640 C220,560 400,690 660,630 C900,574 1080,710 1320,650 C1460,620 1550,650 1600,665 L1600,900 L0,900 Z'
                  : 'M0,760 C260,690 480,800 740,745 C990,694 1180,800 1400,755 C1500,738 1560,752 1600,760 L1600,900 L0,900 Z'
            }
          />
        </g>
      ))}
      {/* soft top light */}
      <ellipse cx="1150" cy="120" rx="520" ry="220" fill="#ffffff" opacity="0.22" filter="url(#wp-soft)" />
    </svg>
  )
}

const VARIANTS: Record<WallpaperVariant, { bands: string[]; sky: string }> = {
  nebula: {
    sky: '0:#2f7fe0;0.45:#3f8fe8;0.75:#7a5fd0;1:#4a3aa8',
    bands: ['#ff5d5d', '#ff2e7e', '#b01e6e'],
  },
  sunset: {
    sky: '0:#f7b733;0.5:#f37335;1:#c13b6e',
    bands: ['#ff5e3a', '#e63e6d', '#8e2a5c'],
  },
  ocean: {
    sky: '0:#43cea2;0.55:#2fa8c7;1:#1d6fb8',
    bands: ['#5eead4', '#38bdf8', '#1e5f9e'],
  },
}

export default function Wallpaper() {
  const { variant } = useAppearance()
  const v = VARIANTS[variant]

  return (
    <div className="absolute inset-0 overflow-hidden transition-all duration-700">
      <Waves bands={v.bands} sky={v.sky} />
      <div className="wallpaper-noise absolute inset-0" />
    </div>
  )
}
