export default function Wallpaper() {
  return (
    <div className="wallpaper-base absolute inset-0 overflow-hidden">
      <div className="aurora-blob animate-aurora-1 left-[-10%] top-[-15%] h-[55vmax] w-[55vmax] bg-cyan-400/25" />
      <div className="aurora-blob animate-aurora-2 right-[-12%] top-[5%] h-[48vmax] w-[48vmax] bg-fuchsia-500/25" />
      <div className="aurora-blob animate-aurora-3 bottom-[-18%] left-[30%] h-[52vmax] w-[52vmax] bg-indigo-500/30" />
      <div className="wallpaper-noise absolute inset-0" />
    </div>
  )
}
