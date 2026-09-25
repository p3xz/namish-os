import { useEffect, useRef, useState } from 'react'
import { ArrowUp, AtSign, Code2, Globe, Mail, Share2 } from 'lucide-react'
import { profile } from '@/data/portfolio'

interface Message {
  id: number
  from: 'me' | 'namish'
  text: string
  time: string
}

const REPLIES = [
  'Nice to meet you. For anything real, email me at nam4sh@gmail.com, I reply fast.',
  'This demo inbox lives only in your browser, but my actual inbox is nam4sh@gmail.com.',
  'Good question for an email. Hit me at nam4sh@gmail.com and we can talk properly.',
  'In case you are here about work: I am an 18-year-old BCA student, open to internships.',
  'Noted. If it is about a project or internship, email is the fastest way to reach me: nam4sh@gmail.com.',
]

const now = () =>
  new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

const LINKS = [
  { label: 'Email', value: profile.email, href: `mailto:${profile.email}`, Icon: Mail },
  { label: 'GitHub', value: 'github.com/p3xz', href: profile.github, Icon: Code2 },
  { label: 'X', value: '@NamishYadavv', href: profile.x, Icon: AtSign },
  { label: 'InsidCode', value: 'insidcode.vercel.app', href: 'https://insidcode.vercel.app', Icon: Globe },
  { label: 'Portfolio', value: 'namishhh.vercel.app', href: profile.portfolio, Icon: Share2 },
]

export default function MessagesApp() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      from: 'namish',
      text: 'Hey, this is Namish\u2019s inbox. Say hi, I read everything.',
      time: now(),
    },
  ])
  const [draft, setDraft] = useState('')
  const [typing, setTyping] = useState(false)
  const idRef = useRef(1)
  const replyRef = useRef(0)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, typing])

  const send = () => {
    const text = draft.trim()
    if (!text || typing) return
    const id = idRef.current++
    setMessages((m) => [...m, { id, from: 'me', text, time: now() }])
    setDraft('')
    setTyping(true)
    const reply = REPLIES[replyRef.current % REPLIES.length]
    replyRef.current += 1
    window.setTimeout(() => {
      setMessages((m) => [...m, { id: idRef.current++, from: 'namish', text: reply, time: now() }])
      setTyping(false)
    }, 1100)
  }

  const last = messages[messages.length - 1]

  return (
    <div className="flex min-h-0 flex-1 bg-white text-neutral-800">
      {/* Conversation list */}
      <div className="flex w-56 shrink-0 flex-col border-r border-black/10 bg-[#f6f6f8]">
        <div className="px-4 pb-2 pt-4 text-[19px] font-bold tracking-tight">Messages</div>
        <div className="flex-1 overflow-y-auto px-2">
          <div className="flex items-center gap-3 rounded-xl bg-black/[0.07] px-3 py-2.5">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="size-11 shrink-0 rounded-full object-cover"
              draggable={false}
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13.5px] font-semibold">{profile.name}</div>
              <div className="truncate text-[12px] text-neutral-500">
                {typing ? 'typing...' : last.text}
              </div>
            </div>
            <div className="shrink-0 text-[11px] text-neutral-400">{last.time}</div>
          </div>

          <div className="px-2 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
            Reach me
          </div>
          {LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target={l.href.startsWith('mailto:') ? undefined : '_blank'}
              rel="noreferrer"
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors hover:bg-black/[0.05]"
            >
              <l.Icon size={15} className="shrink-0 text-neutral-500" />
              <div className="min-w-0">
                <div className="text-[12.5px] font-medium leading-tight">{l.label}</div>
                <div className="truncate text-[11px] text-neutral-400">{l.value}</div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Thread */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex shrink-0 items-center gap-2.5 border-b border-black/10 bg-white/60 px-4 py-2.5">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="size-8 rounded-full object-cover"
            draggable={false}
          />
          <div className="text-[13.5px] font-semibold">{profile.name}</div>
        </div>

        <div className="selectable flex-1 space-y-1.5 overflow-y-auto px-4 py-4">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-[13.5px] leading-snug ${
                  m.from === 'me'
                    ? 'rounded-br-md bg-[#0a84ff] text-white'
                    : 'rounded-bl-md bg-[#e9e9eb] text-neutral-900'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-[#e9e9eb] px-3.5 py-3">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="size-1.5 animate-bounce rounded-full bg-neutral-500"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="shrink-0 border-t border-black/10 bg-white/60 px-4 py-2.5">
          <div className="flex items-center gap-2 rounded-full border border-black/15 bg-white px-3.5 py-1.5">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') send()
              }}
              placeholder="iMessage"
              className="selectable min-w-0 flex-1 bg-transparent text-[13.5px] outline-none placeholder:text-neutral-400"
            />
            <button
              onClick={send}
              aria-label="Send"
              className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#0a84ff] text-white transition-transform hover:scale-105 active:scale-95"
            >
              <ArrowUp size={15} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
