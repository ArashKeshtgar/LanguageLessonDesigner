export type Hue = [number, number, number]

export interface DialogLine {
  0: string // speaker
  1: string // english
  2: string // farsi
}

export interface Dialog {
  h: string
  lab: string
  lines: [string, string, string][]
}

export interface GrammarRow {
  0: string
  1: string
  2: string
}

export interface Grammar {
  h: string
  lab: string
  rows: [string, string, string][]
  elab: string
  errors: [string, string][]
  trigger: string
}

export interface CollGroup {
  h: string
  n: string
  ok: string[]
  no?: string
}

export interface Colls {
  h: string
  lab: string
  groups: CollGroup[]
  rows?: [string, string, string | null][]
  ex: [string, string][]
}

export interface VocabSet {
  u: string
  chips: [string, string, string?, string?][]
}

export interface Vocab {
  h: string
  lab: string
  sets?: VocabSet[]
  chips?: [string, string, string?, string?][]
  ex: [string, string][]
}

export interface CertRead {
  t: string
  body: [string, string][]
  qs: string[]
}

export interface Cert {
  h?: string
  lab?: string
  exam?: string
  areas?: string[]
  terms?: [string, string, string?][]
  read?: CertRead
  why?: string
}

export interface ListenRec {
  h?: string
  min?: string
  steps?: string[]
  watch?: [string, string, string][]
  compare?: [string, string][]
}

export interface Listen {
  h: string
  lab: string
  tactic: string
  where: string
  steps: string[]
  rec?: ListenRec
}

export interface ProdTask {
  k: string
  t: string
  lines?: number
}

export interface Prod {
  h: string
  lab?: string
  tasks?: ProdTask[]
  speak?: string
  write?: string
}

export interface QuizItem {
  k: string
  q: string
  op?: string[]
  qfa?: string
  fa?: string
  lines?: boolean
  a: string
  afa?: string
  old?: boolean
}

export interface Unit {
  _id: string
  n: number
  hue: Hue
  tag: string
  en: string
  fa: string
  src: [string, string][]
  books?: Record<string, number[]>
  chain?: { prev?: string; now?: string; next?: string }
  story: string
  dialog: Dialog
  grammar: Grammar
  colls: Colls
  vocab: Vocab
  cert?: Cert
  listen: Listen
  prod: Prod
  plan?: Record<string, number>
  take: string
  quiz: QuizItem[]
}

export interface UnitIndexEntry {
  id: string
  n: number
  tag: string
  en: string
  fa: string
}
