// Shape of src/data/proverbs.json — written by the proverb engine
// (SmartLedgerAI-JobPrep/Proverbs/engine, `python prov.py export`). Not personal data, so it is bundled.

export type Match = 'exact' | 'close' | 'loose' | 'none'
export type Amer = 'daily' | 'known' | 'dated' | 'uk'

export interface Proverb {
  n: number
  tag: string // #M007
  t: string // theme key
  where: string[] // situation keys
  fa: string
  mean: string
  en: string
  m: Match
  amer: Amer
  us: string // where Americans say it, in Persian
  ex: string // everyday example
  ex_work?: string
  alt?: string[]
  note?: string
}

export interface Label { en: string; fa: string; color?: string }

export interface Theme {
  key: string
  tag: string
  en: string
  fa: string
  intro: string
  colors: { hero: string; sub: string; txt: string; chip: string; chipInk: string }
}

export interface ProverbData {
  match: Record<Match, Label>
  amer: Record<Amer, Label>
  where: Record<string, Label>
  themes: Theme[]
  proverbs: Proverb[]
}
