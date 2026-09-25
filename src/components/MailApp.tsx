import { Mail, Send } from 'lucide-react'
import { profile } from '@/data/portfolio'

export default function MailApp() {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-black/30 p-5">
      <div className="mx-auto w-full max-w-md flex-1 overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.05] p-5">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-full bg-gradient-to-b from-sky-400 to-blue-700 shadow-lg">
            <Mail size={20} className="text-white" />
          </div>
          <div>
            <div className="text-[15px] font-semibold text-white">{profile.name}</div>
            <div className="text-[12.5px] text-white/50">{profile.email}</div>
          </div>
        </div>

        <div className="mt-5 space-y-2.5 text-[13px]">
          <div className="flex gap-2">
            <span className="w-14 shrink-0 text-white/40">To:</span>
            <span className="text-white/90">{profile.name}</span>
          </div>
          <div className="flex gap-2">
            <span className="w-14 shrink-0 text-white/40">Subject:</span>
            <span className="text-white/90">Say hello</span>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4 text-[13px] leading-relaxed text-white/75">
          Hi Namish,
          <br />
          <br />
          I saw your portfolio running as an entire operating system. Let&apos;s talk about an
          internship.
          <br />
          <br />
          Best,
          <br />A future colleague
        </div>

        <a
          href={`mailto:${profile.email}?subject=${encodeURIComponent('Hello from NamishOS')}`}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-[14px] font-semibold text-black transition-transform hover:scale-[1.02]"
        >
          <Send size={15} /> Compose in your mail app
        </a>
        <p className="mt-3 text-center text-[11.5px] text-white/35">
          Opens your real email client with the address filled in.
        </p>
      </div>
    </div>
  )
}
