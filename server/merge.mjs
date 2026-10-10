// Merge rules for review progress synced between devices (phone, PC).
// Shared by the sync server; pure functions so they're easy to test.
//
//   cards     last write wins per card, by its `t` (ms of the last answer)
//   days      each device owns its own day log: days[dev][day] = {n, r, ok, fin}
//   settings  last write wins by settingsT
//   resetAt   "start over" on any device: drops every card answered before it
//             and every day log, everywhere

const MAX_CARDS = 20000
const num = (x, lo = 0, hi = 1e13) => (typeof x === 'number' && Number.isFinite(x) ? Math.min(hi, Math.max(lo, x)) : 0)

export function emptyDoc() {
  return { v: 1, cards: {}, days: {}, settings: null, settingsT: 0, resetAt: 0, updated: 0 }
}

function cleanCard(c) {
  if (!c || typeof c !== 'object') return null
  return {
    due: num(c.due, 0, 1e6), ivl: num(c.ivl, 0, 10000), ease: num(c.ease, 1, 10), reps: num(c.reps, 0, 1e5),
    lapses: num(c.lapses, 0, 1e5), seen: num(c.seen, 0, 1e6), t: num(c.t),
  }
}

function cleanDay(l) {
  if (!l || typeof l !== 'object') return null
  return { n: num(l.n, 0, 1e5), r: num(l.r, 0, 1e5), ok: num(l.ok, 0, 1e5), ...(l.fin ? { fin: true } : {}) }
}

const isDev = (s) => typeof s === 'string' && /^[A-Za-z0-9_-]{4,64}$/.test(s)

// Apply one device's upload to the stored doc. Returns the new doc (input untouched).
export function mergeUpload(doc, up) {
  const out = structuredClone(doc)
  if (!up || typeof up !== 'object') return out
  const upReset = num(up.resetAt)
  if (upReset > out.resetAt) {
    out.resetAt = upReset
    for (const [id, c] of Object.entries(out.cards)) if ((c.t || 0) < upReset) delete out.cards[id]
    out.days = {}
  }
  const stale = upReset < out.resetAt // this device hasn't heard of the latest reset yet

  if (up.cards && typeof up.cards === 'object') {
    for (const [id, raw] of Object.entries(up.cards)) {
      if (typeof id !== 'string' || id.length > 300) continue
      const c = cleanCard(raw)
      if (!c || c.t < out.resetAt) continue
      const have = out.cards[id]
      if (!have) {
        if (Object.keys(out.cards).length >= MAX_CARDS) continue
        out.cards[id] = c
      } else if (c.t > (have.t || 0)) out.cards[id] = c
    }
  }

  if (!stale && isDev(up.dev) && up.days && typeof up.days === 'object') {
    const mine = out.days[up.dev] || (out.days[up.dev] = {})
    for (const [day, raw] of Object.entries(up.days)) {
      if (!/^\d{1,7}$/.test(day)) continue
      const l = cleanDay(raw)
      if (!l) continue
      const h = mine[day]
      // counters only grow on the device that owns them; max() makes re-sends harmless
      mine[day] = h
        ? { n: Math.max(h.n, l.n), r: Math.max(h.r, l.r), ok: Math.max(h.ok, l.ok), ...(h.fin || l.fin ? { fin: true } : {}) }
        : l
    }
  }

  if (up.settings && typeof up.settings === 'object' && num(up.settingsT) > out.settingsT) {
    out.settings = up.settings
    out.settingsT = num(up.settingsT)
  }
  out.updated = Date.now()
  return out
}
