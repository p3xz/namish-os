/** Tiny pub/sub buses so the menu bar can open Spotlight and Spotlight can
 *  send commands to the Terminal without prop drilling. */

type VoidListener = () => void

const spotlightListeners = new Set<VoidListener>()

export function onSpotlightOpen(listener: VoidListener): () => void {
  spotlightListeners.add(listener)
  return () => {
    spotlightListeners.delete(listener)
  }
}

export function openSpotlight(): void {
  spotlightListeners.forEach((l) => l())
}

type CommandListener = (cmd: string) => void

const commandListeners = new Set<CommandListener>()

/** Holds a command when no Terminal is mounted yet; the next mount picks it up. */
let pendingCommand: string | null = null

export function onTerminalCommand(listener: CommandListener): () => void {
  commandListeners.add(listener)
  return () => {
    commandListeners.delete(listener)
  }
}

/** Ask every mounted Terminal to run a command (e.g. chosen from Spotlight). */
export function dispatchTerminalCommand(cmd: string): void {
  if (commandListeners.size > 0) {
    commandListeners.forEach((l) => l(cmd))
  } else {
    pendingCommand = cmd
  }
}

/** Consumed by Terminal on mount. Returns null when there is nothing waiting. */
export function takePendingTerminalCommand(): string | null {
  const cmd = pendingCommand
  pendingCommand = null
  return cmd
}
