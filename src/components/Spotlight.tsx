import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Code2,
  FileText,
  Folder,
  Globe,
  Image as ImageIcon,
  Info,
  Mail,
  MessageCircle,
  NotebookPen,
  Search,
  Settings2,
  Sparkles,
  SquareTerminal,
  Swords,
} from 'lucide-react'
import { useWindows } from '@/os/WindowManager'
import { onSpotlightOpen, dispatchTerminalCommand } from '@/os/spotlightBus'
import {
  homeFolder,
  trashFolder,
  type FSFolder,
} from '@/os/filesystem'
import { projects } from '@/data/portfolio'
import type { AppId } from '@/os/types'

/* ------------------------------------------------------------------ types */

type SpotAction =
  | { type: 'app'; app: AppId }
  | { type: 'folder'; path: string[] }
  | { type: 'quicklook'; kind: 'text' | 'project' | 'image' | 'contact'; ref: string; title: string }
  | { type: 'terminal'; command: string }
  | { type: 'settings' }

type Group = 'Applications' | 'Folders' | 'Projects' | 'Files' | 'Terminal' | 'Settings'

interface SpotItem {
  id: string
  title: string
  subtitle: string
  keywords: string
  group: Group
  /** lucide icon key, resolved when rendering */
  icon: string
  action: SpotAction
}

/* ------------------------------------------------------------------ index */

const APPS: { app: AppId; name: string; subtitle: string; keywords: string; icon: string }[] = [
  { app: 'files', name: 'Files', subtitle: 'Browse folders', keywords: 'finder files folders documents', icon: 'files' },
  { app: 'terminal', name: 'Terminal', subtitle: 'Command line', keywords: 'shell zsh console cli', icon: 'terminal' },
  { app: 'web', name: 'Web', subtitle: 'Browse the web', keywords: 'browser internet safari', icon: 'web' },
  { app: 'messages', name: 'Messages', subtitle: 'Chat with Namish', keywords: 'chat imessage contact', icon: 'messages' },
  { app: 'notes', name: 'Notes', subtitle: 'Your notes', keywords: 'notepad memo', icon: 'notes' },
  { app: 'ai', name: 'AI Assistant', subtitle: 'Ask anything', keywords: 'ai assistant help', icon: 'ai' },
  { app: 'insidcode', name: 'InsidCode', subtitle: 'Coding duels', keywords: 'code competitive programming game', icon: 'insidcode' },
  { app: 'settings', name: 'System Settings', subtitle: 'Wallpaper and more', keywords: 'settings preferences system', icon: 'settings' },
  { app: 'about', name: 'About NamishOS', subtitle: 'Version info', keywords: 'about version info', icon: 'about' },
]

const COMMANDS: { cmd: string; desc: string }[] = [
  { cmd: 'help', desc: 'List all terminal commands' },
  { cmd: 'whoami', desc: 'Show who is logged in' },
  { cmd: 'about', desc: 'Print a short bio' },
  { cmd: 'projects', desc: 'List projects' },
  { cmd: 'skills', desc: 'List skills' },
  { cmd: 'experience', desc: 'Show work experience' },
  { cmd: 'contact', desc: 'Where to find Namish' },
  { cmd: 'open projects', desc: 'Open the Projects folder' },
  { cmd: 'echo', desc: 'Say something back' },
  { cmd: 'date', desc: 'Current date and time' },
  { cmd: 'clear', desc: 'Clear the terminal screen' },
  { cmd: 'exit', desc: 'Close the terminal' },
]

const WALLPAPERS: { id: string; name: string }[] = [
  { id: 'tide', name: 'Tide' },
  { id: 'drift', name: 'Drift' },
  { id: 'ember', name: 'Ember' },
]

function collectFolders(node: FSFolder, path: string[], out: SpotItem[]) {
  for (const c of node.children) {
    if (c.type !== 'folder') continue
    const p = [...path, c.name]
    out.push({
      id: `folder:${p.join('/')}`,
      title: c.name,
      subtitle: p.length > 1 ? p.slice(0, -1).join(' / ') : 'Home folder',
      keywords: `folder directory ${c.name}`,
      group: 'Folders',
      icon: 'folder',
      action: { type: 'folder', path: p },
    })
    collectFolders(c, p, out)
  }
}

function collectFiles(node: FSFolder, path: string[], out: SpotItem[]) {
  for (const c of node.children) {
    if (c.type === 'folder') {
      collectFiles(c, [...path, c.name], out)
      continue
    }
    out.push({
      id: `file:${c.ref}`,
      title: c.name,
      subtitle: path.length > 0 ? path.join(' / ') : 'Home',
      keywords: `file document ${c.name} ${c.kind}`,
      group: 'Files',
      icon: c.kind,
      action: { type: 'quicklook', kind: c.kind, ref: c.ref, title: c.name },
    })
  }
}

