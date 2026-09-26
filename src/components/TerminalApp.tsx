import { useEffect, useRef, useState } from 'react'
import { useWindows } from '@/os/WindowManager'
import { onTerminalCommand, takePendingTerminalCommand } from '@/os/spotlightBus'
import { findFolderByName } from '@/os/filesystem'
import { experience, profile, projects, skillGroups } from '@/data/portfolio'

type Tone = 'default' | 'muted' | 'success' | 'info' | 'error'

interface Line {
  kind: 'in' | 'out'
  text: string
  tone: Tone
}

const toneClass: Record<Tone, string> = {
  default: 'text-zinc-100',
  muted: 'text-zinc-400',
  success: 'text-emerald-300',
  info: 'text-cyan-300',
  error: 'text-rose-300',
}

const PROMPT_USER = 'namish@namishos'
const PROMPT_PATH = '~'

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
  { kind: 'out', text: '  clear        Clear the screen', tone: 'default' },
  { kind: 'out', text: '  exit         Close this terminal', tone: 'default' },
]

const WELCOME: Line[] = [
  { kind: 'out', text: 'NamishOS Terminal (zsh)', tone: 'success' },
  { kind: 'out', text: 'Type "help" to see what I can do.', tone: 'muted' },
]

function Prompt() {
  return (
    <span className="shrink-0 select-none">
      <span className="font-semibold text-emerald-300">{PROMPT_USER}</span>
      <span className="text-zinc-400"> {PROMPT_PATH} </span>
      <span className="text-zinc-100">%</span>
      <span className="text-zinc-100">&nbsp;</span>
    </span>
  )
}

export default function TerminalApp({ winId }: { winId: string }) {
  const { openApp, closeWindow } = useWindows()
  const [lines, setLines] = useState<Line[]>(WELCOME)
  const [value, setValue] = useState('')
  const historyRef = useRef<string[]>([])
  const histPos = useRef(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

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
      className="selectable flex min-h-0 flex-1 flex-col bg-[#101014]/95"
      onClick={() => inputRef.current?.focus()}
    >
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-3 font-mono text-[13px] leading-[1.55]">
        {lines.map((l, i) =>
          l.kind === 'in' ? (
            <div key={i} className="flex whitespace-pre-wrap break-words">
              <Prompt />
              <span className="text-zinc-100">{l.text}</span>
            </div>
          ) : (
            <div key={i} className={`whitespace-pre-wrap break-words ${toneClass[l.tone]}`}>
              {l.text === '' ? '\u00a0' : l.text}
            </div>
          ),
        )}
        <div className="flex items-center">
          <Prompt />
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            className="min-w-0 flex-1 bg-transparent font-mono text-[13px] text-zinc-100 caret-emerald-300 outline-none"
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
