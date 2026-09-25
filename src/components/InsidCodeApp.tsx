import { useState } from 'react'
import { ArrowUpRight, Globe, RotateCw } from 'lucide-react'

const URL = 'https://insidcode.vercel.app'

/**
 * InsidCode as a first-class NamishOS app: the real site embedded in a
 * macOS-style window, with an address bar and an "open in new tab" escape
 * hatch in case the embed is ever blocked.
 */
export default function InsidCodeApp() {
  const [frameKey, setFrameKey] = useState(0)

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-black/10 bg-[#f6f6f8] px-4">
        <Globe size={16} className="shrink-0 text-indigo-500" />
        <div className="flex-1 truncate rounded-full bg-black/[0.06] px-4 py-1.5 text-[12.5px] text-neutral-500">
          {URL}
        </div>
        <button
          onClick={() => setFrameKey((k) => k + 1)}
          className="rounded-full p-1.5 text-neutral-500 transition-colors hover:bg-black/[0.06] hover:text-neutral-800"
          title="Reload"
          aria-label="Reload InsidCode"
        >
          <RotateCw size={15} />
        </button>
        <a
          href={URL}
          target="_blank"
          rel="noreferrer"
          className="rounded-full p-1.5 text-neutral-500 transition-colors hover:bg-black/[0.06] hover:text-neutral-800"
          title="Open in new tab"
          aria-label="Open InsidCode in a new tab"
        >
          <ArrowUpRight size={16} />
        </a>
      </div>
      <iframe
        key={frameKey}
        src={URL}
        title="InsidCode"
        className="min-h-0 flex-1 border-0 bg-white"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
      <p className="shrink-0 border-t border-black/10 bg-[#f6f6f8] px-5 py-2.5 text-[11.5px] text-neutral-400">
        Live preview of my competitive programming platform. If the embed ever refuses to load, use
        the arrow above to open it in a new tab.
      </p>
    </div>
  )
}
