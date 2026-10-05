import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  FileCode2,
  GalleryHorizontal,
  House,
  LayoutGrid,
  List,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { useWindows } from '@/os/WindowManager'
import { getFolderAt, homeFolder, textDocs, trashFolder, type FSEntry, type FSFolder } from '@/os/filesystem'
import { profile, projects } from '@/data/portfolio'
import MacFolder from './MacFolder'
import type { OSWindow } from '@/os/types'

/** Original document icon artwork, tinted by file kind. */
function FileIcon({ entry, size = 44 }: { entry: FSEntry; size?: number }) {
  if (entry.type === 'folder') return <MacFolder size={size} />
  const glyph =
    entry.kind === 'project'
      ? '</>'
      : entry.kind === 'image'
        ? '[ ]'
        : entry.kind === 'contact'
          ? '@'
          : 'Aa'
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden
      style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.25))' }}
    >
      <defs>
        <linearGradient id={`fdoc-${size}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e8e8ec" />
        </linearGradient>
      </defs>
      <path
        d="M14 6 Q14 4 16 4 L40 4 L52 16 L52 58 Q52 60 50 60 L16 60 Q14 60 14 58 Z"
        fill={`url(#fdoc-${size})`}
        stroke="#c9c9d2"
        strokeWidth="1.5"
      />
      <path d="M40 4 L52 16 L40 16 Q38 16 38 14 Z" fill="#d5d5de" />
      <text
        x="33"
        y="42"
        textAnchor="middle"
        fontSize="13"
        fontWeight="700"
        fill="#8a8a96"
        fontFamily="ui-monospace, monospace"
      >
        {glyph}
      </text>
    </svg>
  )
}

function kindLabel(entry: FSEntry): string {
  if (entry.type === 'folder') return 'Folder'
  switch (entry.kind) {
    case 'project':
      return 'Project'
    case 'image':
      return 'Image'
    case 'contact':
      return 'Contact'
    default:
      return 'Text'
  }
}

/** Entry name with the current search query highlighted in place, macOS-style. */
function HighlightedName({
  name,
  query,
  selected = false,
}: {
  name: string
  query: string
  selected?: boolean
}) {
  const q = query.trim().toLowerCase()
  const idx = q ? name.toLowerCase().indexOf(q) : -1
  if (idx === -1) return <>{name}</>
  return (
    <>
      {name.slice(0, idx)}
      <mark
        className={`rounded-[3px] px-px ${
          selected ? 'bg-white/45 text-inherit' : 'bg-[#0a84ff]/25 text-inherit'
        }`}
      >
        {name.slice(idx, idx + q.length)}
      </mark>
      {name.slice(idx + q.length)}
    </>
  )
}

/** Large-format preview used by the gallery view: a macOS-style zoomed look at one entry. */
function GalleryPreview({ entry }: { entry: FSEntry }) {
  if (entry.type === 'folder') {
    const count = entry.children.length
    return (
      <div className="flex h-full flex-col items-center justify-center gap-5 p-8">
        <MacFolder size={128} />
        <div className="text-center">
          <p className="text-[17px] font-semibold text-neutral-900">{entry.name}</p>
          <p className="mt-1 text-[12.5px] text-neutral-500">
            {count} item{count === 1 ? '' : 's'}
          </p>
        </div>
      </div>
    )
  }

  if (entry.kind === 'image') {
    return (
      <div className="flex h-full items-center justify-center bg-neutral-900 p-8">
        <img
          src={entry.ref}
          alt={entry.name}
          className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
          draggable={false}
        />
      </div>
    )
  }

  if (entry.kind === 'text') {
    const doc = textDocs[entry.ref]
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="max-h-full w-full max-w-md overflow-hidden rounded-xl border border-black/10 bg-white p-6 shadow-xl">
          <h3 className="mb-3 text-[15px] font-semibold text-neutral-900">
            {doc ? doc.title : entry.name}
          </h3>
          <p
            className="whitespace-pre-wrap text-[13px] leading-relaxed text-neutral-600"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 14,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {doc ? doc.body : ''}
          </p>
        </div>
      </div>
    )
  }

  if (entry.kind === 'project') {
    const project = projects.find((p) => p.id === entry.ref)
    if (!project) {
      return (
        <p className="flex h-full items-center justify-center text-[13px] text-neutral-400">
          Project not found.
        </p>
      )
    }
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="max-h-full w-full max-w-md overflow-hidden rounded-xl border border-black/10 bg-white p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b from-violet-400 to-violet-700 shadow-lg">
              <FileCode2 size={26} className="text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-[18px] font-bold tracking-tight text-neutral-900">
                {project.name}
              </h3>
              <p className="truncate text-[13px] text-neutral-500">{project.tagline}</p>
            </div>
          </div>
          <p className="mt-4 text-[13px] leading-relaxed text-neutral-600">
            {project.description}
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.stack.slice(0, 6).map((s) => (
              <span
                key={s}
                className="rounded-full border border-black/10 bg-black/[0.05] px-2.5 py-1 text-[11px] font-medium text-neutral-600"
              >
                {s}
              </span>
            ))}
          </div>
          <div className="mt-4 flex gap-4 text-[12px] text-neutral-400">
            <span>{project.year}</span>
            <span>{project.category}</span>
          </div>
        </div>
      </div>
    )
  }

  // contact
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
      <img
        src={profile.avatar}
        alt={profile.name}
        className="size-28 rounded-full border border-black/10 object-cover shadow-2xl"
        draggable={false}
      />
      <div className="text-center">
        <p className="text-[17px] font-semibold text-neutral-900">{profile.name}</p>
        <p className="mt-1 text-[12.5px] text-neutral-500">{profile.tagline}</p>
      </div>
    </div>
  )
}

