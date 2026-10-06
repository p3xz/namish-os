import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react'
import { Check, ChevronRight } from 'lucide-react'

/** A single clickable menu row. */
export interface ContextMenuItem {
  type: 'item'
  label: string
  icon?: ReactNode
  /** Small hint shown right-aligned, e.g. a keyboard shortcut. */
  shortcut?: string
  /** Shows a checkmark in the icon slot. */
  checked?: boolean
  disabled?: boolean
  onSelect: () => void
}

export interface ContextMenuSeparator {
  type: 'separator'
}

/** A row that opens a child menu on hover, macOS-style. */
export interface ContextMenuSubmenu {
  type: 'submenu'
  label: string
  icon?: ReactNode
  items: ContextMenuItem[]
}

export type MenuEntry = ContextMenuItem | ContextMenuSeparator | ContextMenuSubmenu

interface PanelProps {
  x: number
  y: number
  items: MenuEntry[]
  /** Called after any item is picked; closes the whole menu tree. */
  onPick: () => void
}

/**
 * One macOS-style menu panel. Submenus render as nested panels so each one
 * clamps itself to the viewport.
 */
function MenuPanel({ x, y, items, onPick }: PanelProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ left: x, top: y })
  const [openSub, setOpenSub] = useState<number | null>(null)
  const [subAnchor, setSubAnchor] = useState({ x: 0, y: 0 })
  const rowRefs = useRef(new Map<number, HTMLButtonElement>())

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setPos({
      left: Math.max(8, Math.min(x, window.innerWidth - r.width - 8)),
      top: Math.max(8, Math.min(y, window.innerHeight - r.height - 8)),
    })
  }, [x, y])

  const openSubmenu = (i: number) => {
    const row = rowRefs.current.get(i)
    const r = row?.getBoundingClientRect()
    setSubAnchor({ x: (r?.right ?? x + 200) - 6, y: (r?.top ?? y) - 6 })
    setOpenSub(i)
  }

  return (
    <div
      ref={ref}
      data-context-menu
      role="menu"
      className="fixed z-[500] min-w-[224px] max-w-[300px] rounded-xl border border-black/10 bg-white/80 p-1 shadow-[0_16px_48px_rgba(0,0,0,0.28)] backdrop-blur-2xl"
      style={{ left: pos.left, top: pos.top }}
      onMouseLeave={() => setOpenSub(null)}
    >
      {items.map((entry, i) => {
        if (entry.type === 'separator') {
          return <div key={i} className="mx-2 my-1 border-t border-black/10" role="separator" />
        }
        if (entry.type === 'submenu') {
          return (
            <button
              key={i}
              ref={(el) => {
                if (el) rowRefs.current.set(i, el)
                else rowRefs.current.delete(i)
              }}
              role="menuitem"
              aria-haspopup="menu"
              onMouseEnter={() => openSubmenu(i)}
              onClick={() => openSubmenu(i)}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-left text-[13px] text-neutral-800 transition-colors hover:bg-[#0a84ff] hover:text-white"
            >
              <span className="flex w-[18px] shrink-0 items-center justify-center">
                {entry.icon}
              </span>
              <span className="flex-1 truncate">{entry.label}</span>
              <ChevronRight size={14} className="shrink-0 opacity-60" />
            </button>
          )
        }
        return (
          <button
            key={i}
            role="menuitem"
            disabled={entry.disabled}
            onMouseEnter={() => setOpenSub(null)}
            onClick={() => {
              if (entry.disabled) return
              entry.onSelect()
              onPick()
            }}
            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-left text-[13px] transition-colors ${
              entry.disabled
                ? 'cursor-default text-neutral-400'
                : 'text-neutral-800 hover:bg-[#0a84ff] hover:text-white'
            }`}
          >
            <span className="flex w-[18px] shrink-0 items-center justify-center">
              {entry.checked ? <Check size={14} strokeWidth={2.5} /> : entry.icon}
            </span>
            <span className="flex-1 truncate">{entry.label}</span>
            {entry.shortcut && (
              <span className="shrink-0 text-[12px] text-neutral-400">{entry.shortcut}</span>
            )}
          </button>
        )
      })}
      {openSub !== null &&
        items[openSub] &&
        items[openSub].type === 'submenu' && (
          <MenuPanel
            x={subAnchor.x}
            y={subAnchor.y}
            items={(items[openSub] as ContextMenuSubmenu).items}
            onPick={onPick}
          />
        )}
    </div>
  )
}

/**
 * Hook that owns one context menu. Call showContextMenu from an onContextMenu
 * handler and render the returned node near the top of your component.
 */
export function useContextMenu() {
  const [menu, setMenu] = useState<{ x: number; y: number; items: MenuEntry[] } | null>(null)

  const showContextMenu = (e: ReactMouseEvent, items: MenuEntry[]) => {
    e.preventDefault()
    e.stopPropagation()
    setMenu({ x: e.clientX, y: e.clientY, items })
  }

  useEffect(() => {
    if (!menu) return
    const close = () => setMenu(null)
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') close()
    }
    // A press anywhere outside the menu dismisses it. The capture phase runs
    // before the item click handlers, so picking an item still works.
    const onDown = (ev: globalThis.MouseEvent) => {
      if (!(ev.target as HTMLElement).closest('[data-context-menu]')) close()
    }
    window.addEventListener('mousedown', onDown, true)
    window.addEventListener('keydown', onKey)
    window.addEventListener('blur', close)
    window.addEventListener('resize', close)
    return () => {
      window.removeEventListener('mousedown', onDown, true)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('blur', close)
      window.removeEventListener('resize', close)
    }
  }, [menu])

  const contextMenu = menu ? (
    <MenuPanel x={menu.x} y={menu.y} items={menu.items} onPick={() => setMenu(null)} />
  ) : null

  return { showContextMenu, contextMenu }
}
