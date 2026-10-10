// Review-progress sync for the lessons app — one owner, one document.
// Zero dependencies (node:http). Behind Caddy on english.<domain>/api/sync.
//
//   GET  /api/sync/health   200, no auth (container health check)
//   GET  /api/sync          the stored progress
//   POST /api/sync          merge this device's progress, answer with the result
//
// Auth: header X-Sync-Key (not Authorization: the ctx.<domain> copy sits behind
// Caddy basic auth, which already uses that header). The key comes from
// SYNC_KEY, or is generated once into DATA_DIR/key — read it on the server with
//   docker compose exec lessons-sync cat /data/key
import { createServer } from 'node:http'
import { randomBytes, timingSafeEqual, createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { emptyDoc, mergeUpload } from './merge.mjs'

const DATA = process.env.DATA_DIR || fileURLToPath(new URL('./data', import.meta.url))
const PORT = Number(process.env.PORT || 8787) // the container sets 8080
const MAX_BODY = 2 * 1024 * 1024
mkdirSync(DATA, { recursive: true })

function loadKey() {
  if (process.env.SYNC_KEY) return process.env.SYNC_KEY
  const f = join(DATA, 'key')
  if (!existsSync(f)) {
    writeFileSync(f, randomBytes(24).toString('base64url') + '\n', { mode: 0o600 })
    console.log(`generated a sync key in ${f}`)
  }
  return readFileSync(f, 'utf8').trim()
}
const KEY_HASH = createHash('sha256').update(loadKey()).digest()
const keyOk = (k) => typeof k === 'string' && timingSafeEqual(createHash('sha256').update(k).digest(), KEY_HASH)

const FILE = join(DATA, 'progress.json')
let doc = existsSync(FILE) ? JSON.parse(readFileSync(FILE, 'utf8')) : emptyDoc()
function save() {
  const tmp = FILE + '.tmp'
  writeFileSync(tmp, JSON.stringify(doc))
  renameSync(tmp, FILE) // atomic: a crash mid-write never leaves half a file
}

// Wrong keys: 10 per 10 minutes per client address, then 429.
const fails = new Map()
function blocked(ip) {
  const f = fails.get(ip)
  return !!f && f.n >= 10 && Date.now() - f.t < 600000
}
function failed(ip) {
  const f = fails.get(ip)
  if (!f || Date.now() - f.t > 600000) fails.set(ip, { n: 1, t: Date.now() })
  else f.n++
}

function send(res, code, body) {
  res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
  res.end(JSON.stringify(body))
}

const server = createServer((req, res) => {
  const url = (req.url || '').split('?')[0].replace(/\/+$/, '')
  if (url === '/api/sync/health') return send(res, 200, { ok: true })
  if (url !== '/api/sync') return send(res, 404, { error: 'not found' })
  if (req.method !== 'GET' && req.method !== 'POST') return send(res, 405, { error: 'method' })

  const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim()
  if (blocked(ip)) return send(res, 429, { error: 'too many wrong keys, try later' })
  if (!keyOk(req.headers['x-sync-key'])) {
    failed(ip)
    return setTimeout(() => send(res, 401, { error: 'wrong sync key' }), 400)
  }
  if (req.method === 'GET') return send(res, 200, doc)

  if (!/^application\/json/.test(req.headers['content-type'] || '')) return send(res, 415, { error: 'json only' })
  let size = 0
  const chunks = []
  req.on('data', (c) => {
    size += c.length
    if (size > MAX_BODY) { send(res, 413, { error: 'too large' }); req.destroy() } else chunks.push(c)
  })
  req.on('end', () => {
    if (size > MAX_BODY) return
    let up
    try { up = JSON.parse(Buffer.concat(chunks).toString('utf8')) } catch { return send(res, 400, { error: 'bad json' }) }
    doc = mergeUpload(doc, up)
    try { save() } catch (e) { console.error(e); return send(res, 500, { error: 'could not save' }) }
    send(res, 200, doc)
  })
})

server.listen(PORT, () => console.log(`lessons-sync on :${PORT}, data in ${DATA}`))
