import type { Unit, UnitIndexEntry } from '../types/unit'
import { loadDraft, listDraftIds } from './drafts'

const modules = import.meta.glob<{ default: Unit }>('../data/units/u*.json', { eager: true })

const units: Unit[] = Object.values(modules)
  .map((m) => m.default)
  .sort((a, b) => a.n - b.n)

export function listUnits(): UnitIndexEntry[] {
  const fromFiles = units.map((u) => {
    const draft = loadDraft(u._id)
    const active = draft || u
    return { id: u._id, n: active.n, tag: active.tag, en: active.en, fa: active.fa }
  })
  const fileIds = new Set(units.map((u) => u._id))
  const draftOnly = listDraftIds()
    .filter((id) => !fileIds.has(id))
    .map((id) => loadDraft(id))
    .filter((d): d is Unit => !!d)
    .map((d) => ({ id: d._id, n: d.n, tag: d.tag, en: d.en, fa: d.fa }))
  return [...fromFiles, ...draftOnly].sort((a, b) => a.n - b.n)
}

export function getUnit(id: string): Unit | undefined {
  const draft = loadDraft(id)
  const base = units.find((u) => u._id === id)
  return draft || base
}

export function getOriginalUnit(id: string): Unit | undefined {
  return units.find((u) => u._id === id)
}

export function allUnits(): Unit[] {
  return units
}

export function blankUnit(id: string, n: number): Unit {
  return {
    _id: id,
    n,
    hue: [(n * 47) % 360, 0.4, 0.25],
    tag: `Unit ${n}`,
    en: 'New lesson',
    fa: 'درس جدید',
    src: [],
    story: '',
    dialog: { h: 'دیالوگ', lab: '', lines: [] },
    grammar: { h: 'گرامر', lab: '', rows: [], elab: '', errors: [], trigger: '' },
    colls: { h: 'کالوکیشن', lab: '', groups: [], ex: [] },
    vocab: { h: 'واژه', lab: '', chips: [], ex: [] },
    listen: { h: 'شنیدن', lab: '', tactic: '', where: '', steps: [] },
    prod: { h: 'تولید', tasks: [] },
    take: '',
    quiz: [],
  }
}