function buildIndex(): SpotItem[] {
  const items: SpotItem[] = []

  for (const a of APPS) {
    items.push({
      id: `app:${a.app}`,
      title: a.name,
      subtitle: a.subtitle,
      keywords: `app application ${a.keywords}`,
      group: 'Applications',
      icon: a.icon,
      action: { type: 'app', app: a.app },
    })
  }

  collectFolders(homeFolder, [], items)
  collectFolders(trashFolder, [], items)
  // Trash root itself
  items.push({
    id: 'folder:Trash',
    title: 'Trash',
    subtitle: 'Deleted files',
    keywords: 'trash bin deleted',
    group: 'Folders',
    icon: 'folder',
    action: { type: 'folder', path: ['Trash'] },
  })

  for (const p of projects) {
    items.push({
      id: `project:${p.id}`,
      title: p.name,
      subtitle: p.tagline,
      keywords: `project portfolio ${p.name} ${p.tagline} ${p.stack.join(' ')} ${p.category}`,
      group: 'Projects',
      icon: 'project',
      action: { type: 'quicklook', kind: 'project', ref: p.id, title: p.name },
    })
  }

  collectFiles(homeFolder, [], items)
  collectFiles(trashFolder, ['Trash'], items)

  for (const c of COMMANDS) {
    items.push({
      id: `cmd:${c.cmd}`,
      title: c.cmd,
      subtitle: c.desc,
      keywords: `terminal command shell ${c.cmd} ${c.desc}`,
      group: 'Terminal',
      icon: 'command',
      action: { type: 'terminal', command: c.cmd },
    })
  }

  for (const w of WALLPAPERS) {
    items.push({
      id: `wallpaper:${w.id}`,
      title: `Wallpaper: ${w.name}`,
      subtitle: 'Appearance setting',
      keywords: `wallpaper background theme appearance ${w.name} setting`,
      group: 'Settings',
      icon: 'settings',
      action: { type: 'settings' },
    })
  }

  return items
}

/** Curated picks shown before the user types anything. */
const SUGGESTED_IDS = [
  'app:terminal',
  'app:files',
  'folder:Projects',
  'project:insidcode',
  'app:ai',
  'app:settings',
]

/* ------------------------------------------------------------------ fuzzy */

function fuzzyScore(query: string, target: string): number {
  const q = query.toLowerCase()
  const t = target.toLowerCase()
  if (q.length === 0 || t.length === 0) return -1
  let ti = 0
  let score = 0
  for (let qi = 0; qi < q.length; qi++) {
    const idx = t.indexOf(q[qi], ti)
    if (idx === -1) return -1
    const boundary = idx === 0 || t[idx - 1] === ' ' || t[idx - 1] === '-' || t[idx - 1] === '/' || t[idx - 1] === ':'
    score += boundary ? 3 : 1
    if (idx === ti) score += 2
    ti = idx + 1
  }
  // shorter targets rank a little higher
  score -= t.length * 0.02
  return score
}

const GROUP_ORDER: Group[] = ['Applications', 'Folders', 'Projects', 'Files', 'Terminal', 'Settings']

