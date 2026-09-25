'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { BatteryMedium, Wifi } from 'lucide-react'
import NLogo from '@/components/NLogo'

// Types
interface MenuItemOption {
  label?: string
  action?: string
  shortcut?: string
  type?: 'item' | 'separator'
}

interface MenuConfig {
  label: string
  items: MenuItemOption[]
}

interface MacOSMenuBarProps {
  appName?: string
  menus?: MenuConfig[]
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
      className="menu-dropdown-enter absolute z-[60] backdrop-blur-md"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        background: 'rgba(40, 40, 40, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        borderRadius: '8px',
        boxShadow: `
          0 8px 32px rgba(0, 0, 0, 0.4),
          0 2px 8px rgba(0, 0, 0, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.12)
        `,
        minWidth: '220px',
      }}
    >
      <div className="py-1">
        {items.map((item, index) => {
          if (item.type === 'separator') {
            return <div key={index} className="mx-2 my-1 h-px bg-white/15" />
          }

          return (
            <div
              key={index}
              className="flex cursor-pointer items-center justify-between px-4 py-1 text-sm text-white transition-colors duration-100 hover:bg-white/10"
              onClick={() => {
                if (item.action) {
                  onAction?.(item.action)
                }
                onClose()
              }}
            >
              <span className="flex items-center">{item.label}</span>
              {item.shortcut && <span className="ml-4 text-xs text-white/60">{item.shortcut}</span>}
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
 * A desktop-style menu bar with glassmorphic design, live clock,
 * and customizable menus. Adapted from a macOS-style component;
 * all branding is original NamishOS artwork.
 */
const MacOSMenuBar: React.FC<MacOSMenuBarProps> = ({
  appName = 'Files',
  menus = DEFAULT_MENUS,
  onMenuAction,
  className = '',
}) => {
  const [currentTime, setCurrentTime] = useState('')
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 })

  const nLogoRef = useRef<HTMLDivElement>(null)
  const menuRefs = useRef<{ [key: string]: HTMLSpanElement | null }>({})

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
        className="backdrop-blur-md"
        style={{
          height: '32px',
          background: 'rgba(30, 30, 34, 0.55)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 1px 12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="flex h-full items-center justify-between px-4">
          {/* Left section - N logo and app menus */}
          <div className="flex items-center space-x-4">
            <div
              ref={nLogoRef}
              onClick={handleNMenuClick}
              className="cursor-pointer transition-opacity duration-150 hover:opacity-80"
              title="NamishOS"
            >
              <NLogo size={18} />
            </div>

            <span className="text-sm font-semibold text-white">{appName}</span>

            <div className="hidden items-center space-x-5 sm:flex">
              {menus.map((menu) => (
                <span
                  key={menu.label}
                  ref={(el) => {
                    menuRefs.current[menu.label] = el
                  }}
                  className="cursor-pointer select-none text-[13px] text-white/90 transition-opacity duration-150 hover:opacity-70"
                  onClick={() => handleMenuItemClick(menu.label)}
                >
                  {menu.label}
                </span>
              ))}
            </div>
          </div>

          {/* Right section - status icons and clock */}
          <div className="flex items-center space-x-4">
            <BatteryMedium size={22} className="text-white/90" strokeWidth={1.5} />
            <Wifi size={15} className="text-white/90" strokeWidth={2} />
            <span className="select-none text-[13px] font-medium text-white/90">{currentTime}</span>
          </div>
        </div>
      </div>

      {/* N Menu Dropdown */}
      <MenuDropdown
        isOpen={activeMenu === 'nmenu'}
        onClose={closeDropdown}
        items={N_MENU_ITEMS}
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