const pathsEqual = (a: string[], b: string[]) =>
  a.length === b.length && a.every((s, i) => s === b[i])

interface SidebarItem {
  key: string
  label: string
  path: string[]
  indent?: boolean
}

export default function FinderWindow({ win }: { win: OSWindow }) {
  const { setFolderPath, openApp, finderView, setFinderView, topWindow } = useWindows()
  const path = win.folderPath ?? []
  const folder: FSFolder = getFolderAt(path)

  const [back, setBack] = useState<string[][]>([])
  const [fwd, setFwd] = useState<string[][]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const thumbRefs = useRef(new Map<string, HTMLButtonElement>())
  const searchRef = useRef<HTMLInputElement>(null)

  // Clear selection whenever the folder itself changes (e.g. from the sidebar or dock)
  useEffect(() => {
    setSelected(null)
    setQuery('')
  }, [path.join('/')])

  // Cmd+F focuses the search box of the topmost Finder window, macOS-style.
  useEffect(() => {
    if (topWindow?.id !== win.id) return
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault()
        searchRef.current?.focus()
        searchRef.current?.select()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [topWindow?.id, win.id])

  const navigate = (p: string[]) => {
    if (pathsEqual(p, path)) return
    setBack((b) => [...b, path])
    setFwd([])
    setSelected(null)
    setFolderPath(win.id, p)
  }

  const goBack = () => {
    if (back.length === 0) return
    const prev = back[back.length - 1]
    setBack((b) => b.slice(0, -1))
    setFwd((f) => [path, ...f])
    setSelected(null)
    setFolderPath(win.id, prev)
  }

  const goForward = () => {
    if (fwd.length === 0) return
    const [next, ...rest] = fwd
    setFwd(rest)
    setBack((b) => [...b, path])
    setSelected(null)
    setFolderPath(win.id, next)
  }

  const openEntry = (entry: FSEntry) => {
    if (entry.type === 'folder') {
      navigate([...path, entry.name])
    } else {
      openApp('quicklook', {
        quickLook: { kind: entry.kind, ref: entry.ref, title: entry.name },
      })
    }
  }

  const sidebar: SidebarItem[] = useMemo(
    () => [
      { key: 'home', label: 'Home', path: [] },
      ...homeFolder.children
        .filter((c) => c.type === 'folder')
        .map((c) => ({ key: c.name, label: c.name, path: [c.name], indent: true })),
      { key: 'trash', label: 'Trash', path: ['Trash'] },
    ],
    [],
  )

  const activeKey = path.length === 0 ? 'home' : path[0] === 'Trash' ? 'trash' : path[0]

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return folder.children
    return folder.children.filter((c) => c.name.toLowerCase().includes(q))
  }, [folder, query])

  // Gallery view: the previewed entry follows the selection, defaulting to the first
  // visible entry so there is always a preview. Clicking a thumbnail previews it,
  // double-clicking opens it, and arrow keys move through the strip.
  const galleryEntry = visible.find((e) => e.name === selected) ?? visible[0] ?? null

  const moveGallerySelection = (dir: 1 | -1) => {
    if (visible.length === 0) return
    const idx = visible.findIndex((e) => e.name === galleryEntry?.name)
    const next = visible[(idx + dir + visible.length) % visible.length]
    setSelected(next.name)
    thumbRefs.current
      .get(next.name)
      ?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }

  const onGalleryKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      moveGallerySelection(1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      moveGallerySelection(-1)
    } else if (e.key === 'Enter' && galleryEntry) {
      e.preventDefault()
      openEntry(galleryEntry)
    }
  }

  const isTrash = path[0] === 'Trash'

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white text-neutral-800">
      {/* Toolbar */}
      <div className="flex h-12 shrink-0 items-center gap-1 border-b border-black/10 bg-[#f6f6f8] px-3">
        <button
          onClick={goBack}
          disabled={back.length === 0}
          aria-label="Back"
          className="rounded-md p-1.5 text-neutral-600 transition-colors hover:bg-black/10 disabled:opacity-25 disabled:hover:bg-transparent"
        >
          <ChevronLeft size={20} strokeWidth={2.2} />
        </button>
        <button
          onClick={goForward}
          disabled={fwd.length === 0}
          aria-label="Forward"
          className="rounded-md p-1.5 text-neutral-600 transition-colors hover:bg-black/10 disabled:opacity-25 disabled:hover:bg-transparent"
        >
          <ChevronRight size={20} strokeWidth={2.2} />
        </button>

        <div className="mx-auto flex items-center gap-0.5 rounded-lg bg-black/[0.07] p-0.5">
          <button
            onClick={() => setFinderView('icons')}
            aria-label="Icon view"
            className={`rounded-md p-1.5 transition-colors ${
              finderView === 'icons'
                ? 'bg-white text-neutral-800 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <LayoutGrid size={15} />
          </button>
          <button
            onClick={() => setFinderView('list')}
            aria-label="List view"
            className={`rounded-md p-1.5 transition-colors ${
              finderView === 'list'
                ? 'bg-white text-neutral-800 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <List size={15} />
          </button>
          <button
            onClick={() => setFinderView('gallery')}
            aria-label="Gallery view"
            className={`rounded-md p-1.5 transition-colors ${
              finderView === 'gallery'
                ? 'bg-white text-neutral-800 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <GalleryHorizontal size={15} />
          </button>
        </div>

        <div className="flex w-40 items-center gap-1.5 rounded-lg border border-black/10 bg-white px-2 py-1 sm:w-48">
          <Search size={13} className="shrink-0 text-neutral-400" />
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape' && query) {
                setQuery('')
                e.currentTarget.blur()
              }
            }}
            placeholder="Search"
            aria-label="Search folder"
            className="selectable min-w-0 flex-1 bg-transparent text-[12.5px] outline-none placeholder:text-neutral-400"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('')
                searchRef.current?.focus()
              }}
              aria-label="Clear search"
              className="shrink-0 rounded-full p-0.5 text-neutral-400 transition-colors hover:bg-black/10 hover:text-neutral-600"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Sidebar */}
        <div className="hidden w-48 shrink-0 overflow-y-auto border-r border-black/10 bg-[#ececef] p-2 sm:block">
          <div className="px-2.5 pb-1 pt-1.5 text-[11px] font-bold text-neutral-400">Favorites</div>
          <ul className="space-y-0.5">
            {sidebar.map((item) => {
              const active = activeKey === item.key
              return (
                <li key={item.key}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[5px] text-left text-[13px] transition-colors ${
                      active ? 'bg-black/[0.12] font-medium text-neutral-900' : 'text-neutral-700 hover:bg-black/[0.05]'
                    } ${item.indent ? 'pl-8' : ''}`}
                  >
                    {item.key === 'home' ? (
                      <House size={16} className="shrink-0 text-sky-600" />
                    ) : item.key === 'trash' ? (
                      <Trash2 size={16} className="shrink-0 text-neutral-500" />
                    ) : (
                      <MacFolder size={17} />
                    )}
                    <span className="truncate">{item.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Main pane */}
        <div className="min-w-0 flex-1 overflow-y-auto bg-white" onClick={() => setSelected(null)}>
          {visible.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-[13px] text-neutral-400">
                {query ? `No results for "${query}"` : isTrash && trashFolder.children.length === 0 ? 'Trash is empty' : 'Folder is empty'}
              </p>
            </div>
          ) : finderView === 'icons' ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-1 p-4">
              {visible.map((entry) => {
                const isSel = selected === entry.name
                return (
                  <button
                    key={entry.name}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelected(entry.name)
                    }}
                    onDoubleClick={() => openEntry(entry)}
                    className="flex flex-col items-center gap-1.5 rounded-xl px-1 py-3"
                  >
                    <span
                      className={`rounded-lg p-1 transition-colors ${isSel ? 'bg-black/[0.1]' : ''}`}
                    >
                      <FileIcon entry={entry} />
                    </span>
                    <span
                      className={`max-w-full break-words rounded px-1 text-center text-[12px] leading-tight ${
                        isSel ? 'bg-[#0a84ff] text-white' : 'text-neutral-800'
                      }`}
                    >
                      <HighlightedName name={entry.name} query={query} selected={isSel} />
                    </span>
                  </button>
                )
              })}
            </div>
          ) : finderView === 'gallery' ? (
            <div className="flex h-full flex-col" onClick={(e) => e.stopPropagation()}>
              {/* Large preview of the selected entry */}
              <div className="min-h-0 flex-1 bg-[#f4f4f6]">
                {galleryEntry && <GalleryPreview entry={galleryEntry} />}
              </div>
              {/* Caption */}
              <div className="flex shrink-0 items-center justify-center gap-2 border-t border-black/10 bg-white px-4 py-1.5">
                <span className="truncate text-[12.5px] font-semibold text-neutral-800">
                  {galleryEntry?.name}
                </span>
                <span className="shrink-0 text-[12px] text-neutral-400">
                  {galleryEntry ? kindLabel(galleryEntry) : ''}
                </span>
              </div>
              {/* Thumbnail strip */}
              <div
                tabIndex={0}
                onKeyDown={onGalleryKeyDown}
                aria-label="Gallery thumbnails"
                className="flex shrink-0 gap-1 overflow-x-auto border-t border-black/10 bg-[#ececef] px-3 py-2.5 outline-none focus:bg-[#e4e4e9]"
              >
                {visible.map((entry) => {
                  const isSel = galleryEntry?.name === entry.name
                  return (
                    <button
                      key={entry.name}
                      ref={(el) => {
                        if (el) thumbRefs.current.set(entry.name, el)
                        else thumbRefs.current.delete(entry.name)
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelected(entry.name)
                      }}
                      onDoubleClick={() => openEntry(entry)}
                      className={`flex w-20 shrink-0 flex-col items-center gap-1.5 rounded-lg px-1 py-2 transition-colors ${
                        isSel
                          ? 'bg-[#0a84ff]/15 ring-1 ring-[#0a84ff]/60'
                          : 'hover:bg-black/[0.06]'
                      }`}
                    >
                      <FileIcon entry={entry} size={44} />
                      <span className="max-w-full truncate text-[10.5px] leading-tight text-neutral-700">
                        <HighlightedName name={entry.name} query={query} />
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="p-2">
              <div className="flex items-center gap-3 border-b border-black/10 px-3 py-1.5 text-[11px] font-semibold text-neutral-400">
                <span className="flex-1">Name</span>
                <span className="w-24 text-right">Kind</span>
              </div>
              {visible.map((entry) => {
                const isSel = selected === entry.name
                return (
                  <button
                    key={entry.name}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelected(entry.name)
                    }}
                    onDoubleClick={() => openEntry(entry)}
                    className={`flex w-full items-center gap-3 rounded-md px-3 py-[5px] text-left ${
                      isSel ? 'bg-[#0a84ff]' : 'hover:bg-black/[0.05]'
                    }`}
                  >
                    <FileIcon entry={entry} size={22} />
                    <span
                      className={`flex-1 truncate text-[13px] ${isSel ? 'text-white' : 'text-neutral-800'}`}
                    >
                      <HighlightedName name={entry.name} query={query} selected={isSel} />
                    </span>
                    <span
                      className={`w-24 truncate text-right text-[12px] ${isSel ? 'text-white/85' : 'text-neutral-400'}`}
                    >
                      {kindLabel(entry)}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="flex h-7 shrink-0 items-center justify-center border-t border-black/10 bg-[#f6f6f8]">
        <span className="text-[11px] font-medium text-neutral-400">
          {visible.length} item{visible.length === 1 ? '' : 's'}
          {query ? ` matching "${query}"` : ''}
        </span>
      </div>
    </div>
  )
}
