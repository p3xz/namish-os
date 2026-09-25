import { Pin } from 'lucide-react'

const NOTES = [
  {
    title: 'Ship daily',
    body: 'One genuine commit a day. Small, real, and never fake. The graph takes care of itself.',
    color: 'from-amber-200 to-yellow-300',
  },
  {
    title: 'Fundamentals first',
    body: 'Learn it properly, then let AI do the heavy lifting. That is the whole strategy.',
    color: 'from-sky-200 to-cyan-300',
  },
  {
    title: 'Internship checklist',
    body: 'TypeScript: solid. Next.js: shipping. MongoDB: connected. Cold emails: pending.',
    color: 'from-rose-200 to-pink-300',
  },
]

export default function NotesApp() {
  return (
    <div className="grid min-h-0 flex-1 content-start grid-cols-1 gap-4 overflow-y-auto bg-black/30 p-5 sm:grid-cols-2">
      {NOTES.map((n) => (
        <div
          key={n.title}
          className={`relative rounded-lg bg-gradient-to-br p-4 pt-8 shadow-[0_10px_30px_rgba(0,0,0,0.35)] ${n.color}`}
        >
          <Pin size={16} className="absolute left-1/2 top-2 -translate-x-1/2 text-black/40" />
          <h3 className="text-[14px] font-bold text-black/80">{n.title}</h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-black/65">{n.body}</p>
        </div>
      ))}
    </div>
  )
}
