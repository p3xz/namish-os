export type AppId =
  | 'files'
  | 'terminal'
  | 'web'
  | 'messages'
  | 'notes'
  | 'about'
  | 'quicklook'
  | 'settings'
  | 'ai'
  | 'insidcode'

export interface Bounds {
  x: number
  y: number
  w: number
  h: number
}

export interface OSWindow {
  id: string
  app: AppId
  title: string
  bounds: Bounds
  prevBounds: Bounds | null
  z: number
  minimized: boolean
  maximized: boolean
  /** Finder folder path, e.g. ['Projects']. Empty = home. */
  folderPath?: string[]
  /** Quick Look payload */
  quickLook?: { kind: 'text' | 'project' | 'image' | 'contact'; ref: string; title: string }
}

export type FinderView = 'icons' | 'list'

export interface OpenAppOptions {
  folderPath?: string[]
  quickLook?: OSWindow['quickLook']
}
