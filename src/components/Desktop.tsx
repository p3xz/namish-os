import { useState } from 'react'
import Wallpaper from './Wallpaper'
import MenuBar from './MenuBar'
import Dock from './Dock'
import WindowLayer from './WindowLayer'
import MacFolder from './MacFolder'
import { desktopFolders } from '@/os/filesystem'
import { useWindows } from '@/os/WindowManager'

export default function Desktop() {
  return (
    <div className="fixed inset-0 overflow-hidden">
      <Wallpaper />
      <DesktopIcons />
      <WindowLayer />
      <MenuBar />
      <Dock />
    </div>
  )
}

function DesktopIcons() {
  const { openApp } = useWindows()
  const [selected, setSelected] = useState<string | null>(null)

  const openFolder = (name: string) => {
    if (name === 'Contact') {
      openApp('messages')
    } else {
      openApp('files', { folderPath: [name] })
    }
  }

  return (
    <div
      className="absolute right-3 top-11 z-10 flex flex-col gap-0.5"
      onClick={(e) => e.stopPropagation()}
    >
      {desktopFolders.map((name) => (
        <button
          key={name}
          onClick={() => setSelected(name)}
          onDoubleClick={() => {
            setSelected(name)
            openFolder(name)
          }}
          className="flex w-[92px] flex-col items-center gap-1 rounded-xl px-1 py-2.5"
        >
          <span
            className={`rounded-xl p-1 transition-colors ${
              selected === name ? 'bg-white/30' : 'hover:bg-white/15'
            }`}
          >
            <MacFolder size={48} />
          </span>
          <span className="text-center text-[12px] font-medium leading-tight text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">
            {name}
          </span>
        </button>
      ))}
    </div>
  )
}
