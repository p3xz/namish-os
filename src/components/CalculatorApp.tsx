import { useCallback, useEffect, useRef, useState } from 'react'
import { useWindows } from '@/os/WindowManager'

/* ------------------------------------------------------------------ math */

type Op = '+' | '−' | '×' | '÷'
type Token = number | Op

const PRETTY: Record<string, string> = { '*': '×', '/': '÷', '-': '−' }

function evaluate(tokens: Token[]): number {
  const vals: number[] = []
  const ops: Op[] = []
  for (const t of tokens) {
    if (typeof t === 'number') vals.push(t)
    else ops.push(t)
  }
  // First pass: multiplication and division, left to right.
  const v2: number[] = [vals[0]]
  const o2: Op[] = []
  for (let i = 0; i < ops.length; i++) {
    const op = ops[i]
    if (op === '×' || op === '÷') {
      const b = vals[i + 1]
      const a = v2.pop() as number
      v2.push(op === '×' ? a * b : a / b)
    } else {
      o2.push(op)
      v2.push(vals[i + 1])
    }
  }
  // Second pass: addition and subtraction.
  let r = v2[0]
  for (let i = 0; i < o2.length; i++) {
    r = o2[i] === '+' ? r + v2[i + 1] : r - v2[i + 1]
  }
  return r
}

function format(n: number): string {
  if (!Number.isFinite(n) || Number.isNaN(n)) return 'Error'
  const rounded = parseFloat(n.toPrecision(9))
  return String(rounded)
}

function parseEntry(s: string): number {
  if (s === '' || s === '-' || s === '.' || s === '-.') return 0
  const n = Number(s)
  return Number.isNaN(n) ? 0 : n
}

/* ------------------------------------------------------------------ state */

interface CalcState {
  /** The number currently being typed. '' means nothing typed yet. */
  entry: string
  /** Completed tokens, always ends with an Op when entry is ''. */
  tokens: Token[]
  /** True right after '=': the display shows a finished result. */
  freshResult: boolean
  /** Remembers the last binary operation for repeated '='. */
  repeat: { op: Op; operand: number } | null
  /** Which operator button is highlighted as pending. */
  pendingOp: Op | null
}

const INITIAL: CalcState = { entry: '', tokens: [], freshResult: false, repeat: null, pendingOp: null }

const MAX_LEN = 12

/* ------------------------------------------------------------------ view */

interface KeyDef {
  label: string
  kind: 'digit' | 'fn' | 'op'
  span?: boolean
  action: 'digit' | 'dot' | 'op' | 'equals' | 'clear' | 'negate' | 'percent' | 'backspace'
  value?: string
}

