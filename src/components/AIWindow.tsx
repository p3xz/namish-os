import { Sparkles } from 'lucide-react'
import { AIIcon } from './MacSquircleIcon'

const SUGGESTIONS = [
  'What did you build with the MERN stack?',
  'Tell me about InsidCode',
  'Which project took the longest?',
]

export default function AIWindow() {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center bg-white px-6 py-8 text-center">
      <AIIcon size={72} />
      <h2 className="mt-4 text-[20px] font-semibold text-neutral-900">AI Assistant</h2>
      <p className="mt-1 text-[13px] font-medium text-violet-600">Coming soon</p>
      <p className="mt-3 max-w-[380px] text-[13.5px] leading-relaxed text-neutral-500">
        A Gemini-powered guide to everything here. Ask it about any project, skill, or line of
        code, and it will know the answer.
      </p>

      <div className="mt-5 flex w-full max-w-[420px] items-center gap-2 rounded-full border border-black/10 bg-black/[0.03] px-4 py-2.5 opacity-60">
        <Sparkles size={16} className="shrink-0 text-violet-500" />
        <span className="truncate text-[13.5px] text-neutral-400">
          Ask about my projects... (soon)
        </span>
      </div>

      <div className="mt-4 flex max-w-[440px] flex-wrap justify-center gap-2">
        {SUGGESTIONS.map((s) => (
          <span
            key={s}
            className="cursor-default rounded-full border border-black/10 bg-white px-3 py-1.5 text-[12px] text-neutral-500 shadow-sm"
          >
            {s}
          </span>
        ))}
      </div>

      <p className="mt-auto pt-6 text-[11.5px] text-neutral-300">
        Wired up at the very end, done right.
      </p>
    </div>
  )
}
