import { profile, skillGroups, projects, experience } from '@/data/portfolio'

export type FileKind = 'text' | 'project' | 'image' | 'contact'

export interface FSFile {
  name: string
  type: 'file'
  kind: FileKind
  /** reference: text body key, project id, image url, or 'contact' */
  ref: string
}

export interface FSFolder {
  name: string
  type: 'folder'
  children: FSEntry[]
}

export type FSEntry = FSFile | FSFolder

export interface TextDoc {
  title: string
  body: string
}

const contactBody = [
  profile.name,
  '',
  `Email: ${profile.email}`,
  `GitHub: ${profile.github}`,
  `X: ${profile.x}`,
  `Website: ${profile.website}`,
  `Portfolio: ${profile.portfolio}`,
].join('\n')

const aboutBody = [
  profile.name,
  profile.tagline,
  '',
  profile.bio,
  '',
  `GitHub: ${profile.github}`,
  `X: ${profile.x}`,
].join('\n')

/** Named text documents addressable by ref. */
export const textDocs: Record<string, TextDoc> = {
  about: { title: 'about.txt', body: aboutBody },
  contact: { title: 'contact.txt', body: contactBody },
  trash: {
    title: 'readme.txt',
    body: 'Trash is empty.\n\nYou clean up after yourself. Respect.',
  },
  help: {
    title: 'NamishOS Help',
    body: [
      'NamishOS Help',
      '',
      'Double-click a folder on the desktop (or in Files) to open it.',
      'Drag any window by its title bar to move it.',
      'Traffic lights: red closes, yellow minimizes, green zooms.',
      'Click a Dock icon to launch its app. Running apps get a dot.',
      'Type "help" inside Terminal for a list of commands.',
      'View menu switches Files between icon and list view.',
    ].join('\n'),
  },
}

for (const g of skillGroups) {
  textDocs[`skill-${g.file}`] = {
    title: g.file,
    body: `${g.title}\n\n${g.skills.join('\n')}`,
  }
}

for (const e of experience) {
  textDocs[`exp-${e.id}`] = {
    title: `${e.company.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`,
    body: `${e.role}, ${e.company} (${e.year})\n\n${e.description}`,
  }
}

const projectFile = (id: string, name: string): FSFile => ({
  name,
  type: 'file',
  kind: 'project',
  ref: id,
})

export const homeFolder: FSFolder = {
  name: 'Home',
  type: 'folder',
  children: [
    {
      name: 'About Me',
      type: 'folder',
      children: [
        { name: 'about.txt', type: 'file', kind: 'text', ref: 'about' },
        { name: 'avatar.jpg', type: 'file', kind: 'image', ref: profile.avatar },
      ],
    },
    {
      name: 'Projects',
      type: 'folder',
      children: projects.map((p) => projectFile(p.id, p.name)),
    },
    {
      name: 'Experience',
      type: 'folder',
      children: experience.map((e) => ({
        name: textDocs[`exp-${e.id}`].title,
        type: 'file',
        kind: 'text',
        ref: `exp-${e.id}`,
      })),
    },
    {
      name: 'Skills',
      type: 'folder',
      children: skillGroups.map((g) => ({
        name: g.file,
        type: 'file',
        kind: 'text',
        ref: `skill-${g.file}`,
      })),
    },
    {
      name: 'Contact',
      type: 'folder',
      children: [{ name: 'contact.txt', type: 'file', kind: 'text', ref: 'contact' }],
    },
  ],
}

export const trashFolder: FSFolder = {
  name: 'Trash',
  type: 'folder',
  children: [{ name: 'readme.txt', type: 'file', kind: 'text', ref: 'trash' }],
}

/** Folders shown as icons on the desktop (right side). */
export const desktopFolders = ['About Me', 'Projects', 'Experience', 'Skills', 'Contact']

/** Resolve a path like ['Projects'] to its folder. Empty path = home. */
export function getFolderAt(path: string[]): FSFolder {
  if (path.length === 0) return homeFolder
  if (path[0] === 'Trash') return trashFolder
  let node: FSFolder = homeFolder
  for (const seg of path) {
    const next = node.children.find((c): c is FSFolder => c.type === 'folder' && c.name === seg)
    if (!next) return homeFolder
    node = next
  }
  return node
}

/** Find a folder anywhere by name (used by `open <folder>` in Terminal). */
export function findFolderByName(name: string): string[] | null {
  const needle = name.trim().toLowerCase()
  if (needle === 'home' || needle === '') return []
  if (needle === 'trash') return ['Trash']
  const hit = homeFolder.children.find(
    (c) => c.type === 'folder' && c.name.toLowerCase() === needle,
  )
  return hit ? [hit.name] : null
}
