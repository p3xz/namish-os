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
