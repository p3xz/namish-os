export default function NLogo({ size = 64, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      aria-label="NamishOS logo"
    >
      <defs>
        <linearGradient id="namishos-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6366f1" />
          <stop offset="0.55" stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#d946ef" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#namishos-g)" />
      <rect width="64" height="64" rx="14" fill="white" opacity="0.08" />
      <path
        d="M22 46 V18 L42 46 V18"
        stroke="white"
        strokeWidth="6.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
