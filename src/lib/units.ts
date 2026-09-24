import type { Unit, UnitIndexEntry } from '../types/unit'
import { loadDraft } from './drafts'

const modules = import.meta.glob<{ default: Unit }>('../data/units/u*.json', { eager: true })

const units: Unit[] = Object.values(modules)
  .map((m) => m.default)
  .sort((a, b) => a.n - b.n)

export function listUnits(): UnitIndexEntry[] {
  return units.map((u) => {
    const draft = loadDraft(u._id)
    const active = draft || u
    return { id: u._id, n: active.n, tag: active.tag, en: active.en, fa: active.fa }
  })
}

export function getUnit(id: string): Unit | undefined {
  const base = units.find((u) => u._id === id)
  if (!base) return undefined
  return loadDraft(id) || base
}

export function getOriginalUnit(id: string): Unit | undefined {
  return units.find((u) => u._id === id)
}

export function allUnits(): Unit[] {
  return units
}
