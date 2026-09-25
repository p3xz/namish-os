import { useId } from 'react'

/**
 * macOS-style app icons. Big Sur and later use a "squircle": a rounded square
 * with continuous curvature (not plain border-radius). We draw it as an SVG
 * superellipse so desktop and dock icons get the real macOS curve.
 */

const SQUIRCLE_PATH =
  'M 50 2 C 70 2 82 5 90 10 C 95 18 98 30 98 50 C 98 70 95 82 90 90 C 82 95 70 98 50 98 C 30 98 18 95 10 90 C 5 82 2 70 2 50 C 2 30 5 18 10 10 C 18 5 30 2 50 2 Z'

interface SquircleProps {
  from: string
  to: string
  size?: number
  className?: string
  children?: React.ReactNode
}

export function MacSquircleIcon({ from, to, size = 48, className = '', children }: SquircleProps) {
  const gid = useId()
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)] ${className}`}
      aria-hidden
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
        <linearGradient id={`${gid}-sheen`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0.06" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={SQUIRCLE_PATH} fill={`url(#${gid})`} />
      <path d={SQUIRCLE_PATH} fill={`url(#${gid}-sheen)`} />
      <path
        d={SQUIRCLE_PATH}
        fill="none"
        stroke="#000000"
        strokeOpacity="0.12"
        strokeWidth="1.5"
      />
      {children}
    </svg>
  )
}

/** iMessage-style green bubble: the new Contact icon. */
export function MessagesIcon({ size = 48, className = '' }: { size?: number; className?: string }) {
  return (
    <MacSquircleIcon from="#6bf47e" to="#17b93f" size={size} className={className}>
      <g fill="#ffffff">
        <ellipse cx="50" cy="44" rx="26" ry="21" />
        <path d="M 30 56 L 24 72 L 42 60 Z" />
      </g>
    </MacSquircleIcon>
  )
}

/** Gemini-style sparkle: the AI assistant icon. */
export function AIIcon({ size = 48, className = '' }: { size?: number; className?: string }) {
  return (
    <MacSquircleIcon from="#7aa5ff" to="#8b5cf6" size={size} className={className}>
      <g fill="#ffffff">
        <path d="M 52 18 C 54 34 58 42 74 46 C 58 50 54 58 52 74 C 50 58 46 50 30 46 C 46 42 50 34 52 18 Z" />
        <path d="M 74 62 C 75 68 77 71 83 73 C 77 75 75 78 74 84 C 73 78 71 75 65 73 C 71 71 73 68 74 62 Z" opacity="0.85" />
      </g>
    </MacSquircleIcon>
  )
}

/** Indigo code brackets: the InsidCode app icon. */
export function InsidCodeIcon({ size = 48, className = '' }: { size?: number; className?: string }) {
  return (
    <MacSquircleIcon from="#7c8cff" to="#5b3df5" size={size} className={className}>
      <text
        x="50"
        y="66"
        textAnchor="middle"
        fontFamily="ui-monospace, monospace"
        fontSize="38"
        fontWeight="bold"
        fill="#ffffff"
      >
        {'</>'}
      </text>
    </MacSquircleIcon>
  )
}
