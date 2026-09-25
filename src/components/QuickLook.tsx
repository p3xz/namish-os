import { ExternalLink, FileCode2, Github } from 'lucide-react'
import { textDocs } from '@/os/filesystem'
import { profile, projects } from '@/data/portfolio'
import type { OSWindow } from '@/os/types'

function Autolink({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s)]+)/g)
  return (
    <>
      {parts.map((p, i) =>
        /^https?:\/\//.test(p) ? (
          <a
            key={i}
            href={p}
            target="_blank"
            rel="noreferrer"
            className="text-sky-300 underline decoration-sky-300/50 underline-offset-2 hover:text-sky-200"
          >
            {p}
          </a>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  )
}

function TextPreview({ docKey }: { docKey: string }) {
  const doc = textDocs[docKey]
  if (!doc) return <p className="p-6 text-[13px] text-white/50">File not found.</p>
  return (
    <div className="selectable min-h-full p-6">
      <h2 className="mb-4 text-[15px] font-semibold text-white">{doc.title}</h2>
      <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-white/80">
        <Autolink text={doc.body} />
      </p>
    </div>
  )
}

function ProjectPreview({ id }: { id: string }) {
  const project = projects.find((p) => p.id === id)
  if (!project) return <p className="p-6 text-[13px] text-white/50">Project not found.</p>
  return (
    <div className="selectable min-h-full p-6">
      <div className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b from-violet-400 to-violet-700 shadow-lg">
          <FileCode2 size={26} className="text-white" />
        </div>
        <div>
          <h2 className="text-[20px] font-bold tracking-tight text-white">{project.name}</h2>
          <p className="mt-0.5 text-[13px] text-white/55">{project.tagline}</p>
        </div>
      </div>

      <p className="mt-5 text-[13.5px] leading-relaxed text-white/80">{project.description}</p>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {project.stack.map((s) => (
          <span
            key={s}
            className="rounded-full border border-white/15 bg-white/[0.07] px-2.5 py-1 text-[11.5px] font-medium text-white/75"
          >
            {s}
          </span>
        ))}
      </div>

      <div className="mt-4 flex gap-4 text-[12px] text-white/45">
        <span>{project.year}</span>
        <span>{project.category}</span>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {project.repoUrl && (
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-black transition-transform hover:scale-[1.03]"
          >
            <Github size={15} /> View Code
          </a>
        )}
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-white/20"
          >
            <ExternalLink size={15} /> Open Live
          </a>
        )}
      </div>
    </div>
  )
}

function ContactPreview() {
  const links = [
    { label: 'Email', value: profile.email, href: `mailto:${profile.email}` },
    { label: 'GitHub', value: 'github.com/p3xz', href: profile.github },
    { label: 'X', value: '@NamishYadavv', href: profile.x },
    { label: 'Website', value: 'insidcode.vercel.app', href: profile.website },
    { label: 'Portfolio', value: 'namishhh.vercel.app', href: profile.portfolio },
  ]
  return (
    <div className="selectable flex min-h-full flex-col items-center p-6 text-center">
      <img
        src={profile.avatar}
        alt={profile.name}
        className="size-24 rounded-full border-2 border-white/20 object-cover shadow-xl"
      />
      <h2 className="mt-4 text-[20px] font-bold text-white">{profile.name}</h2>
      <p className="mt-1 text-[13px] text-white/55">{profile.tagline}</p>
      <div className="mt-6 w-full max-w-sm space-y-1.5">
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target={l.href.startsWith('mailto:') ? undefined : '_blank'}
            rel="noreferrer"
            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 transition-colors hover:bg-white/[0.12]"
          >
            <span className="text-[12px] font-semibold text-white/45">{l.label}</span>
            <span className="text-[13px] text-sky-300">{l.value}</span>
          </a>
        ))}
      </div>
    </div>
  )
}

export default function QuickLook({ win }: { win: OSWindow }) {
  const ql = win.quickLook
  if (!ql) return null

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-black/30">
      {ql.kind === 'text' && <TextPreview docKey={ql.ref} />}
      {ql.kind === 'project' && <ProjectPreview id={ql.ref} />}
      {ql.kind === 'image' && (
        <div className="flex min-h-full items-center justify-center p-6">
          <img
            src={ql.ref}
            alt={ql.title}
            className="max-h-full max-w-full rounded-xl border border-white/15 object-contain shadow-2xl"
          />
        </div>
      )}
      {ql.kind === 'contact' && <ContactPreview />}
    </div>
  )
}
