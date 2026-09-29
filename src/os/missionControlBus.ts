/** Pub/sub bus so the menu bar, menus, and keyboard shortcuts can open or
 *  toggle Mission Control without prop drilling. Follows the spotlightBus pattern. */

type OpenListener = (open: boolean) => void

const listeners = new Set<OpenListener>()
let isOpen = false

export function onMissionControlChange(listener: OpenListener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function setMissionControlOpen(open: boolean): void {
  if (open === isOpen) return
  isOpen = open
  listeners.forEach((l) => l(open))
}

export function toggleMissionControl(): void {
  setMissionControlOpen(!isOpen)
}