export default function CalculatorApp({ winId }: { winId: string }) {
  const { topWindow } = useWindows()
  const [state, setState] = useState<CalcState>(INITIAL)
  const topWindowRef = useRef<string | null>(null)
  topWindowRef.current = topWindow?.id ?? null
  const focused = topWindow?.id === winId

  const press = useCallback((key: KeyDef) => {
    setState((s) => {
      const startFresh = s.freshResult && (key.action === 'digit' || key.action === 'dot')
      let { entry, tokens, repeat, pendingOp } = startFresh
        ? { ...INITIAL, repeat: s.repeat }
        : { ...s }

      switch (key.action) {
        case 'digit': {
          const d = key.value as string
          if (entry.replace(/[-.]/g, '').length >= MAX_LEN) return s
          if (entry === '0') entry = d
          else if (entry === '-0') entry = `-${d}`
          else entry += d
          pendingOp = null
          return { entry, tokens, freshResult: false, repeat, pendingOp }
        }
        case 'dot': {
          if (!entry.includes('.')) {
            if (entry === '' || entry === '-') entry += '0.'
            else entry += '.'
          }
          pendingOp = null
          return { entry, tokens, freshResult: false, repeat, pendingOp }
        }
        case 'op': {
          const op = key.value as Op
          if (entry !== '' && entry !== '-') {
            tokens = [...tokens, parseEntry(entry), op]
            entry = ''
          } else if (tokens.length > 0 && typeof tokens[tokens.length - 1] !== 'number') {
            tokens = [...tokens.slice(0, -1), op]
          } else if (op === '−' && entry === '') {
            entry = '-'
            return { entry, tokens, freshResult: false, repeat, pendingOp: null }
          }
          return { entry, tokens, freshResult: false, repeat, pendingOp: op }
        }
        case 'equals': {
          let list = [...tokens]
          if (entry !== '' && entry !== '-') {
            list = [...list, parseEntry(entry)]
          } else if (list.length > 0 && typeof list[list.length - 1] !== 'number') {
            list = list.slice(0, -1)
          }
          if (list.length === 0) {
            // Repeated '=' with no new input replays the last operation.
            if (repeat) {
              const r = repeat.op === '+' ? parseEntry(entry) + repeat.operand
                : repeat.op === '−' ? parseEntry(entry) - repeat.operand
                : repeat.op === '×' ? parseEntry(entry) * repeat.operand
                : parseEntry(entry) / repeat.operand
              return { entry: format(r), tokens: [], freshResult: true, repeat, pendingOp: null }
            }
            return s
          }
          const result = evaluate(list)
          const lastOpIdx = list.length - 2
          const newRepeat =
            typeof list[lastOpIdx] !== 'number' && lastOpIdx >= 0
              ? { op: list[lastOpIdx] as Op, operand: list[list.length - 1] as number }
              : repeat
          return { entry: format(result), tokens: [], freshResult: true, repeat: newRepeat, pendingOp: null }
        }
        case 'clear':
          return INITIAL
        case 'negate': {
          if (entry !== '' && entry !== 'Error') {
            entry = entry.startsWith('-') ? entry.slice(1) : `-${entry}`
          }
          return { entry, tokens, freshResult: s.freshResult, repeat, pendingOp }
        }
        case 'percent': {
          if (entry !== '' && entry !== 'Error' && entry !== '-') {
            entry = format(parseEntry(entry) / 100)
          }
          return { entry, tokens, freshResult: s.freshResult, repeat, pendingOp }
        }
        case 'backspace': {
          if (s.freshResult || entry === 'Error') return s
          entry = entry.slice(0, -1)
          return { entry, tokens, freshResult: false, repeat, pendingOp }
        }
      }
    })
  }, [])

  /* Keyboard support: digits, operators, Enter, Backspace, Esc. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (topWindowRef.current !== winId) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const k = e.key
      let key: KeyDef | null = null
      if (/^[0-9]$/.test(k)) key = { label: k, kind: 'digit', action: 'digit', value: k }
      else if (k === '.' || k === ',') key = { label: '.', kind: 'digit', action: 'dot' }
      else if (k === '+' || k === '-' || k === '*' || k === '/')
        key = { label: PRETTY[k] ?? k, kind: 'op', action: 'op', value: (PRETTY[k] ?? k) as Op }
      else if (k === 'Enter' || k === '=') key = { label: '=', kind: 'op', action: 'equals' }
      else if (k === 'Backspace') key = { label: 'back', kind: 'fn', action: 'backspace' }
      else if (k === 'Escape') key = { label: 'C', kind: 'fn', action: 'clear' }
      else if (k === '%') key = { label: '%', kind: 'fn', action: 'percent' }
      if (key) {
        e.preventDefault()
        press(key)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [winId, press])

  const { entry, tokens, pendingOp } = state
  const display = entry === '' ? (state.freshResult ? entry : '0') : entry
  const expr = tokens
    .map((t) => (typeof t === 'number' ? String(format(t)) : ` ${t} `))
    .join('')
    .trim()

  const ROWS: KeyDef[][] = [
    [
      { label: 'C', kind: 'fn', action: 'clear' },
      { label: '+/−', kind: 'fn', action: 'negate' },
      { label: '%', kind: 'fn', action: 'percent' },
      { label: '÷', kind: 'op', action: 'op', value: '÷' },
    ],
    [
      { label: '7', kind: 'digit', action: 'digit', value: '7' },
      { label: '8', kind: 'digit', action: 'digit', value: '8' },
      { label: '9', kind: 'digit', action: 'digit', value: '9' },
      { label: '×', kind: 'op', action: 'op', value: '×' },
    ],
    [
      { label: '4', kind: 'digit', action: 'digit', value: '4' },
      { label: '5', kind: 'digit', action: 'digit', value: '5' },
      { label: '6', kind: 'digit', action: 'digit', value: '6' },
      { label: '−', kind: 'op', action: 'op', value: '−' },
    ],
    [
      { label: '1', kind: 'digit', action: 'digit', value: '1' },
      { label: '2', kind: 'digit', action: 'digit', value: '2' },
      { label: '3', kind: 'digit', action: 'digit', value: '3' },
      { label: '+', kind: 'op', action: 'op', value: '+' },
    ],
    [
      { label: '0', kind: 'digit', action: 'digit', value: '0', span: true },
      { label: '.', kind: 'digit', action: 'dot' },
      { label: '=', kind: 'op', action: 'equals' },
    ],
  ]

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#dcdce0]">
      {/* Display */}
      <div className="flex shrink-0 flex-col justify-end px-5 pb-2 pt-6 text-right">
        <div className="h-5 truncate text-[13px] font-medium text-neutral-500">
          {expr || '\u00a0'}
        </div>
        <div
          className="truncate text-[52px] font-light leading-tight tracking-tight text-neutral-900"
          style={{ fontVariantNumeric: 'tabular-nums' }}
          aria-live="polite"
        >
          {display}
        </div>
      </div>

      {/* Keypad */}
      <div className="grid flex-1 grid-cols-4 gap-px bg-black/25 p-px">
        {ROWS.flat().map((key) => {
          const isPending = key.kind === 'op' && key.value === pendingOp && key.action === 'op'
          const base =
            key.kind === 'op'
              ? isPending
                ? 'bg-white text-[#ff9f0a]'
                : 'bg-[#ff9f0a] text-white hover:bg-[#ffab2e] active:bg-[#f08c00]'
              : key.kind === 'fn'
                ? 'bg-[#c9c9d1] text-neutral-900 hover:bg-[#d4d4da] active:bg-[#bcbcc4]'
                : 'bg-[#e8e8ec] text-neutral-900 hover:bg-[#efeff2] active:bg-[#dcdce0]'
          return (
            <button
              key={`${key.label}-${key.action}-${key.value ?? ''}`}
              onClick={() => press(key)}
              tabIndex={-1}
              aria-label={key.label}
              className={`${base} flex items-center justify-center text-[22px] font-normal transition-colors ${
                key.span ? 'col-span-2' : ''
              }`}
            >
              {key.label}
            </button>
          )
        })}
      </div>

      {/* Keyboard hint */}
      <div className="shrink-0 bg-[#dcdce0] px-5 py-2 text-center text-[11px] text-neutral-500">
        {focused
          ? 'Keyboard live: 0-9 + - * / , Enter for =, Esc to clear'
          : 'Click the window, then type: 0-9 + - * / , Enter for =, Esc to clear'}
      </div>
    </div>
  )
}
