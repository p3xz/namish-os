import { ArrowUpRight, AtSign, Code2, Globe, Share2 } from 'lucide-react'
import { quickLinks } from '@/data/portfolio'

const ICONS: Record<string, typeof Globe> = {
  github: Code2,
  x: AtSign,
  insidcode: Globe,
  portfolio: Share2,
}

export default function WebApp() {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-black/10 bg-[#f6f6f8] px-4">
        <Globe size={16} className="text-neutral-400" />
        <div className="flex-1 truncate rounded-full bg-black/[0.06] px-4 py-1.5 text-[12.5px] text-neutral-500">
          namishos://start
        </div>
      </div>
      <div className="grid flex-1 content-start grid-cols-2 gap-3 overflow-y-auto p-5">
        {quickLinks.map((l) => {
          const Icon = ICONS[l.id] ?? Globe
          return (
            <a
              key={l.id}
              href={l.url}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-3 rounded-2xl border border-black/10 bg-black/[0.02] p-4 transition-all hover:scale-[1.02] hover:bg-black/[0.05]"
            >
              <div
                className="flex size-11 shrink-0 items-center justify-center rounded-xl text-white shadow-md"
                style={{ backgroundColor: l.hue }}
              >
                <Icon size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 text-[14px] font-semibold text-neutral-900">
                  {l.name}
                  <ArrowUpRight
                    size={14}
                    className="text-neutral-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </div>
                <div className="truncate text-[12px] text-neutral-500">{l.detail}</div>
              </div>
            </a>
          )
        })}
      </div>
      <p className="shrink-0 border-t border-black/10 bg-[#f6f6f8] px-5 py-3 text-[11.5px] text-neutral-400">
        Quick links open in a new tab. This is a bookmarks page, not a real browser.
      </p>
    </div>
  )
}
