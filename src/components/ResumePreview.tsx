import { useState } from 'react'
import { Download, FileText } from 'lucide-react'
import { profile, skillGroups, projects, experience } from '@/data/portfolio'
import { downloadResumePdf, downloadResumeText } from '@/os/resume'

function ResumeSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <h3 className="border-b border-black/10 pb-1 text-[11px] font-bold uppercase tracking-[0.1em] text-neutral-500">
        {title}
      </h3>
      <div className="mt-2.5 space-y-2.5">{children}</div>
    </div>
  )
}

/**
 * Paper-style resume preview generated from the portfolio data, with real
 * download buttons for the PDF and plain-text versions.
 */
export default function ResumePreview() {
  const [msg, setMsg] = useState<string | null>(null)

  const flash = (text: string) => {
    setMsg(text)
    setTimeout(() => setMsg(null), 2200)
  }

  return (
    <div className="selectable min-h-full bg-[#ececef] p-6">
      <div className="mx-auto max-w-xl">
        <div className="mb-4 flex items-center justify-between gap-2">
          <p className="text-[12px] font-medium text-neutral-500">
            Generated from the portfolio data{msg ? ` - ${msg}` : ''}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                downloadResumeText()
                flash('Saved .txt')
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.06] px-4 py-2 text-[13px] font-semibold text-neutral-800 transition-transform hover:scale-[1.03]"
            >
              <FileText size={15} /> .txt
            </button>
            <button
              onClick={() => {
                downloadResumePdf()
                flash('Saved PDF')
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#0a84ff] px-4 py-2 text-[13px] font-semibold text-white transition-transform hover:scale-[1.03]"
            >
              <Download size={15} /> PDF
            </button>
          </div>
        </div>

        <div className="rounded-sm bg-white p-7 shadow-xl">
          <h2 className="text-[24px] font-bold tracking-tight text-neutral-900">{profile.name}</h2>
          <p className="mt-0.5 text-[13px] text-sky-700">{profile.tagline}</p>
          <p className="mt-2 text-[11.5px] leading-relaxed text-neutral-500">
            {[profile.email, profile.github.replace('https://', ''), profile.website.replace('https://', '')].join('  |  ')}
          </p>

          <ResumeSection title="Summary">
            <p className="text-[13px] leading-relaxed text-neutral-700">{profile.bio}</p>
          </ResumeSection>

          <ResumeSection title="Skills">
            <div className="space-y-1.5">
              {skillGroups.map((g) => (
                <p key={g.title} className="text-[13px] leading-relaxed text-neutral-700">
                  <span className="font-semibold text-neutral-900">{g.title}:</span> {g.skills.join(', ')}
                </p>
              ))}
            </div>
          </ResumeSection>

          <ResumeSection title="Experience">
            {experience.map((e) => (
              <div key={e.id}>
                <p className="text-[13px] font-semibold text-neutral-900">
                  {e.role} - {e.company}
                  <span className="ml-2 font-normal text-neutral-400">{e.year}</span>
                </p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-neutral-700">{e.description}</p>
              </div>
            ))}
          </ResumeSection>

          <ResumeSection title="Projects">
            {projects.map((p) => (
              <div key={p.id}>
                <p className="text-[13px] font-semibold text-neutral-900">
                  {p.name}
                  <span className="ml-2 font-normal text-neutral-400">{p.year}</span>
                </p>
                <p className="mt-0.5 text-[13px] text-neutral-600">{p.tagline}</p>
                <ul className="mt-1 space-y-1">
                  {p.details.features.slice(0, 2).map((f, i) => (
                    <li key={i} className="flex gap-2 text-[12.5px] leading-relaxed text-neutral-700">
                      <span className="mt-[7px] size-1 shrink-0 rounded-full bg-neutral-400" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </ResumeSection>

          <ResumeSection title="Education">
            <p className="text-[13px] font-semibold text-neutral-900">BCA, Kristu Jayanti University</p>
            <p className="mt-0.5 text-[13px] text-neutral-600">2026 - 2030, currently in the first year</p>
          </ResumeSection>
        </div>
      </div>
    </div>
  )
}
