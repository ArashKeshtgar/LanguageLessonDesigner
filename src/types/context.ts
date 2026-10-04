// Shape of Context/engine/out/context.json (written by `python ctx.py export`).

export interface KindMeta { color: string; tint: string; en: string; fa: string }
export interface StatusMeta { en: string; color: string; fa: string }
export interface ImplPartMeta { fa: string; en: string; icon: string }

export interface Fact {
  id: string
  tag: string
  claim: string
  fa: string
  strength: string
  evidence: string
  forbidden: string[]
  file: string
  pack: string | null
}

export interface ImplPart {
  diagram?: string
  rows?: string[][]
  cmds?: string[]
}

export interface Pack {
  key: string
  tag: string
  kind: string
  en: string
  fa: string
  src: [string, string][]
  story: string
  take: string
  colors: { hero: string; sub: string; txt: string; chip: string; chipInk: string }
  balance: Record<string, number>
  facts: Fact[]
  gaps: string[]
  work: number[]
  bugs: number[]
  impl: Record<string, ImplPart>
}

export interface Gap {
  slug: string
  tag: string
  label: string
  status: 'closed' | 'partial' | 'open'
  facts: string[]
  packs: string[]
}

export interface WorkItem {
  n: number
  tag: string
  p: string[]
  d: string
  en: string
  fa: string
  did: string
  did_en?: string
  commit?: string
  facts?: string[]
  gaps?: string[]
}

export interface BugItem {
  n: number
  tag: string
  p: string[]
  d: string
  en: string
  fa: string
  sym?: string
  cause: string
  fix: string
  commit?: string
  lesson: string
  sum_en?: string
  facts?: string[]
  gaps?: string[]
}

export interface RecruitItem {
  id: string
  tag: string // #R:pitch.dev
  g: string
  fa: string
  en: string
  when: string
  say: string // what to say/write, English; {Name} {Agency} {Role} … are blanks
  why: string
  facts?: string[]
  refs?: string[]
  limit?: number
  dont?: string[]
}
export interface Agency { id: string; tag: string; name: string; url: string; focus: string; how: string }
export interface RecruitData {
  groups: { key: string; tag: string; fa: string; en: string; icon: string }[]
  items: RecruitItem[]
  agencies: Agency[]
}

export interface ContextData {
  generated: string
  kinds: Record<string, KindMeta>
  status: Record<string, StatusMeta>
  implParts: Record<string, ImplPartMeta>
  packs: Pack[]
  gaps: Gap[]
  work: WorkItem[]
  bugs: BugItem[]
  recruit?: RecruitData
  counts: Record<string, number>
}
