export interface ProjectDetails {
  /** What it is, when and why it was built. */
  overview: string[]
  /** What it does, as bullets. */
  features: string[]
  /** What it uses, and why that choice was made. */
  stack: { tech: string; why: string }[]
  /** How it works, end to end. */
  howItWorks: string[]
}

export interface Project {
  id: string
  name: string
  tagline: string
  description: string
  stack: string[]
  year: string
  category: string
  repoUrl?: string
  liveUrl?: string
  details: ProjectDetails
}

export interface ExperienceEntry {
  id: string
  role: string
  company: string
  year: string
  description: string
}

export const profile = {
  name: 'Namish Yadav',
  tagline: 'Open to Software Engineering Internships',
  sub: 'BCA student building full-stack web applications.',
  bio: '18-year-old BCA student building full-stack web applications. My working stack is TypeScript, Next.js, Tailwind CSS and MongoDB. I care about clean, type-safe code and I document my learning in public.',
  email: 'nam4sh@gmail.com',
  github: 'https://github.com/p3xz',
  x: 'https://x.com/NamishYadavv',
  website: 'https://namishhh.vercel.app',
  portfolio: 'https://namishhh.vercel.app',
  avatar: 'https://namishhh.vercel.app/pfp.jpg',
}

export const skillGroups: { title: string; file: string; skills: string[] }[] = [
  { title: 'Frontend', file: 'frontend.txt', skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'HTML5', 'CSS3', 'PostCSS'] },
  { title: 'Backend and Systems', file: 'backend.txt', skills: ['Node.js', 'REST APIs'] },
  { title: 'Databases', file: 'databases.txt', skills: ['MongoDB'] },
  { title: 'DevOps and Tooling', file: 'tools.txt', skills: ['Git', 'GitHub', 'VS Code', 'Vercel'] },
]

