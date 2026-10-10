// node --test server/
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { emptyDoc, mergeUpload } from './merge.mjs'

const card = (t, ivl = 1) => ({ due: 100 + ivl, ivl, ease: 2.5, reps: 1, lapses: 0, seen: 100, t })

test('cards: newest answer wins, whichever device sends it', () => {
  let d = mergeUpload(emptyDoc(), { dev: 'phone', cards: { a: card(10, 3), b: card(10) } })
  d = mergeUpload(d, { dev: 'pc01', cards: { a: card(5, 9), b: card(20, 7) } })
  assert.equal(d.cards.a.ivl, 3) // pc's copy of a is older
  assert.equal(d.cards.b.ivl, 7)
})

test('days: each device keeps its own log; re-sends are harmless', () => {
  let d = mergeUpload(emptyDoc(), { dev: 'phone', days: { 100: { n: 3, r: 2, ok: 4 } } })
  d = mergeUpload(d, { dev: 'pc01', days: { 100: { n: 5, r: 0, ok: 5, fin: true } } })
  d = mergeUpload(d, { dev: 'phone', days: { 100: { n: 3, r: 2, ok: 4 } } })
  assert.deepEqual(d.days.phone[100], { n: 3, r: 2, ok: 4 })
  assert.deepEqual(d.days.pc01[100], { n: 5, r: 0, ok: 5, fin: true })
})

test('reset drops older cards and all day logs; a stale device cannot bring them back', () => {
  let d = mergeUpload(emptyDoc(), { dev: 'phone', cards: { a: card(10) }, days: { 100: { n: 1, r: 0, ok: 1 } } })
  d = mergeUpload(d, { dev: 'pc01', resetAt: 50, cards: { b: card(60) } })
  assert.deepEqual(Object.keys(d.cards), ['b'])
  assert.deepEqual(d.days, {})
  d = mergeUpload(d, { dev: 'phone', resetAt: 0, cards: { a: card(10) }, days: { 100: { n: 1, r: 0, ok: 1 } } })
  assert.deepEqual(Object.keys(d.cards), ['b'])
  assert.deepEqual(d.days, {})
})

test('settings: last write wins; junk is ignored', () => {
  let d = mergeUpload(emptyDoc(), { settings: { goal: 10 }, settingsT: 5 })
  d = mergeUpload(d, { settings: { goal: 30 }, settingsT: 3 })
  assert.equal(d.settings.goal, 10)
  d = mergeUpload(d, { dev: '../x', cards: { c: 'nope', ['x'.repeat(400)]: card(1) }, days: { abc: {} } })
  assert.deepEqual(Object.keys(d.cards), [])
  assert.deepEqual(d.days, {})
})
