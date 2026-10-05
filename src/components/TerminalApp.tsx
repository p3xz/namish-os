import { useEffect, useRef, useState } from 'react'
import { useWindows } from '@/os/WindowManager'
import { onTerminalCommand, takePendingTerminalCommand } from '@/os/spotlightBus'
import { useAppearance, type TerminalTheme } from '@/os/Appearance'
import { findFolderByName, homeFolder } from '@/os/filesystem'
import { experience, profile, projects, skillGroups } from '@/data/portfolio'

type Tone = 'default' | 'muted' | 'success' | 'info' | 'error'

interface Line {
  kind: 'in' | 'out'
  text: string
  tone: Tone
}

interface TerminalPalette {
  bg: string
  text: string
  caret: string
  promptUser: string
  promptPath: string
  promptMark: string
  tones: Record<Tone, string>
}

const TERMINAL_PALETTES: Record<TerminalTheme, TerminalPalette> = {
  dark: {
    bg: 'bg-[#101014]/95',
    text: 'text-zinc-100',
    caret: 'caret-emerald-300',
    promptUser: 'text-emerald-300',
    promptPath: 'text-zinc-400',
    promptMark: 'text-zinc-100',
    tones: {
      default: 'text-zinc-100',
      muted: 'text-zinc-400',
      success: 'text-emerald-300',
      info: 'text-cyan-300',
      error: 'text-rose-300',
    },
  },
  light: {
    bg: 'bg-[#f7f7f5]',
    text: 'text-zinc-800',
    caret: 'caret-emerald-600',
    promptUser: 'text-emerald-600',
    promptPath: 'text-zinc-500',
    promptMark: 'text-zinc-800',
    tones: {
      default: 'text-zinc-800',
      muted: 'text-zinc-500',
      success: 'text-emerald-600',
      info: 'text-sky-600',
      error: 'text-rose-600',
    },
  },
  phosphor: {
    bg: 'bg-black',
    text: 'text-[#4ade80]',
    caret: 'caret-[#4ade80]',
    promptUser: 'text-[#86efac]',
    promptPath: 'text-[#2e7d32]',
    promptMark: 'text-[#4ade80]',
    tones: {
      default: 'text-[#4ade80]',
      muted: 'text-[#2e7d32]',
      success: 'text-[#bbf7d0]',
      info: 'text-[#6ee7b7]',
      error: 'text-[#f87171]',
    },
  },
}

const PROMPT_USER = 'namish@namishos'
const PROMPT_PATH = '~'

// Marked when this module first loads, so sysinfo can report session uptime.
const SESSION_START = Date.now()

const SYSINFO_LOGO = [
  'N      N',
  'NN     N',
  'N N    N',
  'N  N   N',
  'N   N  N',
  'N    N N',
  'N     NN',
  'N      N',
]

const TERMINAL_COMMANDS = [
  'help', 'whoami', 'about', 'projects', 'skills', 'experience',
  'contact', 'open', 'echo', 'date', 'theme', 'sysinfo', 'clear', 'exit', 'sudo',
]

export const TERMINAL_THEMES: TerminalTheme[] = ['dark', 'light', 'phosphor']