function search(items: SpotItem[], query: string): { group: Group; items: SpotItem[] }[] {
  const q = query.trim()
  if (q === '') {
    const byId = new Map(items.map((i) => [i.id, i]))
    const picked = SUGGESTED_IDS.map((id) => byId.get(id)).filter((i): i is SpotItem => !!i)
    return picked.length > 0 ? [{ group: 'Applications', items: picked }] : []
  }
  const groups: { group: Group; items: SpotItem[] }[] = []
  for (const group of GROUP_ORDER) {
    const scored = items
      .filter((i) => i.group === group)
      .map((i) => ({ item: i, score: fuzzyScore(q, `${i.title} ${i.keywords}`) }))
      .filter((s) => s.score >= 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
    if (scored.length > 0) groups.push({ group, items: scored.map((s) => s.item) })
  }
  return groups
}

/* ------------------------------------------------------------------ icons */

function SpotIcon({ icon, light = false }: { icon: string; light?: boolean }) {
  const cls = light ? 'text-white' : 'text-neutral-600'
  switch (icon) {
    case 'files':
    case 'folder':
      return <Folder size={16} className={cls} />
    case 'terminal':
    case 'command':
      return <SquareTerminal size={16} className={cls} />
    case 'web':
      return <Globe size={16} className={cls} />
    case 'messages':
      return <MessageCircle size={16} className={cls} />
    case 'notes':
      return <NotebookPen size={16} className={cls} />
    case 'ai':
      return <Sparkles size={16} className={cls} />
    case 'insidcode':
      return <Swords size={16} className={cls} />
    case 'settings':
      return <Settings2 size={16} className={cls} />
    case 'about':
      return <Info size={16} className={cls} />
    case 'text':
      return <FileText size={16} className={cls} />
    case 'image':
      return <ImageIcon size={16} className={cls} />
    case 'project':
      return <Code2 size={16} className={cls} />
    case 'contact':
      return <Mail size={16} className={cls} />
    default:
      return <Search size={16} className={cls} />
  }
}

/* ------------------------------------------------------------------ view */

export default function Spotlight() {
  const { openApp } = useWindows()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const items = useMemo(buildIndex, [])
  const groups = useMemo(() => search(items, query), [items, query])
  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups])

  // Menu-bar icon opens it; Cmd+Space / Ctrl+Space toggles it.
  useEffect(() => {
    const off = onSpotlightOpen(() => {
      setQuery('')
      setActive(0)
      setOpen(true)
    })
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.code === 'Space') {
        e.preventDefault()
        setOpen((v) => {
          if (!v) {
            setQuery('')
            setActive(0)
          }
          return !v
        })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      off()
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  useEffect(() => {
    if (open) {
      const raf = requestAnimationFrame(() => inputRef.current?.focus())
      return () => cancelAnimationFrame(raf)
    }
  }, [open ])

  useEffect(() => {
    setActive(0)
  }, [query])

  // Keep the highlighted row in view while arrowing through results.
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-spot-idx="${active}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const runItem = (item: SpotItem) => {
    const a = item.action
    switch (a.type) {
      case 'app':
        openApp(a.app)
        break
      case 'folder':
        openApp('files', { folderPath: a.path })
        break
      case 'quicklook':
        openApp('quicklook', { quickLook: { kind: a.kind, ref: a.ref, title: a.title } })
        break
      case 'terminal':
        openApp('terminal')
        dispatchTerminalCommand(a.command)
        break
      case 'settings':
        openApp('settings')
        break
    }
    setOpen(false)
  }

  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, flat.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === 'Enter') {
      const item = flat[active]
      if (item) runItem(item)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  let rowIdx = -1

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[400]">
          <motion.div
            className="absolute inset-0 bg-black/25"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setOpen(false)}
          />
          <motion.div
            className="absolute w-[min(620px,92vw)]"
            style={{ left: '50%' }}
            initial={{ x: '-50%', y: -12, scale: 0.97, opacity: 0 }}
            animate={{ x: '-50%', y: 0, scale: 1, opacity: 1 }}
            exit={{ x: '-50%', y: -8, scale: 0.98, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 480, damping: 34 }}
          >
            <div className="mt-[14vh] overflow-hidden rounded-2xl border border-black/10 bg-white/80 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
              {/* Search field */}
              <div className="flex items-center gap-3 border-b border-black/[0.07] px-5 py-4">
                <Search size={19} className="shrink-0 text-neutral-400" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onInputKey}
                  placeholder="Spotlight Search"
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  className="min-w-0 flex-1 bg-transparent text-[19px] font-normal text-neutral-900 outline-none placeholder:text-neutral-400"
                  aria-label="Spotlight search"
                />
              </div>

              {/* Results */}
              <div ref={listRef} className="max-h-[46vh] overflow-y-auto py-2">
                {flat.length === 0 && (
                  <div className="px-5 py-8 text-center text-[13.5px] text-neutral-400">
                    No results. Try an app, folder, file, project, or terminal command.
                  </div>
                )}
                {groups.map((g) => (
                  <div key={g.group}>
                    <div className="px-5 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                      {query.trim() === '' ? 'Suggestions' : g.group}
                    </div>
                    {g.items.map((item) => {
                      rowIdx += 1
                      const idx = rowIdx
                      const isActive = idx === active
                      return (
                        <button
                          key={item.id}
                          data-spot-idx={idx}
                          onClick={() => runItem(item)}
                          onMouseMove={() => setActive(idx)}
                          className={`flex w-full items-center gap-3 px-5 py-2 text-left transition-colors ${
                            isActive ? 'bg-[#0a84ff]' : 'bg-transparent'
                          }`}
                        >
                          <span
                            className={`flex size-8 shrink-0 items-center justify-center rounded-[9px] ${
                              isActive ? 'bg-white/25' : 'bg-black/[0.05]'
                            }`}
                          >
                            <SpotIcon icon={item.icon} light={isActive} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span
                              className={`block truncate text-[14px] ${
                                isActive ? 'text-white' : 'text-neutral-900'
                              }`}
                            >
                              {item.title}
                            </span>
                            <span
                              className={`block truncate text-[12px] ${
                                isActive ? 'text-white/80' : 'text-neutral-500'
                              }`}
                            >
                              {item.subtitle}
                            </span>
                          </span>
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>

              {/* Footer hints */}
              <div className="flex items-center gap-4 border-t border-black/[0.07] px-5 py-2.5 text-[11.5px] text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <Kbd>↵</Kbd> open
                </span>
                <span className="flex items-center gap-1.5">
                  <Kbd>esc</Kbd> close
                </span>
                <span className="flex items-center gap-1.5">
                  <Kbd>↑↓</Kbd> navigate
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded border border-black/10 bg-black/[0.04] px-1.5 py-0.5 font-mono text-[10.5px] text-neutral-500">
      {children}
    </span>
  )
}
