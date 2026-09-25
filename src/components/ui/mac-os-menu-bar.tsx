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
              className="mx-1.5 flex cursor-pointer items-center justify-between rounded-md px-3.5 py-1 text-[13.5px] text-neutral-800 transition-colors duration-100 hover:bg-[#0a84ff] hover:text-white"
              onClick={() => {
                if (item.action) {
                  onAction?.(item.action)
                }
                onClose()
              }}
            >
              <span className="flex items-center">{item.label}</span>
              {item.shortcut && (
                <span className="ml-6 text-xs text-neutral-400">{item.shortcut}</span>
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
            <BatteryMedium size={22} className="text-neutral-800" strokeWidth={1.5} />
            <Wifi size={14} className="text-neutral-800" strokeWidth={2.2} />
            <span className="select-none text-[13px] font-medium text-neutral-800">{currentTime}</span>
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
