import type { Unit } from '../types/unit'

const KEY_PREFIX = 'lld:draft:'

export function loadDraft(id: string): Unit | null {
  try {
    const raw = localStorage.getItem(KEY_PREFIX + id)
    return raw ? (JSON.parse(raw) as Unit) : null
  } catch {
    return null
  }
}

export function saveDraft(id: string, unit: Unit): void {
  try {
    localStorage.setItem(KEY_PREFIX + id, JSON.stringify(unit))
  } catch {
    // localStorage unavailable — draft simply won't persist across reloads
  }
}

export function clearDraft(id: string): void {
  try {
    localStorage.removeItem(KEY_PREFIX + id)
  } catch {
    // ignore
  }
}

export function hasDraft(id: string): boolean {
  try {
    return localStorage.getItem(KEY_PREFIX + id) !== null
  } catch {
    return false
  }
}

export function listDraftIds(): string[] {
  const ids: string[] = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(KEY_PREFIX)) ids.push(k.slice(KEY_PREFIX.length))
    }
  } catch {
    // ignore
  }
  return ids
}
