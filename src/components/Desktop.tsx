import { useState } from 'react'
import { Folder } from 'lucide-react'
import Wallpaper from './Wallpaper'
import MenuBar from './MenuBar'
import { desktopFolders } from '@/os/filesystem'
import { useWindows } from '@/os/WindowManager'

export default function Desktop() {
  return (
    <div className="fixed inset-0 overflow-hidden">
      <Wallpaper />
      <DesktopIcons />
      <MenuBar />
      {/* Window layer and Dock arrive in later commits */}
    </div>
  )
}

function DesktopIcons() {
  const { openApp } = useWindows()
  const [selected, setSelected] = useState<string | null>(null)

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
            openApp('files', { folderPath: [name] })
          }}
          className={`flex w-[92px] flex-col items-center gap-1 rounded-xl px-1 py-2.5 transition-colors ${
            selected === name ? 'bg-white/25' : 'hover:bg-white/10'
          }`}
        >
          <Folder
            size={46}
            strokeWidth={1.4}
            className="text-sky-100 drop-shadow-[0_5px_14px_rgba(0,0,0,0.45)]"
            fill="rgba(14, 165, 233, 0.92)"
          />
          <span className="text-center text-[12px] font-medium leading-tight text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
            {name}
          </span>
        </button>
      ))}
    </div>
  )
}
