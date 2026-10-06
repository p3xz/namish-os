import { getFolderAt, type FSEntry } from './filesystem'

/**
 * Build a shareable link that opens a specific file or folder in NamishOS.
 * `path` is the full path, e.g. ['Projects', 'Rideoxy'].
 */
export function deepLinkFor(path: string[]): string {
  const segs = path.map((s) => encodeURIComponent(s)).join('/')
  const base = `${window.location.origin}${window.location.pathname}`
  return `${base}#/file/${segs}`
}

/** Look up an entry by full path. Returns null when the path is invalid. */
export function findEntryAt(path: string[]): FSEntry | null {
  if (path.length === 0) return null
  const folder = getFolderAt(path.slice(0, -1))
  return folder.children.find((c) => c.name === path[path.length - 1]) ?? null
}

/**
 * Parse a location.hash like `#/file/Projects/Rideoxy` back into a path.
 * Returns null for anything else or for paths that do not exist.
 */
export function resolveHash(hash: string): string[] | null {
  const m = hash.match(/^#\/file\/(.+)$/)
  if (!m) return null
  const path = m[1]
    .split('/')
    .map((s) => {
      try {
        return decodeURIComponent(s)
      } catch {
        return ''
      }
    })
    .filter(Boolean)
  if (path.length === 0) return null
  return findEntryAt(path) ? path : null
}
