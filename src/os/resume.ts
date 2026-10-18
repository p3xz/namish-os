import { profile, skillGroups, projects, experience } from '@/data/portfolio'

export const RESUME_PDF_NAME = 'Namish-Yadav-Resume.pdf'
export const RESUME_TXT_NAME = 'Namish-Yadav-Resume.txt'

/* ------------------------------------------------------------------ */
/* Plain-text resume, built straight from the portfolio data.          */
/* ------------------------------------------------------------------ */

export function buildResumeText(): string {
  const L: string[] = []
  L.push(profile.name)
  L.push(profile.tagline)
  L.push(profile.sub)
  L.push('')
  L.push(
    [
      profile.email,
      profile.github.replace('https://', ''),
      profile.linkedin.replace('https://', ''),
      profile.website.replace('https://', ''),
    ].join('  |  '),
  )
  L.push('')
  L.push('SUMMARY')
  L.push(profile.bio)
  L.push('')
  L.push('SKILLS')
  for (const g of skillGroups) L.push(`${g.title}: ${g.skills.join(', ')}`)
  L.push('')
  L.push('EXPERIENCE')
  for (const e of experience) {
    L.push(`${e.role}, ${e.company} (${e.year})`)
    L.push(e.description)
    L.push('')
  }
  L.push('PROJECTS')
  for (const p of projects) {
    L.push(`${p.name} (${p.year}) - ${p.tagline}`)
    for (const f of p.details.features.slice(0, 3)) L.push(`- ${f}`)
    L.push('')
  }
  L.push('EDUCATION')
  L.push('BCA, Kristu Jayanti University, 2026 - 2030')
  return L.join('\n').trimEnd() + '\n'
}

/* ------------------------------------------------------------------ */
/* Browser download helper.                                            */
/* ------------------------------------------------------------------ */

