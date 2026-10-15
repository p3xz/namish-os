import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, Pin, Plus, Search, Trash2 } from 'lucide-react'

/* ------------------------------------------------------------------ model */

interface Note {
  id: string
  title: string
  body: string
  color: string
  updatedAt: number
}

const STORAGE_KEY = 'namishos.notes'

/** Sticky-note gradient per note, cycled when a new note is created. */
const COLORS = [
  'from-amber-200 to-yellow-300',
  'from-sky-200 to-cyan-300',
  'from-rose-200 to-pink-300',
  'from-emerald-200 to-green-300',
  'from-violet-200 to-purple-300',
  'from-orange-200 to-amber-300',
]

const SEED_NOTES: Note[] = [
  {
    id: 'seed-ship-daily',
    title: 'Ship daily',
    body: 'One genuine commit a day. Small, real, and never fake. The graph takes care of itself.',
    color: COLORS[0],
    updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'seed-fundamentals',
    title: 'Fundamentals first',
    body: 'Learn it properly, then let AI do the heavy lifting. That is the whole strategy.',
    color: COLORS[1],
    updatedAt: Date.now() - 24 * 60 * 60 * 1000,
  },
  {
    id: 'seed-internship',
    title: 'Internship checklist',
    body: 'TypeScript: solid. Next.js: shipping. MongoDB: connected. Cold emails: pending.',
    color: COLORS[2],
    updatedAt: Date.now(),
  },
]

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `note-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

function isNote(v: unknown): v is Note {
  if (typeof v !== 'object' || v === null) return false
  const n = v as Record<string, unknown>
  return (
    typeof n.id === 'string' &&
    typeof n.title === 'string' &&
    typeof n.body === 'string' &&
    typeof n.color === 'string' &&
    typeof n.updatedAt === 'number'
  )
}

function loadNotes(): Note[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw === null) return SEED_NOTES
    const parsed: unknown = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.every(isNote)) return parsed
    return SEED_NOTES
  } catch {
    return SEED_NOTES
  }
}

function formatDate(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  if (sameDay) {
    return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  }
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

/* ------------------------------------------------------------------ view */

export default function NotesApp() {
  const [notes, setNotes] = useState<Note[]>(loadNotes)
  /** Id of the note open in the editor. Null means the list view. */
  const [openId, setOpenId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const titleRef = useRef<HTMLInputElement | null>(null)

  /* Persist every change. Notes stay on this device only, like the rest of the OS. */
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
    } catch {
      // Storage full or unavailable: notes still work for this session.
    }
  }, [notes])

  const sorted = useMemo(
    () => [...notes].sort((a, b) => b.updatedAt - a.updatedAt),
    [notes],
  )

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return sorted
    return sorted.filter(
      (n) => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q),
    )
  }, [sorted, query])

  const openNote = openId !== null ? notes.find((n) => n.id === openId) ?? null : null

  const createNote = () => {
    const color = COLORS[notes.length % COLORS.length]
    const note: Note = { id: newId(), title: '', body: '', color, updatedAt: Date.now() }
    setNotes((prev) => [note, ...prev])
    setQuery('')
    setOpenId(note.id)
    // Focus the title field once the editor mounts.
    window.setTimeout(() => titleRef.current?.focus(), 0)
  }

  const updateNote = (id: string, patch: Partial<Pick<Note, 'title' | 'body'>>) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n)),
    )
  }

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id))
    setOpenId(null)
  }

  /* ------------------------------------------------------------ editor */

  if (openNote) {
    return (
      <div className={`flex min-h-0 flex-1 flex-col bg-gradient-to-br ${openNote.color}`}>
        {/* Editor toolbar */}
        <div className="flex shrink-0 items-center justify-between px-3 py-2">
          <button
            onClick={() => setOpenId(null)}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-[13px] font-medium text-black/60 hover:bg-black/10"
          >
            <ArrowLeft size={15} />
            Notes
          </button>
          <button
            onClick={() => deleteNote(openNote.id)}
            title="Delete note"
            aria-label="Delete note"
            className="rounded-md p-1.5 text-black/60 hover:bg-black/10 hover:text-red-700"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* Title + body, saved as you type */}
        <input
          ref={titleRef}
          value={openNote.title}
          onChange={(e) => updateNote(openNote.id, { title: e.target.value })}
          placeholder="New Note"
          aria-label="Note title"
          className="w-full shrink-0 bg-transparent px-5 pb-1 text-[20px] font-bold text-black/80 outline-none placeholder:text-black/35"
        />
        <textarea
          value={openNote.body}
          onChange={(e) => updateNote(openNote.id, { body: e.target.value })}
          placeholder="Start typing..."
          aria-label="Note body"
          className="min-h-0 w-full flex-1 resize-none bg-transparent px-5 pb-5 pt-1 text-[14px] leading-relaxed text-black/70 outline-none placeholder:text-black/35"
        />
        <div className="shrink-0 px-5 pb-3 text-[11px] text-black/40">
          Last edited {formatDate(openNote.updatedAt)}
        </div>
      </div>
    )
  }

  /* ------------------------------------------------------------ list */

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#f6f6f8]">
      {/* Toolbar: search + new note */}
      <div className="flex shrink-0 items-center gap-2 px-3 py-2">
        <div className="flex flex-1 items-center gap-1.5 rounded-md bg-black/5 px-2 py-1.5">
          <Search size={14} className="shrink-0 text-black/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes"
            aria-label="Search notes"
            className="w-full bg-transparent text-[13px] text-black/80 outline-none placeholder:text-black/40"
          />
        </div>
        <button
          onClick={createNote}
          title="New note"
          aria-label="New note"
          className="rounded-md bg-black/5 p-1.5 text-black/70 hover:bg-black/10"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Note grid */}
      <div className="grid min-h-0 flex-1 content-start grid-cols-1 gap-4 overflow-y-auto p-5 pt-1 sm:grid-cols-2">
        {visible.map((n) => (
          <button
            key={n.id}
            onClick={() => setOpenId(n.id)}
            className={`relative rounded-lg bg-gradient-to-br p-4 pt-8 text-left shadow-[0_10px_30px_rgba(0,0,0,0.18)] transition-transform hover:scale-[1.02] ${n.color}`}
          >
            <Pin size={16} className="absolute left-1/2 top-2 -translate-x-1/2 text-black/40" />
            <h3 className="truncate text-[14px] font-bold text-black/80">
              {n.title || 'New Note'}
            </h3>
            <p className="mt-1.5 line-clamp-3 text-[13px] leading-relaxed text-black/65">
              {n.body || 'Empty note'}
            </p>
            <p className="mt-2 text-[11px] text-black/40">{formatDate(n.updatedAt)}</p>
          </button>
        ))}

        {visible.length === 0 && (
          <div className="col-span-full flex flex-col items-center gap-2 py-10 text-center">
            <p className="text-[14px] font-medium text-black/50">
              {query.trim() ? `No notes match "${query.trim()}"` : 'No notes yet'}
            </p>
            <button
              onClick={createNote}
              className="rounded-md bg-black/5 px-3 py-1.5 text-[13px] font-medium text-black/70 hover:bg-black/10"
            >
              Create your first note
            </button>
          </div>
        )}
      </div>

      <div className="shrink-0 px-5 pb-2 text-[11px] text-black/40">
        {notes.length} {notes.length === 1 ? 'note' : 'notes'} · saved on this device
      </div>
    </div>
  )
}
