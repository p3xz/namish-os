# NamishOS

A portfolio for **Namish Yadav**, reimagined as a complete desktop operating system. Boot it up, open folders, launch apps from the Dock, and run commands in a real interactive terminal. Everything on screen is portfolio content: bio, projects, experience, skills, and contact links.

## Run it

```bash
npm install
npm run dev      # local dev server
npm run build    # production build (tsc + vite)
```

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Framer Motion (window, menu, dock, and boot animations)
- lucide-react (every icon on screen)

## Key features

- Full boot, lock screen, sleep, and shutdown flow
- Real window manager: open, focus, minimize, zoom, drag, and resize windows
- Magnifying dock with original icon artwork
- Menu bar with dropdown menus wired to window actions
- Finder: virtual filesystem with sidebar, icon and list views, and text documents (including a Legal folder with privacy, terms, cookies, and legal notices)
- Quick Look previews for files and project cards
- Interactive terminal with commands like help, whoami, about, projects, skills, experience, contact, open, theme, sysinfo, and sudo
- Spotlight search across apps and files
- Mission Control overview of open windows
- Built-in apps: Notes, Web browser mock, Messages, Calculator, an InsidCode app (embeds the live InsidCode site), and an AI assistant window
- Switchable wallpaper variants in Settings
- About dialog with a parody spec sheet
- Boot, dock, menu, and popover animations powered by Framer Motion

## Project structure

```
src/
  App.tsx                 # boot / desktop / sleep / shutdown phases
  data/portfolio.ts       # all real portfolio content
  os/
    WindowManager.tsx     # window state: open, focus, minimize, zoom, drag
    Appearance.tsx        # wallpaper variant state
    filesystem.ts         # virtual file tree + text documents
    types.ts              # shared OS types
  components/
    BootScreen.tsx        # N logo + loading bar
    MenuBar.tsx           # top bar wiring (menus -> window actions)
    Desktop.tsx           # wallpaper, folder icons, layers
    Dock.tsx              # dock wiring + original icon artwork
    WindowFrame.tsx       # draggable window chrome, traffic lights
    WindowLayer.tsx       # renders every open window
    FinderWindow.tsx      # Files app: sidebar, icon/list views, navigation
    QuickLook.tsx         # file previews (text, project cards, image, contact)
    TerminalApp.tsx       # interactive terminal (help, open, projects, ...)
    WebApp.tsx / MailApp.tsx / NotesApp.tsx
    AboutDialog.tsx       # About NamishOS, parody spec sheet
    SettingsWindow.tsx    # wallpaper variants
    ui/
      mac-os-dock.tsx     # dock with cosine magnification
      mac-os-menu-bar.tsx # menu bar with dropdowns
      filesystem-item.tsx # animated file-tree for the sidebar
```

## What is real vs homage

- **Real:** every word of portfolio content (bio, projects, skills, experience, links, email) comes from [namishhh.vercel.app](https://namishhh.vercel.app). The avatar is the site's own photo.
- **Homage, not counterfeit:** the desktop metaphor is inspired by macOS, but every visual is original. The logo is a custom "N" mark, the wallpaper is a hand-built CSS aurora gradient, and all dock icons are lucide glyphs inside original gradient squircles. No Apple artwork, trademarks, or hotlinked assets are used anywhere. User-facing copy never says "macOS" or "Apple"; the OS is called **NamishOS**.

## Daily development

Features ship one per day from [BACKLOG.md](./BACKLOG.md). Each item is a genuine, noticeable improvement: a new mode, a new view, real customization, or sharing. Never filler, never empty commits.

## Credits

Built by [Namish Yadav](https://github.com/p3xz) as a personal portfolio, reimagined as a desktop OS. Live at [namish-os.vercel.app](https://namish-os.vercel.app).

Portfolio content (bio, projects, skills, experience, links, email) is his own, sourced from his personal site. The macOS-inspired desktop is homage, not a copy: every visual is original, and the OS is called **NamishOS**, not macOS.
