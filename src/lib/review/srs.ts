import { reactive, watch } from 'vue'
import { cardsFor, type Card, type CardFilter } from './cards'

// Spaced repetition (an SM-2 variant, day-granular, like Anki's classic scheduler).
// Progress lives in this browser's localStorage — on the phone that's the home-screen
// app's own store. Export/import in the Review page moves it between devices.

export type Grade = 0 | 1 | 2 | 3 // again · hard · good · easy

export interface CardState {
  due: number // local day number
  ivl: number // days
  ease: number
  reps: number // successful reviews in a row
  lapses: number
  seen: number // day first studied
}

export interface DayLog { n: number; r: number; ok: number; fin?: boolean } // new · reviews · first-try correct · plan finished

export interface Settings extends CardFilter {
  newLessons: number // new lesson cards per day
  newProverbs: number // new proverb cards per day
  maxReviews: number
  goal: number // cards per day that count as "done" for the streak
  remind: string // HH:MM for the calendar reminder
}

interface Store { v: 1; cards: Record<string, CardState>; days: Record<number, DayLog>; settings: Settings }

const KEY = 'review.v1'
const DEFAULTS: Settings = {
  lessons: true, proverbs: true, dailyProverbsOnly: true,
  newLessons: 8, newProverbs: 3, maxReviews: 80, goal: 15, remind: '20:30',
}

function load(): Store {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || 'null')
    if (s && s.v === 1) return { ...s, settings: { ...DEFAULTS, ...s.settings } }
  } catch { /* private mode / bad JSON */ }
  return { v: 1, cards: {}, days: {}, settings: { ...DEFAULTS } }
}

export const store = reactive<Store>(load())
watch(store, () => {
  try { localStorage.setItem(KEY, JSON.stringify(store)) } catch { /* storage unavailable */ }
}, { deep: true })

export function today(): number {
  return Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000)
}
export const dayToDate = (d: number) => new Date(d * 86400000 + new Date().getTimezoneOffset() * 60000)

export function log(day = today()): DayLog {
  return store.days[day] || (store.days[day] = { n: 0, r: 0, ok: 0 })
}

// Grade the card once per session (its first answer); later retries in the same
// session only make you see it again, as Duolingo/Anki do.
export function grade(id: string, g: Grade, wasNew: boolean): void {
  const d = today()
  const s = store.cards[id] || { due: d, ivl: 0, ease: 2.5, reps: 0, lapses: 0, seen: d }
  const fuzz = (n: number) => (n < 3 ? n : Math.round(n * (0.95 + Math.random() * 0.1)))
  if (g === 0) {
    s.lapses += s.reps > 0 ? 1 : 0
    s.reps = 0
    s.ivl = 1
    s.ease = Math.max(1.3, s.ease - 0.2)
  } else {
    if (g === 1) {
      s.ivl = Math.max(1, Math.round(s.ivl * 1.2))
      s.ease = Math.max(1.3, s.ease - 0.15)
    } else if (s.reps === 0) s.ivl = g === 3 ? 4 : 1
    else if (s.reps === 1) s.ivl = g === 3 ? 6 : 3
    else s.ivl = Math.round(s.ivl * s.ease * (g === 3 ? 1.3 : 1))
    if (g === 3) s.ease += 0.15
    s.ivl = Math.min(365, fuzz(Math.max(1, s.ivl)))
    s.reps++
  }
  s.due = d + s.ivl
  store.cards[id] = s
  const l = log(d)
  if (wasNew) l.n++
  else l.r++
  if (g > 0) l.ok++
}

export interface Plan { due: Card[]; fresh: Card[]; newLeft: number }

