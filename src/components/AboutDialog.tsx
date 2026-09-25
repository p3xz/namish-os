import NLogo from './NLogo'

const SPECS: [string, string][] = [
  ['NamishOS', '26 "Nebula"'],
  ['Chip', 'Determination M1'],
  ['Memory', '18 years of curiosity'],
  ['Startup Disk', 'NamishHD'],
  ['Serial Number', 'BUILD-IN-PUBLIC-001'],
  ['Uptime', 'Since the first commit'],
]

export default function AboutDialog() {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto bg-white p-6 text-center">
      <NLogo size={72} className="drop-shadow-[0_8px_24px_rgba(139,92,246,0.4)]" />
      <h2 className="mt-4 text-[22px] font-bold tracking-tight text-neutral-900">NamishOS</h2>
      <p className="mt-1 text-[13px] text-neutral-500">Version 26 &ldquo;Nebula&rdquo;</p>

      <div className="mt-6 w-full max-w-xs overflow-hidden rounded-xl border border-black/10">
        {SPECS.map(([k, v], i) => (
          <div
            key={k}
            className={`flex items-center justify-between px-4 py-2 text-left text-[13px] ${
              i % 2 === 0 ? 'bg-black/[0.04]' : 'bg-transparent'
            }`}
          >
            <span className="font-medium text-neutral-400">{k}</span>
            <span className="text-neutral-800">{v}</span>
          </div>
        ))}
      </div>

      <p className="mt-6 max-w-[300px] text-[12.5px] leading-relaxed text-neutral-500">
        A loving homage to the desktop metaphor, built as a portfolio. No fruit companies were
        involved in the making of this OS.
      </p>
      <p className="mt-4 text-[13px] font-medium text-neutral-700">Created by Namish Yadav</p>
    </div>
  )
}
