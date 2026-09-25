import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, House, LayoutGrid, List, Search, Trash2 } from 'lucide-react'
import { useWindows } from '@/os/WindowManager'
import { getFolderAt, homeFolder, trashFolder, type FSEntry, type FSFolder } from '@/os/filesystem'
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

const pathsEqual = (a: string[], b: string[]) =>
  a.length === b.length && a.every((s, i) => s === b[i])

interface SidebarItem {
  key: string
  label: string
  path: string[]
  indent?: boolean
}

export default function FinderWindow({ win }: { win: OSWindow }) {
  const { setFolderPath, openApp, finderView, setFinderView } = useWindows()
  const path = win.folderPath ?? []
  const folder: FSFolder = getFolderAt(path)

  const [back, setBack] = useState<string[][]>([])
  const [fwd, setFwd] = useState<string[][]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  // Clear selection whenever the folder itself changes (e.g. from the sidebar or dock)
  useEffect(() => {
    setSelected(null)
    setQuery('')
  }, [path.join('/')])

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
        </div>

        <div className="flex w-40 items-center gap-1.5 rounded-lg border border-black/10 bg-white px-2 py-1 sm:w-48">
          <Search size={13} className="shrink-0 text-neutral-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="selectable min-w-0 flex-1 bg-transparent text-[12.5px] outline-none placeholder:text-neutral-400"
          />
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
                      {entry.name}
                    </span>
                  </button>
                )
              })}
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
                      {entry.name}
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