// Today's plan: everything due (oldest first, capped), plus new cards in curriculum
// order up to today's remaining allowance per source.
export function plan(): Plan {
  const d = today()
  const st = store.settings
  const cards = cardsFor(st)
  const due = cards.filter((c) => store.cards[c.id] && store.cards[c.id].due <= d)
    .sort((a, b) => store.cards[a.id].due - store.cards[b.id].due)
    .slice(0, st.maxReviews)
  const introduced = (src: 'pv' | 'lesson') => Object.entries(store.cards)
    .filter(([id, s]) => s.seen === d && (src === 'pv') === id.startsWith('pv:')).length
  const unseen = cards.filter((c) => !store.cards[c.id]).sort((a, b) => a.order - b.order)
  const lessonNew = unseen.filter((c) => c.src !== 'pv').slice(0, Math.max(0, st.newLessons - introduced('lesson')))
  const pvNew = unseen.filter((c) => c.src === 'pv').slice(0, Math.max(0, st.newProverbs - introduced('pv')))
  // Interleave so proverbs don't all bunch at the end.
  const fresh: Card[] = []
  const step = Math.max(1, Math.ceil(lessonNew.length / Math.max(1, pvNew.length)))
  lessonNew.forEach((c, k) => { fresh.push(c); if ((k + 1) % step === 0 && pvNew.length) fresh.push(pvNew.shift()!) })
  fresh.push(...pvNew)
  return { due, fresh, newLeft: fresh.length }
}

export function streak(): number {
  const d = today()
  // A day counts when you hit the goal, or finished everything planned (a light day).
  const done = (x: number) => { const l = store.days[x]; return !!l && (!!l.fin || l.n + l.r >= store.settings.goal) }
  let k = done(d) ? d : d - 1 // today still counts as "open" until midnight
  let n = 0
  while (done(k)) { n++; k-- }
  return n
}

export const doneToday = () => { const l = store.days[today()]; return l ? l.n + l.r : 0 }

// Cards due on each of the next n days (day 0 = today, includes overdue).
export function forecast(n = 7): number[] {
  const d = today()
  const out = new Array(n).fill(0)
  const ids = new Set(cardsFor(store.settings).map((c) => c.id))
  for (const [id, s] of Object.entries(store.cards)) {
    if (!ids.has(id)) continue
    const k = Math.max(0, s.due - d)
    if (k < n) out[k]++
  }
  return out
}

// "Mature" = interval of three weeks or more (Anki's definition).
export function progressBySource(): { src: string; label: string; total: number; seen: number; mature: number }[] {
  const m = new Map<string, { src: string; label: string; total: number; seen: number; mature: number }>()
  for (const c of cardsFor(store.settings)) {
    const label = c.src === 'pv' ? 'ضرب‌المثل‌ها' : c.srcLabel
    const r = m.get(c.src) || { src: c.src, label, total: 0, seen: 0, mature: 0 }
    r.total++
    const s = store.cards[c.id]
    if (s) { r.seen++; if (s.ivl >= 21) r.mature++ }
    m.set(c.src, r)
  }
  return [...m.values()]
}

export function exportJson(): string {
  return JSON.stringify(store)
}
export function importJson(text: string): boolean {
  const s = JSON.parse(text)
  if (!s || s.v !== 1 || typeof s.cards !== 'object') return false
  store.cards = s.cards
  store.days = s.days || {}
  store.settings = { ...DEFAULTS, ...s.settings }
  return true
}
export function resetAll(): void {
  store.cards = {}
  store.days = {}
}

// A daily repeating calendar event that opens the app — the reminder that works on
// iPhone without a push server (Calendar alerts even when the app is closed).
export function reminderIcs(url: string): string {
  const [h, m] = store.settings.remind.split(':').map(Number)
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  const date = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`
  const t = `${p(h)}${p(m)}00`
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Arash Workbench//Review//EN', 'BEGIN:VEVENT',
    `UID:review-${date}@workbench`, `DTSTAMP:${date}T000000Z`,
    `DTSTART:${date}T${t}`, 'DURATION:PT15M', 'RRULE:FREQ=DAILY',
    'SUMMARY:English review (10 min)', `URL:${url}`, `DESCRIPTION:${url}`,
    'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:English review', 'TRIGGER:PT0M', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n')
}
