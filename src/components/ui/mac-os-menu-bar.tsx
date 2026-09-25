'use client'

import React, { useState, useEffect, useRef, useCallback, type ReactNode } from 'react'
import { BatteryMedium, Wifi, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import NLogo from '@/components/NLogo'

// Types
interface MenuItemOption {
  label?: string
  action?: string
  shortcut?: string
  icon?: ReactNode
  type?: 'item' | 'separator'
}

interface MenuConfig {
  label: string
  items: MenuItemOption[]
}

interface MacOSMenuBarProps {
  appName?: string
  menus?: MenuConfig[]
  nMenuItems?: MenuItemOption[]
  onMenuAction?: (action: string) => void
  className?: string
}

// Finder-style menus for the Files app
const DEFAULT_MENUS: MenuConfig[] = [
  {
    label: 'File',
    items: [
      { label: 'New Window', action: 'new-window', shortcut: '\u2318N' },
      { type: 'separator' },
      { label: 'Close Window', action: 'close-window', shortcut: '\u2318W' },
    ],
  },
  {
    label: 'Edit',
    items: [
      { label: 'Undo', action: 'noop', shortcut: '\u2318Z' },
      { type: 'separator' },
      { label: 'Cut', action: 'noop', shortcut: '\u2318X' },
      { label: 'Copy', action: 'noop', shortcut: '\u2318C' },
      { label: 'Paste', action: 'noop', shortcut: '\u2318V' },
      { label: 'Select All', action: 'noop', shortcut: '\u2318A' },
    ],
  },
  {
    label: 'View',
    items: [
      { label: 'as Icons', action: 'view-icons', shortcut: '\u23181' },
      { label: 'as List', action: 'view-list', shortcut: '\u23182' },
    ],
  },
  {
    label: 'Window',
    items: [
      { label: 'Minimize', action: 'minimize', shortcut: '\u2318M' },
      { label: 'Zoom', action: 'zoom' },
      { type: 'separator' },
      { label: 'Bring All to Front', action: 'bring-to-front' },
    ],
  },
  {
    label: 'Help',
    items: [{ label: 'NamishOS Help', action: 'help' }],
  },
]

// N menu (replaces the Apple menu)
const N_MENU_ITEMS: MenuItemOption[] = [
  { label: 'About NamishOS', action: 'about' },
  { type: 'separator' },
  { label: 'System Settings...', action: 'settings' },
  { type: 'separator' },
  { label: 'Sleep', action: 'sleep' },
  { label: 'Restart...', action: 'restart' },
  { label: 'Shut Down...', action: 'shutdown' },
]

// MenuDropdown Component (bundled inside)
interface MenuDropdownProps {
  isOpen: boolean
  onClose: () => void
  items: MenuItemOption[]
  position: { x: number; y: number }
  onAction?: (action: string) => void
}

const MenuDropdown: React.FC<MenuDropdownProps> = ({ isOpen, onClose, items, position, onAction }) => {
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className="menu-dropdown-enter absolute z-[60] backdrop-blur-xl"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        background: 'rgba(246, 246, 248, 0.86)',
        border: '1px solid rgba(0, 0, 0, 0.12)',
        borderRadius: '10px',
        boxShadow: `
          0 12px 40px rgba(0, 0, 0, 0.25),
          0 2px 8px rgba(0, 0, 0, 0.15),
          inset 0 1px 0 rgba(255, 255, 255, 0.7)
        `,
        minWidth: '230px',
      }}
    >
      <div className="py-1.5">
        {items.map((item, index) => {
          if (item.type === 'separator') {
            return <div key={index} className="mx-3 my-1.5 h-px bg-black/10" />
          }

          return (
            <div
              key={index}
              className="group mx-1.5 flex cursor-pointer items-center justify-between rounded-md px-3 py-1 text-[13.5px] text-neutral-800 transition-colors duration-100 hover:bg-[#0a84ff] hover:text-white"
              onClick={() => {
                if (item.action) {
                  onAction?.(item.action)
                }
                onClose()
              }}
            >
              <span className="flex items-center gap-2.5">
                {item.icon && (
                  <span className="flex w-4 justify-center text-neutral-500 group-hover:text-white">
                    {item.icon}
                  </span>
                )}
                <span className="flex items-center">{item.label}</span>
              </span>
              {item.shortcut && (
                <span className="ml-6 text-xs text-neutral-400 group-hover:text-white/80">
                  {item.shortcut}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * NamishOS Menu Bar
 *
 * Light translucent macOS-style menu bar with live clock and app menus.
 * All branding is original NamishOS artwork.
 */

const POPOVER_CARD =
  'macos-popover macos-popover-enter absolute top-9 z-[300] w-72 overflow-hidden rounded-2xl border border-black/10 bg-white/85 shadow-[0_12px_40px_rgba(0,0,0,0.25)] backdrop-blur-2xl'

// --- Calendar popover -------------------------------------------------------

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function CalendarPopover() {
  const now = new Date()
  const [view, setView] = useState({ y: now.getFullYear(), m: now.getMonth() })

  const shift = (delta: number) => {
    setView((v) => {
      const d = new Date(v.y, v.m + delta, 1)
      return { y: d.getFullYear(), m: d.getMonth() }
    })
  }

  const firstWeekday = new Date(view.y, view.m, 1).getDay()
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate()
  const isCurrentMonth = view.y === now.getFullYear() && view.m === now.getMonth()

  const cells: (number | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className={`${POPOVER_CARD} right-2 p-4`}>
      <div className="mb-2 flex items-center justify-between">
        <button
          onClick={() => shift(-1)}
          className="rounded-full p-1 text-neutral-500 hover:bg-black/5"
          aria-label="Previous month"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-[14px] font-semibold text-neutral-800">
          {MONTHS[view.m]} {view.y}
        </span>
        <button
          onClick={() => shift(1)}
          className="rounded-full p-1 text-neutral-500 hover:bg-black/5"
          aria-label="Next month"
        >
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {WEEKDAYS.map((d, i) => (
          <span key={i} className="text-[11px] font-semibold text-neutral-400">
            {d}
          </span>
        ))}
        {cells.map((day, i) => {
          const isToday = isCurrentMonth && day === now.getDate()
          return (
            <span key={i} className="flex h-8 items-center justify-center">
              {day !== null && (
                <span
                  className={`flex size-7 items-center justify-center rounded-full text-[13px] ${
                    isToday
                      ? 'bg-red-500 font-semibold text-white'
                      : 'text-neutral-700'
                  }`}
                >
                  {day}
                </span>
              )}
            </span>
          )
        })}
      </div>
    </div>
  )
}

// --- Battery popover (prototype) --------------------------------------------

function BatteryPopover() {
  const [level, setLevel] = useState<number | null>(null)

  useEffect(() => {
    let alive = true
    try {
      const nav = navigator as unknown as { getBattery?: () => Promise<{ level: number }> }
      if (nav.getBattery) {
        nav.getBattery()
          .then((b) => {
            if (alive) setLevel(Math.round(b.level * 100))
          })
          .catch(() => {})
      }
    } catch {
      /* prototype fallback below */
    }
    return () => {
      alive = false
    }
  }, [])

  const pct = level ?? 87

  return (
    <div className={`${POPOVER_CARD} right-2 p-4`}>
      <div className="text-[13px] font-semibold text-neutral-800">Battery</div>
      <div className="mt-3 flex items-center gap-3">
        <span className="text-[28px] font-semibold text-neutral-900">{pct}%</span>
        <div className="relative h-6 w-14 rounded-[6px] border-2 border-neutral-400">
          <div
            className="absolute inset-[2px] rounded-[3px] bg-emerald-500"
            style={{ width: `calc(${pct}% - 4px)` }}
          />
          <div className="absolute -right-[7px] top-1/2 h-3 w-[4px] -translate-y-1/2 rounded-r bg-neutral-400" />
        </div>
      </div>
      <div className="mt-2 text-[12.5px] text-neutral-500">Power Source: Power Adapter</div>
      <div className="mt-1 text-[11px] text-neutral-400">Prototype: mock status for now</div>
    </div>
  )
}

// --- Wi-Fi popover (prototype) ----------------------------------------------

const MOCK_NETWORKS = [
  { name: 'Home-5G', bars: 3 },
  { name: 'Home', bars: 2 },
  { name: 'NamishPhone', bars: 2 },
  { name: 'Cafe_Guest', bars: 1 },
]

function WifiBars({ bars }: { bars: number }) {
  return (
    <span className="flex items-end gap-[2px]" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`w-[3px] rounded-sm ${i < bars ? 'bg-neutral-700' : 'bg-neutral-300'}`}
          style={{ height: 5 + i * 4 }}
        />
      ))}
    </span>
  )
}

function WifiPopover() {
  const [on, setOn] = useState(true)
  const [connected, setConnected] = useState('Home-5G')

  return (
    <div className={`${POPOVER_CARD} right-2 p-4`}>
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-neutral-800">Wi-Fi</span>
        <button
          onClick={() => setOn((v) => !v)}
          className={`relative h-6 w-11 rounded-full transition-colors ${on ? 'bg-emerald-500' : 'bg-neutral-300'}`}
          aria-label="Toggle Wi-Fi"
        >
          <span
            className={`absolute top-[2px] size-5 rounded-full bg-white shadow transition-all ${on ? 'left-[22px]' : 'left-[2px]'}`}
          />
        </button>
      </div>
      {on ? (
        <div className="mt-2">
          <div className="px-1 pb-1 text-[11px] font-medium uppercase tracking-wide text-neutral-400">
            Known Networks
          </div>
          {MOCK_NETWORKS.map((n) => (
            <button
              key={n.name}
              onClick={() => setConnected(n.name)}
              className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left hover:bg-black/5"
            >
              <span className="flex items-center gap-2.5">
                <WifiBars bars={n.bars} />
                <span className="text-[13px] text-neutral-800">{n.name}</span>
              </span>
              {connected === n.name && <Check size={15} className="text-neutral-600" />}
            </button>
          ))}
          <div className="mt-2 border-t border-black/5 px-1 pt-2 text-[11px] text-neutral-400">
            Prototype: mock networks for now
          </div>
        </div>
      ) : (
        <div className="mt-3 text-[12.5px] text-neutral-500">Wi-Fi is off</div>
      )}
    </div>
  )
}

const MacOSMenuBar: React.FC<MacOSMenuBarProps> = ({
  appName = 'Files',
  menus = DEFAULT_MENUS,
  nMenuItems = N_MENU_ITEMS,
  onMenuAction,
  className = '',
}) => {
  const [currentTime, setCurrentTime] = useState('')
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 })
  const [activePopover, setActivePopover] = useState<'battery' | 'wifi' | 'calendar' | null>(null)

  const nLogoRef = useRef<HTMLDivElement>(null)
  const menuRefs = useRef<{ [key: string]: HTMLSpanElement | null }>({})

  // Close status popovers on outside click
  useEffect(() => {
    if (!activePopover) return
    const close = (e: MouseEvent) => {
      const t = e.target as Element
      if (!t.closest('.macos-popover') && !t.closest('.macos-popover-trigger')) {
        setActivePopover(null)
      }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [activePopover])

  // Update clock every 10 seconds
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const datePart = now.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
      const timePart = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
      setCurrentTime(`${datePart}  ${timePart}`)
    }

    updateTime()
    const interval = setInterval(updateTime, 10000)

    return () => clearInterval(interval)
  }, [])

  const positionFor = useCallback((el: HTMLElement | null) => {
    if (!el) return { x: 8, y: 36 }
    const rect = el.getBoundingClientRect()
    const parentRect = el.offsetParent?.getBoundingClientRect() || { left: 0, top: 0 }
    return {
      x: rect.left - parentRect.left,
      y: 36,
    }
  }, [])

  const handleNMenuClick = useCallback(() => {
    if (activeMenu === 'nmenu') {
      setActiveMenu(null)
    } else {
      setDropdownPosition(positionFor(nLogoRef.current))
      setActiveMenu('nmenu')
    }
  }, [activeMenu, positionFor])

  const handleMenuItemClick = useCallback(
    (menuLabel: string) => {
      if (activeMenu === menuLabel) {
        setActiveMenu(null)
      } else {
        setDropdownPosition(positionFor(menuRefs.current[menuLabel]))
        setActiveMenu(menuLabel)
      }
    },
    [activeMenu, positionFor],
  )

  const closeDropdown = useCallback(() => {
    setActiveMenu(null)
  }, [])

  const handleMenuAction = useCallback(
    (action: string) => {
      onMenuAction?.(action)
    },
    [onMenuAction],
  )

  return (
    <div className={`fixed inset-x-0 top-0 z-[200] ${className}`} style={{ position: 'fixed' }}>
      <div
        className="backdrop-blur-xl"
        style={{
          height: '30px',
          background: 'rgba(250, 250, 252, 0.62)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.5)',
        }}
      >
        <div className="flex h-full items-center justify-between px-4">
          {/* Left section - N logo and app menus */}
          <div className="flex items-center space-x-4">
            <div
              ref={nLogoRef}
              onClick={handleNMenuClick}
              className="cursor-pointer transition-opacity duration-150 hover:opacity-75"
              title="NamishOS"
            >
              <NLogo size={17} />
            </div>

            <span className="text-[13.5px] font-bold text-neutral-900">{appName}</span>

            <div className="hidden items-center space-x-5 sm:flex">
              {menus.map((menu) => (
                <span
                  key={menu.label}
                  ref={(el) => {
                    menuRefs.current[menu.label] = el
                  }}
                  className={`cursor-pointer select-none rounded px-1 text-[13px] transition-colors duration-150 ${
                    activeMenu === menu.label
                      ? 'bg-black/10 text-neutral-900'
                      : 'text-neutral-800 hover:bg-black/[0.06]'
                  }`}
                  onClick={() => handleMenuItemClick(menu.label)}
                >
                  {menu.label}
                </span>
              ))}
            </div>
          </div>

          {/* Right section - status icons and clock */}
          <div className="flex items-center space-x-3.5">
            <button
              className="macos-popover-trigger rounded p-0.5 transition-colors hover:bg-black/[0.06]"
              onClick={() =>
                setActivePopover((p) => (p === 'battery' ? null : 'battery'))
              }
              title="Battery"
            >
              <BatteryMedium size={22} className="text-neutral-800" strokeWidth={1.5} />
            </button>
            <button
              className="macos-popover-trigger rounded p-0.5 transition-colors hover:bg-black/[0.06]"
              onClick={() => setActivePopover((p) => (p === 'wifi' ? null : 'wifi'))}
              title="Wi-Fi"
            >
              <Wifi size={14} className="text-neutral-800" strokeWidth={2.2} />
            </button>
            <button
              className="macos-popover-trigger rounded px-1 py-0.5 transition-colors hover:bg-black/[0.06]"
              onClick={() =>
                setActivePopover((p) => (p === 'calendar' ? null : 'calendar'))
              }
              title="Calendar"
            >
              <span className="select-none text-[13px] font-medium text-neutral-800">
                {currentTime}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Status popovers */}
      {activePopover === 'battery' && <BatteryPopover />}
      {activePopover === 'wifi' && <WifiPopover />}
      {activePopover === 'calendar' && <CalendarPopover />}

      {/* N Menu Dropdown */}
      <MenuDropdown
        isOpen={activeMenu === 'nmenu'}
        onClose={closeDropdown}
        items={nMenuItems}
        position={dropdownPosition}
        onAction={handleMenuAction}
      />

      {/* Menu Dropdowns */}
      {menus.map((menu) => (
        <MenuDropdown
          key={menu.label}
          isOpen={activeMenu === menu.label}
          onClose={closeDropdown}
          items={menu.items}
          position={dropdownPosition}
          onAction={handleMenuAction}
        />
      ))}
    </div>
  )
}

export default MacOSMenuBar