export function downloadBlob(data: BlobPart, filename: string, mime: string): void {
  const blob = new Blob([data], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

export function downloadResumePdf(): void {
  downloadBlob(buildResumePdf(), RESUME_PDF_NAME, 'application/pdf')
}

export function downloadResumeText(): void {
  downloadBlob(buildResumeText(), RESUME_TXT_NAME, 'text/plain')
}

/* ------------------------------------------------------------------ */
/* Minimal PDF generator: real, dependency-free PDF output.            */
/* Letters, Letter size, Helvetica family only (WinAnsi-safe text).    */
/* ------------------------------------------------------------------ */

const PAGE_W = 612
const PAGE_H = 792
const MARGIN_X = 56
const TOP = 736
const BOTTOM = 56

/** Replace characters outside WinAnsi with ASCII look-alikes. */
function sanitize(s: string): string {
  return s
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/\u2022/g, '-')
    .replace(/\u00a0/g, ' ')
    .replace(/[^\x20-\x7e]/g, '')
}

function pdfEscape(s: string): string {
  return sanitize(s).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

let measureCtx: CanvasRenderingContext2D | null = null
function measure(text: string, bold: boolean, size: number): number {
  if (!measureCtx) {
    const c = document.createElement('canvas')
    measureCtx = c.getContext('2d')
  }
  if (!measureCtx) return sanitize(text).length * size * 0.52
  measureCtx.font = `${bold ? 'bold' : ''} ${size}px Helvetica, Arial, sans-serif`.trim()
  return measureCtx.measureText(sanitize(text)).width * (72 / 96)
}

function wrap(text: string, bold: boolean, size: number, maxWidth: number): string[] {
  const words = sanitize(text).split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    const trial = line ? `${line} ${w}` : w
    if (measure(trial, bold, size) <= maxWidth || !line) {
      line = trial
    } else {
      lines.push(line)
      line = w
    }
  }
  if (line) lines.push(line)
  return lines
}

class PdfDoc {
  pages: string[] = []
  private y = TOP

  /** Current baseline y of the cursor, for callers that place text manually. */
  get cursor(): number {
    return this.y
  }

  private ensure(h: number) {
    if (this.y - h < BOTTOM) {
      this.pages.push('')
      this.y = TOP
    }
    if (this.pages.length === 0) this.pages.push('')
  }

  private op(s: string) {
    this.pages[this.pages.length - 1] += s + '\n'
  }

  text(x: number, y: number, s: string, bold: boolean, size: number, color = '0.12 0.12 0.12') {
    const font = bold ? '/F2' : '/F1'
    this.op(
      `BT ${font} ${size} Tf ${color} rg 1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm (${pdfEscape(s)}) Tj ET`,
    )
  }

  private line(text: string, x: number, bold: boolean, size: number, color = '0.12 0.12 0.12') {
    this.text(x, this.y, text, bold, size, color)
  }

  gap(h: number) {
    this.y -= h
  }

  name(text: string) {
    this.ensure(34)
    this.line(text, MARGIN_X, true, 22, '0.05 0.05 0.08')
    this.y -= 30
  }

  contact(text: string) {
    this.ensure(18)
    this.line(text, MARGIN_X, false, 9.5, '0.25 0.35 0.55')
    this.y -= 15
  }

  heading(text: string) {
    this.ensure(30)
    this.y -= 6
    this.line(text.toUpperCase(), MARGIN_X, true, 11, '0.05 0.05 0.08')
    this.y -= 15
    this.op(`0.78 0.78 0.82 RG 0.8 w ${MARGIN_X} ${(this.y + 9).toFixed(2)} m ${(PAGE_W - MARGIN_X).toFixed(2)} ${(this.y + 9).toFixed(2)} l S`)
    this.y -= 8
  }

  para(text: string, bold = false, size = 10.2) {
    const maxW = PAGE_W - MARGIN_X * 2
    for (const l of wrap(text, bold, size, maxW)) {
      this.ensure(15)
      this.line(l, MARGIN_X, bold, size)
      this.y -= size * 1.42
    }
  }

  bullet(text: string, size = 10.2) {
    const indent = MARGIN_X + 14
    const maxW = PAGE_W - indent - MARGIN_X
    const lines = wrap(text, false, size, maxW)
    lines.forEach((l, i) => {
      this.ensure(15)
      if (i === 0) this.line('-', MARGIN_X + 4, false, size)
      this.line(l, indent, false, size)
      this.y -= size * 1.42
    })
  }

  entry(title: string, meta: string, body: string, bodySize = 10.2) {
    this.ensure(30)
    const maxW = PAGE_W - MARGIN_X * 2
    const titleW = measure(title, true, 11)
    const metaW = measure(meta, false, 10.2)
    // Title on one line, meta right-aligned; meta drops below on overflow.
    this.line(title, MARGIN_X, true, 11)
    if (titleW + 8 + metaW <= maxW) {
      this.line(meta, PAGE_W - MARGIN_X - metaW, false, 10.2, '0.4 0.4 0.44')
      this.y -= 15.5
    } else {
      this.y -= 15.5
      this.line(meta, MARGIN_X, false, 10.2, '0.4 0.4 0.44')
      this.y -= 14.5
    }
    for (const l of wrap(body, false, bodySize, maxW)) {
      this.ensure(15)
      this.line(l, MARGIN_X, false, bodySize)
      this.y -= bodySize * 1.42
    }
    this.y -= 4
  }
}

/** Serialize finished page content streams into a complete PDF file. */
function serialize(streams: string[]): Uint8Array {
  const enc = new TextEncoder()
  const n = streams.length
  const pageNums: number[] = []
  const contentNums: number[] = []
  let next = 3
  for (let i = 0; i < n; i++) {
    pageNums.push(next++)
    contentNums.push(next++)
  }
  const f1 = next++
  const f2 = next++

  const bodies: string[] = []
  // 1: catalog, 2: pages
  bodies[1] = '<< /Type /Catalog /Pages 2 0 R >>'
  bodies[2] = `<< /Type /Pages /Kids [${pageNums.map((p) => `${p} 0 R`).join(' ')}] /Count ${n} >>`
  streams.forEach((s, i) => {
    bodies[pageNums[i]] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << /F1 ${f1} 0 R /F2 ${f2} 0 R >> >> /Contents ${contentNums[i]} 0 R >>`
    bodies[contentNums[i]] = `<< /Length ${enc.encode(s).length} >>\nstream\n${s}endstream`
  })
  bodies[f1] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
  bodies[f2] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>'

  let out = '%PDF-1.4\n'
  const offsets: number[] = [0]
  for (let i = 1; i < next; i++) {
    offsets[i] = enc.encode(out).length
    out += `${i} 0 obj\n${bodies[i]}\nendobj\n`
  }
  const xrefPos = enc.encode(out).length
  out += `xref\n0 ${next}\n`
  out += '0000000000 65535 f \n'
  for (let i = 1; i < next; i++) out += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`
  out += `trailer\n<< /Size ${next} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`
  return enc.encode(out)
}

/** Build the resume PDF from the portfolio data. Returns raw PDF bytes. */
export function buildResumePdf(): Uint8Array {
  const d = new PdfDoc()
  d.name(profile.name)
  d.text(MARGIN_X, d.cursor, profile.tagline, false, 11.5, '0.25 0.35 0.55')
  d.gap(17)
  d.contact(
    [
      profile.email,
      profile.github.replace('https://', ''),
      profile.linkedin.replace('https://', ''),
      profile.website.replace('https://', ''),
    ].join('  |  '),
  )
  d.gap(6)

  d.heading('Summary')
  d.para(profile.bio)
  d.gap(8)

  d.heading('Skills')
  for (const g of skillGroups) d.para(`${g.title}: ${g.skills.join(', ')}`)
  d.gap(8)

  d.heading('Experience')
  for (const e of experience) d.entry(`${e.role} - ${e.company}`, e.year, e.description)
  d.gap(6)

  d.heading('Projects')
  for (const p of projects) {
    const blurb = `${p.description} ${p.details.features.slice(0, 2).join(' ')}`
    d.entry(`${p.name} - ${p.tagline}`, p.year, blurb)
    // Stack line under each project, smaller and quieter.
    d.gap(-2)
    d.para(`Stack: ${p.stack.join(', ')}`, false, 9)
    d.gap(6)
  }

  d.heading('Education')
  d.entry('BCA', 'Kristu Jayanti University - 2026-2030', 'Bachelor of Computer Applications, currently in the first year.')

  return serialize(d.pages.filter((p) => p.length > 0))
}
