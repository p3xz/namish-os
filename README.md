# NamishOS

> A portfolio for Namish Yadav, reimagined as a complete desktop operating system you can boot up and explore, because a static page felt flat.

![Status](https://img.shields.io/badge/status-active-brightgreen) ![License](https://img.shields.io/badge/license-MIT-blue)

A portfolio piece, built because a static page felt flat. The desktop metaphor turns the content into something to explore: projects live in Finder and Quick Look, skills and experience answer in the Terminal, and the whole thing rewards clicking around. Everything on screen is portfolio content: bio, projects, experience, skills, and contact links. Live at [namish-os.vercel.app](https://namish-os.vercel.app).

## Features

- **Full boot flow**: boot, lock screen, sleep, and shutdown.
- **Real window manager**: open, focus, minimize, zoom, drag, and resize windows.
- **Magnifying dock**: with original icon artwork and a launch bounce.
- **Menu bar**: dropdown menus wired to window actions.
- **Finder**: a virtual filesystem with a sidebar, icon and list views, and text documents, including a Legal folder with privacy, terms, cookies, and legal notices.
- **Quick Look**: previews for files and project cards.
- **Interactive terminal**: commands like help, whoami, about, projects, skills, experience, contact, open, theme, sysinfo, and sudo.
- **Spotlight search**: search across apps and files.
- **Mission Control**: overview of open windows.
- **Built-in apps**: Notes, a web browser mock, Messages, Calculator, an InsidCode app that embeds the live InsidCode site, and an AI assistant window.
- **Settings**: switchable wallpaper variants.
- **About dialog**: with a parody spec sheet.
- **macOS-style animations**: boot, dock, menu, and popover animations powered by Framer Motion.

## Tech Stack

![TypeScript](https://skillicons.dev/icons?i=ts) ![React](https://skillicons.dev/icons?i=react) ![Vite](https://skillicons.dev/icons?i=vite) ![Tailwind CSS](https://skillicons.dev/icons?i=tailwind)

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Framer Motion (window, menu, dock, and boot animations)
- lucide-react (every icon on screen)

Why this stack:

- React + TypeScript: the entire desktop is interactive UI state (windows, focus, minimize, zoom, drag), and TypeScript keeps the window manager and virtual filesystem types honest.
- Vite: fast dev server, and the production build runs the TypeScript compiler before bundling.
- Tailwind CSS v4: all styling, including the hand-built aurora wallpaper gradient and the original icon artwork.
- Framer Motion: the macOS-style animations: spring window zoom on maximize and restore, the dock launch bounce, popover pop-ins, and the boot sequence.
- lucide-react: every icon on screen is a lucide glyph inside an original gradient shape, so nothing is copied from Apple.

## How it works

- `App.tsx` drives the OS phases: boot, lock screen, desktop, plus sleep and shutdown.
- `os/WindowManager.tsx` holds all window state (open, focus, minimize, zoom, drag, resize), and `components/WindowLayer.tsx` renders every open window inside draggable `WindowFrame` chrome.
- A virtual filesystem (`os/filesystem.ts`) powers Finder and Spotlight, and text documents plus project cards preview in Quick Look.
- All real portfolio content lives in `src/data/portfolio.ts`, so the apps, terminal, and browser mock all render the same bio, projects, skills, experience, and links.

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

## Quick Start

### Prerequisites

- Node.js and npm
- React 19
- Vite 7
- TypeScript 5.8
- Tailwind CSS v4

### Installation

1. Clone the repository:

```bash
git clone https://github.com/p3xz/namish-os.git
```

2. Move into the project folder:

```bash
cd namish-os
```

3. Install dependencies:

```bash
npm install
```

4. Start the dev server:

```bash
npm run dev
```

To build for production (TypeScript compiler, then the Vite bundle):

```bash
npm run build
```

## Usage

Run the dev server, open the Terminal app inside NamishOS, and type:

```bash
help
```

That lists every command, from whoami and about to open, theme, sysinfo, and sudo.

## What is real vs homage

- **Real:** every word of portfolio content (bio, projects, skills, experience, links, email) comes from [namishhh.vercel.app](https://namishhh.vercel.app). The avatar is the site's own photo.
- **Homage, not counterfeit:** the desktop metaphor is inspired by macOS, but every visual is original. The logo is a custom "N" mark, the wallpaper is a hand-built CSS aurora gradient, and all dock icons are lucide glyphs inside original gradient squircles. No Apple artwork, trademarks, or hotlinked assets are used anywhere. User-facing copy never says "macOS" or "Apple"; the OS is called **NamishOS**.

## Daily development

Built in September 2026; features ship one per day from [BACKLOG.md](./BACKLOG.md) ever since. Each item is a genuine, noticeable improvement: a new mode, a new view, real customization, or sharing. Never filler, never empty commits.

## Contributing

Contributions are welcome. Open an issue or a pull request; keep any change genuine and noticeable, in the spirit of the daily BACKLOG.md rhythm.

## Credits

Built by [Namish Yadav](https://github.com/p3xz) as a personal portfolio, reimagined as a desktop OS.

Portfolio content (bio, projects, skills, experience, links, email) is his own, sourced from his personal site. The macOS-inspired desktop is homage, not a copy: every visual is original, and the OS is called **NamishOS**, not macOS.

## License

Licensed under the MIT License. See [LICENSE](./LICENSE) for the full text.
