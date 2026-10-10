import type { Unit } from '../../types/unit'
import { allUnits } from '../units'
import { pv } from '../proverbs'
import { stripForSpeech } from '../speak'

// Every reviewable item in the app, turned into a flashcard. Ids are built from the
// item's own text (not its position), so reordering a lesson keeps your progress.

export type CardKind = 'word' | 'coll' | 'fix' | 'quiz' | 'proverb'

export interface Card {
  id: string
  kind: CardKind
  src: string // unit id, or 'pv'
  srcLabel: string
  order: number // curriculum order for introducing new cards
  front: string // HTML allowed (quiz questions use <i>)
  hint?: string // Persian help under the front
  answer: string // what you should produce
  answerFa?: string // Persian explanation after reveal
  example?: string // marked [[w:…]] sentence
  options?: string[] // multiple choice (answer is one of them)
  typed?: boolean // compare a typed answer
  speak?: string // English to read aloud
  lang?: string
}

const plain = (s: string) => stripForSpeech(s).replace(/\s+/g, ' ').trim()

function chipsOf(u: Unit) {
  return u.vocab.chips || (u.vocab.sets || []).flatMap((s) => s.chips)
}

function shuffle<T>(a: T[]): T[] {
  const r = [...a]
  for (let k = r.length - 1; k > 0; k--) {
    const j = Math.floor(Math.random() * (k + 1));
    [r[k], r[j]] = [r[j], r[k]]
  }
  return r
}

function unitCards(u: Unit): Card[] {
  const base = { src: u._id, srcLabel: `${u.tag} · ${u.en}`, lang: 'en-CA' }
  const out: Card[] = []
  let i = 0
  const order = () => u.n * 1000 + i++

  const chips = chipsOf(u)
  const words = chips.map((c) => c[0])
  for (const [en, fa, level] of chips) {
    const ex = u.vocab.ex.find(([s]) => s.includes(`[[w:${en}`) || s.toLowerCase().includes(en.toLowerCase()))
    const others = shuffle(words.filter((w) => w !== en)).slice(0, 3)
    out.push({
      ...base, id: `${u._id}:w:${en}`, kind: 'word', order: order(),
      front: fa, hint: level ? `واژه · ${level}` : 'واژه',
      answer: en, example: ex?.[0], speak: en,
      options: others.length >= 2 ? shuffle([en, ...others]) : undefined,
    })
  }

  for (const [right, fa, wrong] of u.colls.rows || []) {
    out.push({
      ...base, id: `${u._id}:c:${right}`, kind: 'coll', order: order(),
      front: fa, hint: 'کالوکیشن — انگلیسی‌اش چه می‌شود؟',
      answer: right, answerFa: wrong ? `نه: ${wrong}` : undefined, speak: right,
      options: wrong ? shuffle([right, wrong]) : undefined,
    })
  }

  for (const [wrong, right] of u.grammar.errors) {
    out.push({
      ...base, id: `${u._id}:e:${wrong}`, kind: 'fix', order: order(),
      front: `Correct it: <i>${wrong}</i>`, hint: 'غلط گرامری را درست کن',
      answer: right, typed: true, speak: right,
    })
  }

  for (const q of u.quiz) {
    if (q.old) continue
    out.push({
      ...base, id: `${u._id}:q:${plain(q.q)}`, kind: 'quiz', order: order(),
      front: q.q, hint: q.qfa || q.fa,
      answer: q.a, answerFa: q.afa, options: q.op ? shuffle(q.op) : undefined,
      typed: !q.op, speak: q.op || !q.q.includes('______') ? undefined : plain(q.q.replace('______', q.a)),
    })
  }
  return out
}

function proverbCards(): Card[] {
  return pv.proverbs.map((p) => ({
    id: `pv:${p.n}`, kind: 'proverb' as const, src: 'pv', srcLabel: `ضرب‌المثل ${p.tag}`,
    order: 100000 + p.n,
    front: p.fa, hint: p.mean,
    answer: p.en, answerFa: p.us, example: p.ex, speak: p.en, lang: 'en-US',
  }))
}

export interface CardFilter { lessons: boolean; proverbs: boolean; dailyProverbsOnly: boolean }

let cache: Card[] | null = null

// Draft-tagged units (e.g. u06, an older copy of u201) stay out of review.
export function allCards(): Card[] {
  if (!cache) {
    cache = [
      ...allUnits().filter((u) => !/draft/i.test(u.tag)).flatMap(unitCards),
      ...proverbCards(),
    ]
  }
  return cache
}

const dailyPv = new Set(pv.proverbs.filter((p) => p.amer === 'daily').map((p) => `pv:${p.n}`))

export function cardsFor(f: CardFilter): Card[] {
  return allCards().filter((c) => c.src === 'pv'
    ? f.proverbs && (!f.dailyProverbsOnly || dailyPv.has(c.id))
    : f.lessons)
}

export const KIND_FA: Record<CardKind, string> = {
  word: 'واژه', coll: 'کالوکیشن', fix: 'گرامر', quiz: 'کوئیز', proverb: 'ضرب‌المثل',
}
