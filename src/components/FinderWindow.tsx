import { useMemo, useState } from 'react'
import {
  AtSign,
  ChevronLeft,
  ChevronRight,
  FileCode2,
  FileText,
  Folder,
  Image as ImageIcon,
  LayoutGrid,
  List,
} from 'lucide-react'
import { useWindows } from '@/os/WindowManager'
import { getFolderAt, homeFolder, type FSEntry } from '@/os/filesystem'
import { FilesystemItem, type Node } from './ui/filesystem-item'
import type { OSWindow } from '@/os/types'

function EntryIcon({ entry, size = 44 }: { entry: FSEntry; size?: number }) {
  if (entry.type === 'folder') {
    return (
      <Folder
        size={size}
        strokeWidth={1.4}
        className="text-sky-100 drop-shadow-[0_4px_10px_rgba(0,0,0,0.4)]"
        fill="rgba(14, 165, 233, 0.9)"
      />
    )
  }
  const cls = 'drop-shadow-[0_4px_10px_rgba(0,0,0,0.4)]'
  switch (entry.kind) {
    case 'project':
      return <FileCode2 size={size} strokeWidth={1.4} className={`text-violet-300 ${cls}`} />
    case 'image':
      return <ImageIcon size={size} strokeWidth={1.4} className={`text-emerald-300 ${cls}`} />
    case 'contact':
      return <AtSign size={size} strokeWidth={1.4} className={`text-amber-300 ${cls}`} />
    default:
      return <FileText size={size} strokeWidth={1.4} className={`text-white/80 ${cls}`} />
  }
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

export default function FinderWindow({ win }: { win: OSWindow }) {
  const { setFolderPath, openApp, finderView, setFinderView } = useWindows()
  const path = win.folderPath ?? []
  const folder = getFolderAt(path)

  const [back, setBack] = useState<string[][]>([])
  const [fwd, setFwd] = useState<string[][]>([])
  const [selected, setSelected] = useState<string | null>(null)

  const navigate = (p: string[]) => {
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

  const sidebarNodes: Node[] = useMemo(
    () => [
      {
        name: 'Home',
        nodes: homeFolder.children
          .filter((c) => c.type === 'folder')
          .map((c) => ({ name: c.name })),
      },
      { name: 'Trash' },
    ],
    [],
  )

  const handleSidebarSelect = (node: Node) => {
    if (node.name === 'Home') navigate([])
    else if (node.name === 'Trash') navigate(['Trash'])
    else navigate([node.name])
  }

  const selectedName = path.length === 0 ? 'Home' : path[0]
  const title = path.length === 0 ? 'Home' : path[path.length - 1]

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Toolbar */}
      <div className="flex h-12 shrink-0 items-center gap-1 border-b border-white/10 bg-white/[0.04] px-3">
        <button
          onClick={goBack}
          disabled={back.length === 0}
          aria-label="Back"
          className="rounded-md p-1.5 text-white/80 transition-colors hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={goForward}
          disabled={fwd.length === 0}
          aria-label="Forward"
          className="rounded-md p-1.5 text-white/80 transition-colors hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronRight size={18} />
        </button>
        <div className="ml-2 truncate text-[13px] font-semibold text-white/90">{title}</div>
        <div className="ml-auto flex items-center gap-0.5 rounded-lg bg-white/5 p-0.5">
          <button
            onClick={() => setFinderView('icons')}
            aria-label="Icon view"
            className={`rounded-md p-1.5 transition-colors ${
              finderView === 'icons' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white/80'
            }`}
          >
            <LayoutGrid size={15} />
          </button>
          <button
            onClick={() => setFinderView('list')}
            aria-label="List view"
            className={`rounded-md p-1.5 transition-colors ${
              finderView === 'list' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white/80'
            }`}
          >
            <List size={15} />
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Sidebar */}
        <div className="hidden w-44 shrink-0 overflow-y-auto border-r border-white/10 bg-black/20 p-2 sm:block">
          <div className="px-2 pb-1 pt-1 text-[11px] font-semibold text-white/40">Favorites</div>
          <ul>
            {sidebarNodes.map((n) => (
              <FilesystemItem
                key={n.name}
                node={n}
                animated
                defaultOpen={n.name === 'Home'}
                onSelect={handleSidebarSelect}
                selectedName={selectedName}
              />
            ))}
          </ul>
        </div>

        {/* Main pane */}
        <div className="min-w-0 flex-1 overflow-y-auto" onClick={() => setSelected(null)}>
          {folder.children.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-[13px] text-white/35">Folder is empty</p>
            </div>
          ) : finderView === 'icons' ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(92px,1fr))] gap-1 p-4">
              {folder.children.map((entry) => (
                <button
                  key={entry.name}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelected(entry.name)
                  }}
                  onDoubleClick={() => openEntry(entry)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl px-1 py-3 transition-colors ${
                    selected === entry.name ? 'bg-white/20' : 'hover:bg-white/[0.07]'
                  }`}
                >
                  <EntryIcon entry={entry} />
                  <span className="w-full break-words text-center text-[12px] leading-tight text-white/90">
                    {entry.name}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-2">
              <div className="flex items-center gap-3 rounded-md px-3 py-1.5 text-[11px] font-semibold text-white/40">
                <span className="flex-1">Name</span>
                <span className="w-20 text-right">Kind</span>
              </div>
              {folder.children.map((entry) => (
                <button
                  key={entry.name}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelected(entry.name)
                  }}
                  onDoubleClick={() => openEntry(entry)}
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-1.5 text-left transition-colors ${
                    selected === entry.name ? 'bg-white/20' : 'hover:bg-white/[0.07]'
                  }`}
                >
                  <EntryIcon entry={entry} size={20} />
                  <span className="flex-1 truncate text-[13px] text-white/90">{entry.name}</span>
                  <span className="w-20 truncate text-right text-[12px] text-white/45">
                    {kindLabel(entry)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="flex h-7 shrink-0 items-center justify-center border-t border-white/10 bg-white/[0.03]">
        <span className="text-[11px] text-white/40">
          {folder.children.length} item{folder.children.length === 1 ? '' : 's'}
        </span>
      </div>
    </div>
  )
}