function formatUptime(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000))
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  const secs = s % 60
  if (d > 0) return `${d}d ${h}h ${m}m`
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${secs}s`
  return `${secs}s`
}

const HELP: Line[] = [
  { kind: 'out', text: 'Available commands:', tone: 'muted' },
  { kind: 'out', text: '  help         Show this list', tone: 'default' },
  { kind: 'out', text: '  whoami       Who is logged in', tone: 'default' },
  { kind: 'out', text: '  about        Short bio', tone: 'default' },
  { kind: 'out', text: '  projects     List projects', tone: 'default' },
  { kind: 'out', text: '  skills       List skills', tone: 'default' },
  { kind: 'out', text: '  experience   Work experience', tone: 'default' },
  { kind: 'out', text: '  contact      Where to find Namish', tone: 'default' },
  { kind: 'out', text: '  open <name>  Open a folder (try: projects)', tone: 'default' },
  { kind: 'out', text: '  echo <text>  Say something back', tone: 'default' },
  { kind: 'out', text: '  date         Current date and time', tone: 'default' },
  { kind: 'out', text: '  theme <name> Switch terminal theme (dark, light, phosphor)', tone: 'default' },
  { kind: 'out', text: '  sysinfo      System information (neofetch-style)', tone: 'default' },
  { kind: 'out', text: '  clear        Clear the screen', tone: 'default' },
  { kind: 'out', text: '  exit         Close this terminal', tone: 'default' },
  { kind: 'out', text: 'Tip: press Tab to autocomplete command and folder names.', tone: 'muted' },
]

const WELCOME: Line[] = [
  { kind: 'out', text: 'NamishOS Terminal (zsh)', tone: 'success' },
  { kind: 'out', text: 'Type "help" to see what I can do.', tone: 'muted' },
  { kind: 'out', text: 'Press Tab to autocomplete commands and folder names.', tone: 'muted' },
]

function commonPrefix(a: string, b: string): string {
  let i = 0
  while (i < a.length && i < b.length && a[i].toLowerCase() === b[i].toLowerCase()) i++
  return a.slice(0, i)
}

interface Completion {
  base: string
  fragment: string
  candidates: string[]
}

/** zsh-style candidates: command names on the first token, folder names after `open`. */
function completionFor(input: string): Completion | null {
  if (/\s/.test(input)) {
    const first = input.split(/\s+/)[0]
    if (first.toLowerCase() !== 'open') return null
    const lastSpace = input.lastIndexOf(' ')
    const base = input.slice(0, lastSpace + 1)
    const fragment = input.slice(lastSpace + 1)
    const folders = [
      homeFolder.name,
      'Trash',
      ...homeFolder.children.filter((c) => c.type === 'folder').map((c) => c.name),
    ]
    const candidates = folders.filter((f) => f.toLowerCase().startsWith(fragment.toLowerCase()))
    return { base, fragment, candidates }
  }
  const candidates = TERMINAL_COMMANDS.filter((c) => c.startsWith(input.toLowerCase()))
  return { base: '', fragment: input, candidates }
}

function Prompt({ palette }: { palette: TerminalPalette }) {
  return (
    <span className="shrink-0 select-none">
      <span className={`font-semibold ${palette.promptUser}`}>{PROMPT_USER}</span>
      <span className={palette.promptPath}> {PROMPT_PATH} </span>
      <span className={palette.promptMark}>%</span>
      <span className={palette.promptMark}>&nbsp;</span>
    </span>
  )
}

export default function TerminalApp({ winId }: { winId: string }) {
  const { openApp, closeWindow } = useWindows()
  const { terminalTheme, setTerminalTheme } = useAppearance()
  const palette = TERMINAL_PALETTES[terminalTheme]
  const [lines, setLines] = useState<Line[]>(WELCOME)
  const [value, setValue] = useState('')
  const historyRef = useRef<string[]>([])
  const histPos = useRef(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  /** Input value at the last ambiguous Tab press; a second Tab on the same value lists candidates. */
  const lastAmbiguousTab = useRef('')

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const push = (newLines: Line | Line[]) => {
    const arr = Array.isArray(newLines) ? newLines : [newLines]
    setLines((prev) => [...prev, ...arr])
  }

  const out = (text: string, tone: Tone = 'default'): Line => ({ kind: 'out', text, tone })

  const sysinfoLines = (): Line[] => {
    const info = [
      'OS: NamishOS 26 "Nebula"',
      'Host: NamishHD',
      'Kernel: browser-native',
      `Uptime: ${formatUptime(Date.now() - SESSION_START)}`,
      'Shell: zsh (web edition)',
      `Terminal: ${terminalTheme} theme`,
      typeof window !== 'undefined'
        ? `Resolution: ${window.innerWidth}x${window.innerHeight}`
        : 'Resolution: unknown',
      `Projects: ${projects.length}`,
      `Commands: ${TERMINAL_COMMANDS.length}`,
    ]
    const width = Math.max(...SYSINFO_LOGO.map((l) => l.length))
    const rows: Line[] = [
      out('namish@namishos', 'success'),
      out('─'.repeat('namish@namishos'.length), 'muted'),
    ]
    for (let i = 0; i < Math.max(SYSINFO_LOGO.length, info.length); i++) {
      const logo = (SYSINFO_LOGO[i] ?? '').padEnd(width)
      const text = info[i] === undefined ? logo : `${logo}   ${info[i]}`
      rows.push(out(text, 'info'))
    }
    return rows
  }

  const run = (raw: string) => {
    const cmd = raw.trim()
    push({ kind: 'in', text: cmd, tone: 'default' })
    if (cmd === '') return
    historyRef.current.push(cmd)
    histPos.current = -1

    const [name, ...rest] = cmd.split(/\s+/)
    const arg = rest.join(' ')
    const lc = name.toLowerCase()

    switch (lc) {
      case 'help':
        push(HELP)
        break
      case 'whoami':
        push(out('namish', 'success'))
        break
      case 'about':
        push([
          out(profile.name, 'success'),
          out(profile.tagline, 'info'),
          out('', 'default'),
          out(profile.bio, 'muted'),
        ])
        break
      case 'projects':
        push([
          out('Projects:', 'muted'),
          ...projects.flatMap((p): Line[] => [
            out(`  ${p.name}: ${p.tagline}`, 'default'),
            out(`    ${p.stack.join(' · ')}  (${p.year}, ${p.category})`, 'muted'),
          ]),
        ])
        break
      case 'skills':
        push([
          out('Skills:', 'muted'),
          ...skillGroups.flatMap((g): Line[] => [out(`  ${g.title}: ${g.skills.join(', ')}`, 'default')]),
        ])
        break
      case 'experience':
        push([
          out('Experience:', 'muted'),
          ...experience.map((e): Line => out(`  ${e.role} @ ${e.company} (${e.year})`, 'default')),
        ])
        break
      case 'contact':
        push([
          out('Find Namish at:', 'muted'),
          out(`  Email    ${profile.email}`, 'default'),
          out(`  GitHub   ${profile.github}`, 'info'),
          out(`  X        ${profile.x}`, 'info'),
          out(`  Website  ${profile.website}`, 'info'),
        ])
        break
      case 'open': {
        if (!arg) {
          push(out('Usage: open <folder>  (about me, projects, experience, skills, contact, trash)', 'error'))
          break
        }
        const found = findFolderByName(arg)
        if (found) {
          const label = found.length === 0 ? 'Home' : found[found.length - 1]
          openApp('files', { folderPath: found })
          push(out(`Opened ${label}.`, 'success'))
        } else {
          push(out(`No folder named "${arg}". Try: about me, projects, experience, skills, contact, trash.`, 'error'))
        }
        break
      }
      case 'echo':
        push(out(arg, 'default'))
        break
      case 'date':
        push(out(new Date().toString(), 'default'))
        break
      case 'theme': {
        const wanted = arg.toLowerCase() as TerminalTheme
        if (TERMINAL_THEMES.includes(wanted)) {
          setTerminalTheme(wanted)
          push(out(`Terminal theme set to ${wanted}.`, 'success'))
        } else {
          push(out(`Usage: theme <dark|light|phosphor>  (current: ${terminalTheme})`, 'error'))
        }
        break
      }
      case 'sysinfo':
        push(sysinfoLines())
        break
      case 'clear':
        setLines([])
        break
      case 'exit':
        closeWindow(winId)
        break
      case 'sudo':
        push(out('Nice try. Namish already has root access to his own life.', 'error'))
        break
      default:
        push(out(`zsh: command not found: ${name}`, 'error'))
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      run(value)
      setValue('')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const h = historyRef.current
      if (h.length === 0) return
      const next = histPos.current === -1 ? h.length - 1 : Math.max(0, histPos.current - 1)
      histPos.current = next
      setValue(h[next])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const h = historyRef.current
      if (histPos.current === -1) return
      const next = histPos.current + 1
      if (next >= h.length) {
        histPos.current = -1
        setValue('')
      } else {
        histPos.current = next
        setValue(h[next])
      }
    } else if (e.key === 'Tab') {
      e.preventDefault()
      const el = inputRef.current
      if (el && (el.selectionStart ?? value.length) !== value.length) return
      const comp = completionFor(value)
      if (!comp || comp.candidates.length === 0) return
      const { base, fragment, candidates } = comp
      if (candidates.length === 1) {
        setValue(base + candidates[0] + (base === '' ? ' ' : ''))
        lastAmbiguousTab.current = ''
      } else {
        const cp = candidates.reduce(commonPrefix)
        if (cp.length > fragment.length) {
          setValue(base + cp)
          lastAmbiguousTab.current = ''
        } else if (lastAmbiguousTab.current === value) {
          push({ kind: 'in', text: value, tone: 'default' })
          push(out(`  ${candidates.join('   ')}`, 'muted'))
          lastAmbiguousTab.current = ''
        } else {
          lastAmbiguousTab.current = value
        }
      }
    }
  }

  // Spotlight can ask the terminal to run a command by name.
  const runRef = useRef(run)
  runRef.current = run
  useEffect(() => {
    const off = onTerminalCommand((cmd) => runRef.current(cmd))
    const pending = takePendingTerminalCommand()
    if (pending) runRef.current(pending)
    return off
  }, [])

  return (
    <div
      className={`selectable relative flex min-h-0 flex-1 flex-col ${palette.bg} ${
        terminalTheme === 'phosphor' ? 'terminal-phosphor' : ''
      }`}
      onClick={() => inputRef.current?.focus()}
    >
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-3 font-mono text-[13px] leading-[1.55]">
        {lines.map((l, i) =>
          l.kind === 'in' ? (
            <div key={i} className="flex whitespace-pre-wrap break-words">
              <Prompt palette={palette} />
              <span className={palette.text}>{l.text}</span>
            </div>
          ) : (
            <div key={i} className={`whitespace-pre-wrap break-words ${palette.tones[l.tone]}`}>
              {l.text === '' ? '\u00a0' : l.text}
            </div>
          ),
        )}
        <div className="flex items-center">
          <Prompt palette={palette} />
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            className={`min-w-0 flex-1 bg-transparent font-mono text-[13px] ${palette.text} ${palette.caret} outline-none`}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label="Terminal input"
          />
        </div>
      </div>
    </div>
  )
}
