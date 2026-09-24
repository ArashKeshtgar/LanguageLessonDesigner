import type { Unit, UnitIndexEntry } from '../types/unit'

const modules = import.meta.glob<{ default: Unit }>('../data/units/u*.json', { eager: true })

const units: Unit[] = Object.values(modules)
  .map((m) => m.default)
  .sort((a, b) => {
    // module-2 units (u201..u204) first by n, then standalone units (u06) after — keep insertion order stable by _id
    return a._id.localeCompare(b._id)
  })

export function listUnits(): UnitIndexEntry[] {
  return units.map((u) => ({ id: u._id, n: u.n, tag: u.tag, en: u.en, fa: u.fa }))
}

export function getUnit(id: string): Unit | undefined {
  return units.find((u) => u._id === id)
}

export function allUnits(): Unit[] {
  return units
}
