import { ref } from 'vue'
import type { Proverb, ProverbData } from '../types/proverbs'

// Bundled as its own lazy chunk (only the proverbs views import this module).
// Refresh it from the engine: `python prov.py export` writes src/data/proverbs.json.
import raw from '../data/proverbs.json'

export const pv = raw as ProverbData

// Persian/English normalisation — same rules as the engine's registry.norm()
export function norm(s: string | undefined): string {
  return (s || '')
    .replace(/[ً-ْ]/g, '')
    .replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/‌/g, ' ')
    .replace(/[آأإ]/g, 'ا').replace(/ة/g, 'ه')
    .toLowerCase()
}

const hay = new Map<number, string>(pv.proverbs.map((p) => [p.n, ' ' + norm(
  [p.fa, p.mean, p.en, p.us, p.ex, p.ex_work, p.note, ...(p.alt || [])].join(' '),
).replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ')]))

// Every word must start a word in the text — so «آب» doesn't match «کتاب».
export function matches(p: Proverb, q: string): boolean {
  const words = norm(q).replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(Boolean)
  const h = hay.get(p.n) || ''
  return words.every((w) => h.includes(' ' + w))
}

// #M7 · M007 · #m:7 → 7
export function tagNumber(s: string): number | null {
  const m = s.trim().replace(/^#/, '').match(/^[Mm]:?\s*0*(\d+)$/)
  return m ? Number(m[1]) : null
}

export function today(): Proverb {
  const day = Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000)
  return pv.proverbs[day % pv.proverbs.length]
}

export const themeOf = (key: string) => pv.themes.find((t) => t.key === key)!

// Practice progress — a per-viewer convenience only, so plain localStorage (may be unavailable).
const KEY = 'proverbs.known'
function readKnown(): number[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}
export const known = ref(new Set<number>(readKnown()))
export function setKnown(n: number, yes: boolean): void {
  const s = new Set(known.value)
  if (yes) s.add(n)
  else s.delete(n)
  known.value = s
  try { localStorage.setItem(KEY, JSON.stringify([...s])) } catch { /* private mode */ }
}
