/**
 * Original macOS-style blue folder artwork (no Apple assets used).
 * Renders at any size via the `size` prop.
 */
export default function MacFolder({
  size = 48,
  className = '',
}: {
  size?: number
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      aria-hidden
      style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.28))' }}
    >
      <defs>
        <linearGradient id="mcf-back" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6cb8f5" />
          <stop offset="1" stopColor="#3f8fe0" />
        </linearGradient>
        <linearGradient id="mcf-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8ecdf8" />
          <stop offset="1" stopColor="#5aa9ec" />
        </linearGradient>
      </defs>
      {/* back panel with tab */}
      <path
        d="M6 16 Q6 12 10 12 L24 12 Q27 12 29 14 L33 19 L54 19 Q58 19 58 23 L58 50 Q58 54 54 54 L10 54 Q6 54 6 50 Z"
        fill="url(#mcf-back)"
      />
      {/* front panel */}
      <path
        d="M6 24 Q6 20 10 20 L54 20 Q58 20 58 24 L57 50 Q57 54 53 54 L11 54 Q7 54 7 50 Z"
        fill="url(#mcf-front)"
      />
      {/* top sheen */}
      <path
        d="M6 24 Q6 20 10 20 L54 20 Q58 20 58 24 L58 28 L6 28 Z"
        fill="#ffffff"
        opacity="0.18"
      />
    </svg>
  )
}
