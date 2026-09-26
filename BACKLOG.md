# NamishOS Backlog

One item ships per daily commit. Every item below is a genuine, noticeable feature: a new mode, a new view, real customization, or sharing. No filler, no trivial tweaks, no empty commits. Check an item off only when it is built, build-verified, and pushed.

## Apps and modes

- [x] Spotlight search: Cmd+Space (or menu bar icon) opens a search overlay that finds folders, files, projects, terminal commands, and settings in one place
- [ ] Calculator app in the Dock: a working calculator with keyboard support, in NamishOS window chrome
- [ ] Lock screen: clock + "click to log back in" over a blurred wallpaper, distinct from sleep
- [ ] Mission Control: an overview that tiles every open window so you can pick one or close them in bulk
- [ ] Terminal `sysinfo` command: neofetch-style readout with an ASCII N logo, OS version, uptime, and project count
- [ ] Terminal tab-completion: complete command names and folder names for `open` with the Tab key
- [ ] Terminal themes: light, dark, and green-phosphor themes switchable from Settings

## Finder and files

- [ ] Genie minimize effect: true macOS-style genie animation when a window minimizes into the Dock (smooth scale minimize/restore already ships)
- [ ] Finder gallery view: a third view mode with large previews alongside the file list
- [ ] Finder search: filter the current folder's contents from the toolbar
- [ ] Right-click context menus: on the desktop (change wallpaper, open Terminal here) and on files (Open, Quick Look, Copy link)
- [ ] Window snapping: drag a window to a screen edge to snap it to half or full screen
- [ ] Global keyboard shortcuts: Cmd+W closes, Cmd+M minimizes, Cmd+1/Cmd+2 switch Finder views
- [ ] Quick Look slideshow: arrow-key navigation through images and project cards without closing the preview

## Customization and system

- [ ] System themes: light, dark, and accent-color themes for the menu bar, windows, and Dock, switchable from Settings
- [ ] Custom wallpaper upload: use your own image as the desktop background, persisted in localStorage
- [ ] Battery popover: the menu bar battery icon shows the real charge level via the Battery API when available
- [ ] Sound effects: subtle clicks on window open/close and a boot chime, with a mute toggle in Settings
- [ ] Verbose boot mode: optional boot log lines ("Mounting NamishHD...", "Calibrating determination...") during startup

## Notes, sharing, and portfolio power

- [ ] Notes app becomes real: create, edit, and delete notes, persisted in localStorage
- [ ] Web app search box: type a query to search the web and open results in a new tab
- [ ] Share project links: every project Quick Look gets a "Copy link" button for sharing
- [ ] Downloadable resume: generate a clean text/PDF resume from the portfolio data from the Contact folder
