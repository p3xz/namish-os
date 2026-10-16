import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ArrowUpRight, AtSign, Check, Code2, Globe, Search, Share2 } from 'lucide-react'
import { quickLinks } from '@/data/portfolio'

const ICONS: Record<string, typeof Globe> = {
  github: Code2,
  x: AtSign,
  insidcode: Globe,
  portfolio: Share2,
}

type EngineId = 'google' | 'duckduckgo' | 'bing'

const ENGINES: Record<EngineId, { label: string; searchUrl: (q: string) => string }> = {
  google: {
    label: 'Google',
    searchUrl: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
  },
  duckduckgo: {
    label: 'DuckDuckGo',
    searchUrl: (q) => `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
  },
  bing: {
    label: 'Bing',
    searchUrl: (q) => `https://www.bing.com/search?q=${encodeURIComponent(q)}`,
  },
}

const ENGINE_KEY = 'namishos-web-engine'

function isEngineId(value: string): value is EngineId {
  return value === 'google' || value === 'duckduckgo' || value === 'bing'
}

function loadEngine(): EngineId {
  try {
    const stored = window.localStorage.getItem(ENGINE_KEY)
    if (stored && isEngineId(stored)) return stored
  } catch {
    // localStorage unavailable, fall back to the default engine
  }
  return 'google'
}

/** True when the input looks like a URL rather than a search query. */
function looksLikeUrl(input: string): boolean {
  if (/^https?:\/\//i.test(input)) return true
  return /^[^\s]+\.[^\s]{2,}$/.test(input) && !input.includes('..')
}

function resolveDestination(input: string, engine: EngineId): string {
  const trimmed = input.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (looksLikeUrl(trimmed)) return `https://${trimmed}`
  return ENGINES[engine].searchUrl(trimmed)
}

export default function WebApp() {
  const [query, setQuery] = useState('')
  const [engine, setEngine] = useState<EngineId>(loadEngine)
  const [notice, setNotice] = useState<string | null>(null)
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    try {
      window.localStorage.setItem(ENGINE_KEY, engine)
    } catch {
      // localStorage unavailable, engine choice just won't persist
    }
  }, [engine])

  useEffect(() => {
    return () => {
      if (noticeTimer.current) clearTimeout(noticeTimer.current)
    }
  }, [])

  function showNotice(message: string) {
    setNotice(message)
    if (noticeTimer.current) clearTimeout(noticeTimer.current)
    noticeTimer.current = setTimeout(() => setNotice(null), 4000)
  }

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    const url = resolveDestination(trimmed, engine)
    const opened = window.open(url, '_blank', 'noopener,noreferrer')
    if (!opened) {
      showNotice('Popup blocked. Allow popups for this site to open search results.')
      return
    }
    showNotice(
      looksLikeUrl(trimmed)
        ? `Opened ${trimmed} in a new tab.`
        : `Opened ${ENGINES[engine].label} results for "${trimmed}" in a new tab.`,
    )
    setQuery('')
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <form
        onSubmit={handleSearch}
        className="flex h-12 shrink-0 items-center gap-2 border-b border-black/10 bg-[#f6f6f8] px-4"
      >
        <Search size={16} className="shrink-0 text-neutral-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the web or enter an address"
          aria-label="Search the web or enter an address"
          className="min-w-0 flex-1 bg-transparent text-[12.5px] text-neutral-800 outline-none placeholder:text-neutral-400"
        />
        <label className="sr-only" htmlFor="web-search-engine">
          Search engine
        </label>
        <select
          id="web-search-engine"
          value={engine}
          onChange={(e) => {
            if (isEngineId(e.target.value)) setEngine(e.target.value)
          }}
          className="shrink-0 cursor-pointer rounded-full bg-black/[0.06] px-2 py-1 text-[12px] text-neutral-600 outline-none"
        >
          {(Object.keys(ENGINES) as EngineId[]).map((id) => (
            <option key={id} value={id}>
              {ENGINES[id].label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={!query.trim()}
          className="shrink-0 rounded-full bg-neutral-900 px-3 py-1 text-[12px] font-medium text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Search
        </button>
      </form>
      {notice && (
        <div className="flex shrink-0 items-center gap-1.5 border-b border-black/10 bg-emerald-50 px-4 py-1.5 text-[12px] text-emerald-700">
          <Check size={14} className="shrink-0" />
          <span className="truncate">{notice}</span>
        </div>
      )}
      <div className="grid flex-1 content-start grid-cols-2 gap-3 overflow-y-auto p-5">
        {quickLinks.map((l) => {
          const Icon = ICONS[l.id] ?? Globe
          return (
            <a
              key={l.id}
              href={l.url}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-3 rounded-2xl border border-black/10 bg-black/[0.02] p-4 transition-all hover:scale-[1.02] hover:bg-black/[0.05]"
            >
              <div
                className="flex size-11 shrink-0 items-center justify-center rounded-xl text-white shadow-md"
                style={{ backgroundColor: l.hue }}
              >
                <Icon size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 text-[14px] font-semibold text-neutral-900">
                  {l.name}
                  <ArrowUpRight
                    size={14}
                    className="text-neutral-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </div>
                <div className="truncate text-[12px] text-neutral-500">{l.detail}</div>
              </div>
            </a>
          )
        })}
      </div>
      <p className="shrink-0 border-t border-black/10 bg-[#f6f6f8] px-5 py-3 text-[11.5px] text-neutral-400">
        Searches, addresses, and quick links open in a new tab. This is a start page, not a real browser.
      </p>
    </div>
  )
}