export const projects: Project[] = [
  {
    id: 'rideoxy',
    name: 'Rideoxy',
    tagline: 'Motorcycle telemetry in your pocket',
    description:
      'Motorcycle telemetry app with offline maps and local ride storage.',
    stack: ['React Native', 'Expo', 'MapLibre', 'SQLite'],
    year: '2026',
    category: 'Mobile',
    repoUrl: 'https://github.com/p3xz/rideoxy',
    liveUrl: 'https://brovxi.vercel.app',
    details: {
      overview: [
        'Rideoxy is a motorcycle telemetry app I built in 2026: it records your rides (GPS track, speed, distance) and works even where there is no network, which is exactly where the best rides happen.',
        'I built it because most ride trackers assume you are always online. On mountain roads you are not, so the whole app is designed offline-first: maps, recording, and storage all work without a connection.',
      ],
      features: [
        'Background GPS ride recording that keeps tracking with the screen off',
        'Offline maps: download regions ahead, navigate with zero signal',
        'Local ride history with per-ride stats, stored on the device',
        'Share and export rides',
      ],
      stack: [
        { tech: 'React Native + Expo', why: 'One codebase ships to both iOS and Android without writing native code.' },
        { tech: 'MapLibre', why: 'Open-source maps with offline tile packs. No Google Maps API key, no billing, and it works fully offline.' },
        { tech: 'expo-sqlite', why: 'Rides are stored in a real local database, so history survives app restarts and no-signal zones.' },
        { tech: 'expo-location + expo-task-manager', why: 'Background location tasks keep recording GPS even when the phone is locked.' },
        { tech: 'expo-router', why: 'File-based navigation keeps the screen structure simple as the app grows.' },
      ],
      howItWorks: [
        'You hit start and a background task begins logging GPS points every few seconds, writing them straight into a local SQLite database.',
        'The live map renders from downloaded MapLibre offline tiles, so the route draws even with no signal.',
        'When the ride ends, the full track, distance, and stats are saved locally and appear in your ride history. No account, no server, no sync needed.',
      ],
    },
  },
  {
    id: 'insidcode',
    name: 'InsidCode',
    tagline: 'Competitive programming, made social',
    description:
      '1v1 coding duels, Elo ranks, and 330+ problems.',
    stack: ['Next.js 15', 'Monaco', 'OnlineCompiler API'],
    year: '2026',
    category: 'Full-Stack Web',
    liveUrl: 'https://insidcode.vercel.app',
    details: {
      overview: [
        'InsidCode is a competitive programming platform I built in 2026: 330+ coding problems, 1v1 coding duels with Elo ranking, practice streaks, leaderboards, and friends. A serious, distraction-free arena for developers.',
        'I built it because existing judges feel lonely and generic. I wanted duels with real stakes, an Elo system like chess, and an editor that feels like home.',
      ],
      features: [
        '1v1 coding duels in realtime rooms with Elo rating updates',
        '330+ problems with automated hidden-test evaluation',
        'Monaco code editor (the VS Code engine) with a dark developer theme',
        'Python, JavaScript, C, C++, and Java, all compiled and run in isolation',
        'Practice streaks, achievements, leaderboards, and friend requests',
        'Password-free OAuth sign-in',
      ],
      stack: [
        { tech: 'Next.js 15', why: 'Full-stack in one codebase. The UI and the API routes deploy together, so there is no separate backend to manage.' },
        { tech: 'Monaco Editor', why: 'It is the same editor core VS Code uses, so writing code feels exactly like a real IDE.' },
        { tech: 'OnlineCompiler API', why: 'Running untrusted user code needs real sandboxing (strict 10s timeouts, 100 KB code and 32 KB stdin limits) instead of infrastructure I would have to secure myself.' },
        { tech: 'MongoDB + Mongoose', why: 'Flexible schemas fit problems, duel rooms, submissions, and leaderboards without migrations for every new feature.' },
        { tech: 'NextAuth', why: 'Password-free OAuth means I never store passwords at all. Nothing to leak.' },
        { tech: 'Resend + Zod + Tailwind', why: 'Resend handles transactional email, Zod validates every input at the API boundary, Tailwind keeps the UI fast to build.' },
      ],
      howItWorks: [
        'You pick a problem or join a duel room, then write code in the Monaco editor and hit submit.',
        'Your code is sent to the execution API, which compiles and runs it in an isolated sandbox against hidden test cases.',
        'Results come back and are stored in MongoDB: submissions, per-language solves, and duel outcomes.',
        'Win a duel and your Elo goes up; keep solving daily and your streak grows; everything feeds the leaderboards.',
      ],
    },
  },
  {
    id: 'gymsync',
    name: 'GymSync',
    tagline: 'Your workouts, even offline',
    description:
      'Offline-first workout tracker that lives entirely in your browser.',
    stack: ['Vanilla JS'],
    year: '2026',
    category: 'Client-Side Engineering',
    details: {
      overview: [
        'GymSync is an offline-first workout tracker that lives entirely in the browser. Log workouts, track progress, no account, no internet needed.',
        'It is my long-term learning project through my BCA: instead of dozens of disconnected tutorial apps, I keep improving one real application across phases (currently 8 of 8 in v1.0), learning real software engineering as it grows.',
      ],
      features: [
        'Log workouts with exercises, sets, reps, and weights',
        'Workout history and progress tracking',
        'Works fully offline: install it and train anywhere',
        'Apple-inspired premium UI',
      ],
      stack: [
        { tech: 'HTML5 + CSS3', why: 'Semantic markup and hand-written CSS. No framework hiding how the web actually works.' },
        { tech: 'Vanilla JavaScript (ES6)', why: 'A deliberate learning choice: master the fundamentals before reaching for frameworks.' },
        { tech: 'Local Storage API', why: 'All workout data stays on the device. Offline-first by construction: no backend, nothing to sync or leak.' },
      ],
      howItWorks: [
        'Everything runs client-side. When you log a set, it is written to Local Storage immediately.',
        'History and progress views read straight from Local Storage, so the app loads instantly and works with zero connectivity.',
        'Each development phase added a feature or an architectural cleanup. The app is a living record of the engineering practices I learned.',
      ],
    },
  },
  {
    id: 'discord-bot',
    name: 'GitHub Stats Discord Bot',
    tagline: 'Your GitHub grind, as a Discord command',
    description:
      'GitHub stats delivered as Discord commands.',
    stack: ['Java 17', 'JDA 5', 'GitHub GraphQL'],
    year: '2026',
    category: 'Backend Engineering',
    details: {
      overview: [
        'A Discord bot that answers GitHub questions right inside your server: look up any profile, repo, or year of contribution stats with a slash command, formatted as a rich Discord embed.',
        'I built it in 2026 because I kept context-switching between Discord and GitHub. Now the stats come to the chat.',
      ],
      features: [
        '/github profile: account age, last activity, followers, public repo count',
        '/github stats: stars, commits, PRs, and issues over the last year',
        '/github repo: stars, forks, watchers, language, license, last push',
        '/langs: language breakdown across your repos with text progress bars',
      ],
      stack: [
        { tech: 'Java 17 + Maven', why: 'Strong typing keeps an API-heavy bot honest, and the shade plugin builds one fat jar that runs anywhere.' },
        { tech: 'JDA (Java Discord API)', why: 'The standard way to talk to Discord from Java, with proper support for modern slash commands.' },
        { tech: 'GitHub REST + GraphQL APIs', why: 'REST covers profiles and repos, but contribution stats only exist behind the authenticated GraphQL API. Same data source the popular readme stats cards use.' },
        { tech: 'OkHttp + Gson', why: 'Fast HTTP client and JSON parsing for the GitHub calls.' },
      ],
      howItWorks: [
        'You run a slash command like /github stats username:p3xz. Discord routes it to the bot.',
        'The bot calls the GitHub API (REST for profiles and repos, GraphQL for contribution history) and fetches language stats for each repo concurrently to stay fast.',
        'Everything is formatted into a Discord embed and posted back in the channel.',
        'A GitHub token is optional but recommended: without one the API caps you at 60 requests an hour, with one you get 5,000.',
      ],
    },
  },
  {
    id: 'infernified',
    name: 'Infernified',
    tagline: 'Know if your password has leaked',
    description:
      'Password breach checker that never sends your password anywhere.',
    stack: ['Web Crypto API', 'k-anonymity'],
    year: '2026',
    category: 'Cybersecurity',
    details: {
      overview: [
        'Infernified is a password security analyzer that tells you if your password has leaked, without your password ever leaving your device.',
        'I built it in 2026 after learning how most "check my password" sites work: you type your real password into someone else\'s server and just trust them. That felt backwards, so I built the version where trust is not required.',
      ],
      features: [
        'Local password analysis: length, character classes, repeated and sequential patterns, keyboard patterns, common passwords',
        'Approximate entropy estimate and a 0 to 100 security score',
        'Breach exposure check against real leaked-password data',
        'No backend, no database, no account. Works offline for everything except the breach lookup',
      ],
      stack: [
        { tech: 'HTML + CSS + vanilla JavaScript', why: 'No build step, no dependencies, no server. Fewer moving parts means fewer places your password could leak.' },
        { tech: 'Web Crypto API', why: 'The password is hashed with SHA-1 locally in the browser using a proper crypto primitive, never a hand-rolled one.' },
        { tech: 'Have I Been Pwned API (k-anonymity)', why: 'Only the first 5 characters of the hash are sent. The API returns every matching suffix, and the comparison happens on your device. The full hash, and your password, never travel the network.' },
      ],
      howItWorks: [
        'Type a password and the analyzer scores it locally: length, uppercase, lowercase, numbers, symbols, repeated characters, sequences, and matches against common passwords feed a 0 to 100 score.',
        'For the breach check, the browser hashes your password with SHA-1 and sends only the first 5 hash characters to the Have I Been Pwned API.',
        'The API returns all hash suffixes starting with that prefix. Your browser checks whether your full hash is in the list, entirely locally.',
        'If it matches, that password has appeared in real breaches and you should change it everywhere you used it.',
      ],
    },
  },
  {
    id: 'mincratype',
    name: 'MINCRATYPE',
    tagline: 'Minecraft-themed typing test',
    description:
      'Typing test with a blocky on-screen keyboard that lights up as you type.',
    stack: ['React 19', 'TypeScript', 'Tailwind CSS'],
    year: '2026',
    category: 'Web Games',
    details: {
      overview: [
        'MINCRATYPE is a typing test dressed up in a Minecraft aesthetic. Pick a timer, mine words with your keyboard, and a blocky on-screen keyboard slides up and depresses in sync with every keystroke.',
        'I built it in 2026 because typing practice felt like a chore, and wrapping it in a game I actually wanted to look at fixed that. It is a fan-made parody concept, not affiliated with Mojang or Microsoft.',
      ],
      features: [
        'Timer modes: 15, 30, 60, and 120 seconds, starting on the first keystroke with instant restart on Tab',
        'Full on-screen keyboard that mirrors the physical keyboard in real time, with clickable keys for touch devices',
        'WPM, raw WPM, accuracy, and monkeytype-style consistency, with per-mode personal bests saved in localStorage',
      ],
      stack: [
        { tech: 'React 19 + TypeScript + Vite', why: 'Fast dev loop and a strict type system for the scoring engine, where an off-by-one in keystroke accounting ruins the metrics.' },
        { tech: 'Tailwind CSS', why: 'The blocky pixel styling is all utility classes, which kept the Minecraft look consistent without a separate stylesheet to maintain.' },
        { tech: 'Framer Motion', why: 'Handles the keyboard slide-up entrance and key-press animations without me hand-rolling animation state.' },
      ],
      howItWorks: [
        'Words are drawn from a curated list and the test engine listens to window-level keydown and keyup events.',
        'Every keystroke is scored as correct, incorrect, extra, or missed. The timer starts on the first key and Tab restarts instantly.',
        'The same listeners drive the on-screen keyboard, so the visual keys depress in exact sync with the physical keyboard.',
        'At the end, WPM, accuracy, and consistency are computed and the personal best for that timer mode is saved locally.',
      ],
    },
  },
]

export const experience: ExperienceEntry[] = [
  {
    id: 'rideoxy',
    role: 'Solo Developer',
    company: 'Rideoxy',
    year: '2026',
    description:
      'Built a motorcycle telemetry app with React Native and Expo: offline MapLibre maps, local SQLite storage.',
  },
  {
    id: 'insidcode',
    role: 'Solo Developer',
    company: 'InsidCode',
    year: '2026',
    description:
      'Built a competitive programming platform with Next.js 15 and Monaco: 1v1 duels, Elo ranks, 330+ problems.',
  },
]

export const quickLinks = [
  { id: 'github', name: 'GitHub', detail: 'github.com/p3xz', url: 'https://github.com/p3xz', hue: '#24292f' },
  { id: 'x', name: 'X', detail: '@NamishYadavv', url: 'https://x.com/NamishYadavv', hue: '#000000' },
  { id: 'insidcode', name: 'InsidCode', detail: 'Coding platform', url: 'https://insidcode.vercel.app', hue: '#6366f1' },
  { id: 'portfolio', name: 'Portfolio', detail: 'namishhh.vercel.app', url: 'https://namishhh.vercel.app', hue: '#0ea5e9' },
]
