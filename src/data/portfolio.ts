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
  website: 'https://insidcode.vercel.app',
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
      'A motorcycle telemetry mobile app. It records ride data, draws routes on offline-friendly maps and keeps everything stored locally on the device.',
    stack: ['React Native', 'Expo', 'MapLibre', 'SQLite'],
    year: '2026',
    category: 'Mobile',
    repoUrl: 'https://github.com/p3xz/rideoxy',
    liveUrl: 'https://brovxi.vercel.app',
  },
  {
    id: 'insidcode',
    name: 'InsidCode',
    tagline: 'Competitive programming, made social',
    description:
      'A competitive programming platform with live 1v1 coding duels, Elo ranks and 330+ problems. Built with Next.js 15, a Monaco editor and the OnlineCompiler API.',
    stack: ['Next.js 15', 'Monaco', 'OnlineCompiler API'],
    year: '2026',
    category: 'Full-Stack Web',
    liveUrl: 'https://insidcode.vercel.app',
  },
  {
    id: 'gymsync',
    name: 'GymSync',
    tagline: 'Your workouts, even offline',
    description:
      'An offline-first fitness tracker that runs entirely in the browser. Log sets, track progress and never lose data to a bad connection.',
    stack: ['Vanilla JS'],
    year: '2026',
    category: 'Client-Side Engineering',
  },
  {
    id: 'discord-bot',
    name: 'GitHub Stats Discord Bot',
    tagline: 'Your GitHub grind, as a Discord command',
    description:
      'A Discord bot that pulls GitHub statistics through the GraphQL API and renders them right inside your server.',
    stack: ['Java 17', 'JDA 5', 'GitHub GraphQL'],
    year: '2026',
    category: 'Backend Engineering',
  },
  {
    id: 'infernified',
    name: 'Infernified',
    tagline: 'Know if your password has leaked',
    description:
      'A password security analyzer that checks breaches without ever sending your password anywhere, using k-anonymity and the Web Crypto API.',
    stack: ['Web Crypto API', 'k-anonymity'],
    year: '2026',
    category: 'Cybersecurity',
  },
]

export const experience: ExperienceEntry[] = [
  {
    id: 'rideoxy',
    role: 'Solo Developer',
    company: 'Rideoxy',
    year: '2026',
    description:
      'Designed and built a motorcycle telemetry mobile app with React Native and Expo. Offline map rendering with MapLibre and local persistence with SQLite.',
  },
  {
    id: 'insidcode',
    role: 'Solo Developer',
    company: 'InsidCode',
    year: '2026',
    description:
      'Designed and built a competitive programming platform with Next.js 15 and the Monaco editor, powered by the OnlineCompiler API. Shipped live 1v1 coding duels, Elo ranks and 330+ problems.',
  },
]

export const quickLinks = [
  { id: 'github', name: 'GitHub', detail: 'github.com/p3xz', url: 'https://github.com/p3xz', hue: '#24292f' },
  { id: 'x', name: 'X', detail: '@NamishYadavv', url: 'https://x.com/NamishYadavv', hue: '#000000' },
  { id: 'insidcode', name: 'InsidCode', detail: 'Coding platform', url: 'https://insidcode.vercel.app', hue: '#6366f1' },
  { id: 'portfolio', name: 'Portfolio', detail: 'namishhh.vercel.app', url: 'https://namishhh.vercel.app', hue: '#0ea5e9' },
]
