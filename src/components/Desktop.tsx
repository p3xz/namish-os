import { useState } from 'react'
import { Image as ImageIcon, FolderOpen, SquareTerminal } from 'lucide-react'
import Wallpaper, { WALLPAPER_META } from './Wallpaper'
import MenuBar from './MenuBar'
import Dock from './Dock'
import Spotlight from './Spotlight'
import MissionControl from './MissionControl'
import WindowLayer from './WindowLayer'
import GenieOverlay from './GenieOverlay'
import MacFolder from './MacFolder'
import { MessagesIcon, AIIcon, InsidCodeIcon } from './MacSquircleIcon'
import { useContextMenu, type MenuEntry } from './ContextMenu'
import { desktopFolders } from '@/os/filesystem'
import { useWindows } from '@/os/WindowManager'
import { useAppearance, type WallpaperVariant } from '@/os/Appearance'

const WALLPAPERS: WallpaperVariant[] = ['tide', 'drift', 'ember']

export default function Desktop() {
  const { openApp } = useWindows()
  const { variant, setVariant } = useAppearance()
  const { showContextMenu, contextMenu } = useContextMenu()

  const onDesktopMenu = (e: React.MouseEvent) => {
    // Windows, the Dock, and the menu bar handle their own clicks. Everything
    // else is empty desktop.
    const t = e.target as HTMLElement
    if (
      t.closest('[data-window-id]') ||
      t.closest('[data-dock-app]') ||
      t.closest('[data-menu-bar]')
    ) {
      return
    }
    const items: MenuEntry[] = [
      {
        type: 'submenu',
        label: 'Change Wallpaper',
        icon: <ImageIcon size={15} strokeWidth={2} />,
        items: WALLPAPERS.map((w) => ({
          type: 'item' as const,
          label: WALLPAPER_META[w].name,
          checked: variant === w,
          onSelect: () => setVariant(w),
        })),
      },
      { type: 'separator' },
      {
        type: 'item',
        label: 'Open Terminal Here',
        icon: <SquareTerminal size={15} strokeWidth={2} />,
        onSelect: () => openApp('terminal'),
      },
    ]
    showContextMenu(e, items)
  }

  return (
    <div className="fixed inset-0 overflow-hidden" onContextMenu={onDesktopMenu}>
      <Wallpaper />
      <DesktopIcons />
      <WindowLayer />
      <GenieOverlay />
      <div data-menu-bar>
        <MenuBar />
      </div>
      <Dock />
      <Spotlight />
      <MissionControl />
      {contextMenu}
    </div>
  )
}

function DesktopIcons() {
  const { openApp } = useWindows()
  const [selected, setSelected] = useState<string | null>(null)
  const { showContextMenu, contextMenu } = useContextMenu()

  const openFolder = (name: string) => {
    if (name === 'Contact') {
      openApp('messages')
    } else if (name === 'AI') {
      openApp('ai')
    } else if (name === 'InsidCode') {
      openApp('insidcode')
    } else {
      openApp('files', { folderPath: [name] })
    }
  }

  const onIconMenu = (e: React.MouseEvent, name: string) => {
    setSelected(name)
    showContextMenu(e, [
      {
        type: 'item',
        label: 'Open',
        icon: <FolderOpen size={15} strokeWidth={2} />,
        onSelect: () => openFolder(name),
      },
    ])
  }

  const iconFor = (name: string) =>
    name === 'Contact' ? (
      <MessagesIcon size={48} />
    ) : name === 'AI' ? (
      <AIIcon size={48} />
    ) : name === 'InsidCode' ? (
      <InsidCodeIcon size={48} />
    ) : (
      <MacFolder size={48} />
    )

  return (
    <div
      className="absolute right-3 top-11 z-10 flex flex-col gap-0.5"
      onClick={(e) => e.stopPropagation()}
    >
      {[...desktopFolders, 'AI', 'InsidCode'].map((name) => (
        <button
          key={name}
          onClick={() => setSelected(name)}
          onDoubleClick={() => {
            setSelected(name)
            openFolder(name)
          }}
          onContextMenu={(e) => onIconMenu(e, name)}
          className="flex w-[92px] flex-col items-center gap-1 rounded-xl px-1 py-2.5 transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
        >
          <span
            className={`rounded-xl p-1 transition-colors ${
              selected === name ? 'bg-white/30' : 'hover:bg-white/15'
            }`}
          >
            {iconFor(name)}
          </span>
          <span className="text-center text-[12px] font-medium leading-tight text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">
            {name}
          </span>
        </button>
      ))}
      {contextMenu}
    </div>
  )
}
