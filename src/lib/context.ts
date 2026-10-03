import { ref } from 'vue'
import type { ContextData } from '../types/context'

// The context data holds personal information, so it is never bundled. It
// always comes from /api/context: in dev the Vite server reads it from the
// context engine (vite.config.ts); on the server only the private ctx.<domain>
// site answers it (Caddy, behind basic auth, a copy pushed by
// push-context.ps1). Anywhere else (GitHub Pages, the public english.<domain>)
// it 404s and the Context section just says it is local-only.
export const ctx = ref<ContextData | null>(null)
export const ctxError = ref('')
export const ctxLoading = ref(false)
// Rebuilding runs the Python engine, which only the dev server can do.
export const canRebuild = import.meta.env.DEV

export async function loadContext(force = false): Promise<void> {
  if (ctx.value && !force) return
  ctxLoading.value = true
  ctxError.value = ''
  try {
    const res = await fetch('/api/context', { cache: 'no-store' })
    const isJson = (res.headers.get('content-type') || '').includes('json')
    if (!import.meta.env.DEV && (res.status === 404 || !isJson)) {
      ctxError.value = 'local-only'
      return
    }
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
    ctx.value = data as ContextData
  } catch (e) {
    ctxError.value = e instanceof Error ? e.message : String(e)
  } finally {
    ctxLoading.value = false
  }
}

export async function rebuildContext(): Promise<string> {
  const res = await fetch('/api/context/rebuild', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
  const data = await res.json()
  if (!res.ok || !data.ok) throw new Error(data.error || data.log || `HTTP ${res.status}`)
  await loadContext(true)
  return data.log || ''
}

// ---------------------------------------------------------------- tags
// Same forms the Python engine accepts: #B7 · B07 · #b:07 · #P:rebiomed · rebiomed
// · #F:proj.x.y · proj.x.y · #G:app-security · app-security · #I:servers.db
export type Resolved = { kind: string; route: string; label: string } | null

export function resolveTag(raw: string, d: ContextData | null): Resolved {
  if (!d) return null
  const s = raw.trim().replace(/^#/, '').trim()
  let m = s.match(/^([BbWw]):?\s*0*(\d+)$/)
  if (m) {
    const k = m[1].toUpperCase()
    const n = Number(m[2])
    const row = (k === 'B' ? d.bugs : d.work).find((x) => x.n === n)
    return row ? { kind: k, route: `/context/${k === 'B' ? 'bugs' : 'work'}?at=${row.tag.slice(1)}`, label: row.fa } : null
  }
  m = s.match(/^([PpFfGgIi]):(.+)$/)
  const kind = m ? m[1].toUpperCase() : ''
  const v = m ? m[2].trim() : s
  const pack = d.packs.find((p) => p.key === v || (kind === 'I' && v.startsWith(p.key + '.')))
  if ((kind === 'P' || !kind) && pack && pack.key === v) return { kind: 'P', route: `/context/p/${pack.key}`, label: pack.fa }
  if (kind === 'I' && pack) {
    const part = v.slice(pack.key.length + 1)
    return { kind: 'I', route: `/context/p/${pack.key}?at=I-${part || 'arch'}`, label: pack.fa }
  }
  if (kind === 'F' || !kind) {
    for (const p of d.packs) {
      const f = p.facts.find((x) => x.id === v)
      if (f) return { kind: 'F', route: `/context/p/${f.pack || p.key}?at=F-${encodeURIComponent(f.id)}`, label: f.fa }
    }
  }
  if (kind === 'G' || !kind) {
    const g = d.gaps.find((x) => x.slug === v)
    if (g) return { kind: 'G', route: `/context/gaps?at=G-${g.slug}`, label: g.label }
  }
  return null
}

export function kindOfTag(tag: string): string {
  const m = tag.match(/^#([A-Z])/)
  return m ? m[1] : 'P'
}

// Scroll to and flash the element whose id is in ?at= (ids may contain dots,
// so getElementById, never a CSS selector).
export function jumpTo(at: unknown): void {
  if (typeof at !== 'string' || !at) return
  requestAnimationFrame(() => {
    const el = document.getElementById(at)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.classList.remove('flash')
    void el.offsetWidth
    el.classList.add('flash')
  })
}
