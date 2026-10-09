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
  | 'calculator'

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
  quickLook?: QuickLookPayload
  /** Genie minimize/restore animation currently in flight. The window hides instantly while the overlay animates the slices. */
  genieAnim?: 'out' | 'in' | null
  /** macOS-style edge snap state. Snapped windows remember their previous
   *  bounds so dragging the title bar restores them. */
  snapped?: 'left' | 'right' | null
  /** Skip the window transition for a single frame (set right after a genie restore completes). */
  snap?: boolean
}

export type FinderView = 'icons' | 'list' | 'gallery'

/** One previewable item in a Quick Look slideshow. */
export interface QuickLookItem {
  kind: 'text' | 'project' | 'image' | 'contact'
  ref: string
  title: string
}

/** Quick Look payload: the shown item, plus the sibling items the arrow keys walk through. */
export interface QuickLookPayload extends QuickLookItem {
  siblings?: QuickLookItem[]
}

export interface OpenAppOptions {
  folderPath?: string[]
  quickLook?: OSWindow['quickLook']
}
