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

const privacyBody = [
  'Privacy Policy',
  '',
  'Last updated: September 2026',
  '',
  'NamishOS is a personal portfolio. It does not collect, store, or sell your personal data.',
  '',
  '- No accounts, no tracking pixels, no analytics beacons.',
  '- Your notes and settings (like your wallpaper choice) are saved only in your own',
  "  browser's localStorage. They never leave your device.",
  '- The Messages app replies are scripted locally in your browser. Nothing you type',
  '  is sent to any server by this site.',
  '- External links (GitHub, X, email) open third-party sites, which have their own',
  '  privacy policies.',
  '',
  'Questions: nam4sh@gmail.com',
].join('\n')

const termsBody = [
  'Terms of Use',
  '',
  'Last updated: September 2026',
  '',
  'By using this site you agree to the following:',
  '',
  '1. This is a personal portfolio and interactive demo. Content is provided as-is,',
  '   with no warranties.',
  '2. You may browse, share links, and read the code for learning. Please do not',
  '   scrape aggressively or hammer the site with automated requests.',
  '3. Project write-ups describe my own work. Trademarks and product names belong',
  '   to their respective owners.',
  '4. External sites linked here are not under my control and their own terms apply.',
  '',
  'Questions: nam4sh@gmail.com',
].join('\n')

const cookiesBody = [
  'Cookie Policy',
  '',
  'Last updated: September 2026',
  '',
  'Short version: this site does not use tracking cookies.',
  '',
  '- No advertising cookies, no analytics cookies, and no third-party cookies are',
  '  set by this site.',
  "- A small amount of data (your wallpaper choice, your notes) is kept in your",
  '  browser\'s localStorage so the site remembers your preferences. It stays on',
  '  your device and is never sent anywhere.',
  '- Clearing your browser storage resets everything. Nothing is synced to a server.',
  '',
  'Questions: nam4sh@gmail.com',
].join('\n')

const legalBody = [
  'Legal Notice',
  '',
  'Last updated: September 2026',
  '',
  'Not a defamation statement. Nothing on this site is intended to defame,',
  'disparage, or harm any person, company, or product. All project descriptions',
  'describe my own original work and my own experience building it.',
  '',
  'Copyright and intellectual property:',
  '- All code, text, artwork, icons, and wallpapers on this site are original',
  '  creations by Namish Yadav, unless clearly credited otherwise.',
  '- The macOS-inspired look is an homage built from scratch. No Apple software,',
  '  artwork, or assets are used. This site is not affiliated with or endorsed by',
  '  Apple Inc. macOS and Apple are trademarks of Apple Inc.',
  '- Project names, company names, and product names mentioned belong to their',
  '  respective owners and are used only to describe my work.',
  '',
  'Good-faith notice: if you believe anything here infringes your rights or',
  'misrepresents you, email nam4sh@gmail.com and it will be reviewed and fixed',
  'promptly.',
  '',
  'This page is a good-faith statement, not legal advice.',
].join('\n')

/** Named text documents addressable by ref. */
export const textDocs: Record<string, TextDoc> = {
  about: { title: 'about.txt', body: aboutBody },
  contact: { title: 'contact.txt', body: contactBody },
  privacy: { title: 'privacy.txt', body: privacyBody },
  terms: { title: 'terms.txt', body: termsBody },
  cookies: { title: 'cookies.txt', body: cookiesBody },
  legal: { title: 'legal.txt', body: legalBody },
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
    {
      name: 'Legal',
      type: 'folder',
      children: [
        { name: 'privacy.txt', type: 'file', kind: 'text', ref: 'privacy' },
        { name: 'terms.txt', type: 'file', kind: 'text', ref: 'terms' },
        { name: 'cookies.txt', type: 'file', kind: 'text', ref: 'cookies' },
        { name: 'legal.txt', type: 'file', kind: 'text', ref: 'legal' },
      ],
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
