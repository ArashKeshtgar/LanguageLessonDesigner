import { reactive, watch } from 'vue'
import { applyDoc, store, uploadPayload, type SyncDoc } from './srs'

// Sync review progress with the VPS (lessons-sync behind Caddy, same origin:
// english.<domain>/api/sync and ctx.<domain>/api/sync). One owner, one secret key,
// entered once per device and kept in this browser. Without a key nothing is sent.
//
// When: on start, a few seconds after any change, when the app goes to the
// background, and when the connection comes back.

const KEY = 'review.sync'
const SYNC_URL = 'api/sync' // relative: works under any base path

export const sync = reactive({
  key: readKey(),
  state: 'off' as 'off' | 'busy' | 'ok' | 'error',
  last: 0, // ms of the last good sync
  msg: '',
})

function readKey(): string {
  try { return localStorage.getItem(KEY) || '' } catch { return '' }
}

// Signature of what the server last confirmed — a change is pushed only if the
// local state differs, so applying the server's answer doesn't ping-pong.
let lastSig = ''
const sig = () => JSON.stringify(uploadPayload())

export async function syncNow(): Promise<boolean> {
  if (!sync.key) { sync.state = 'off'; return false }
  sync.state = 'busy'
  const started = Date.now()
  try {
    const res = await fetch(SYNC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Sync-Key': sync.key },
      body: JSON.stringify(uploadPayload()),
    })
    if (res.status === 401) throw new Error('کلید همگام‌سازی اشتباه است')
    if (res.status === 429) throw new Error('چند بار کلید اشتباه — ده دقیقه بعد دوباره امتحان کن')
    if (!res.ok || !(res.headers.get('content-type') || '').includes('json')) throw new Error('سرور همگام‌سازی در دسترس نیست')
    applyDoc((await res.json()) as SyncDoc)
    lastSig = sig()
    sync.state = 'ok'
    sync.last = started
    sync.msg = ''
    return true
  } catch (e) {
    sync.state = 'error'
    sync.msg = e instanceof Error && /[؀-ۿ]/.test(e.message) ? e.message : 'اینترنت یا سرور در دسترس نیست'
    return false
  }
}

export async function connect(key: string): Promise<boolean> {
  sync.key = key.trim()
  const ok = await syncNow()
  try {
    if (ok) localStorage.setItem(KEY, sync.key)
  } catch { /* storage unavailable: works until the app closes */ }
  if (!ok) sync.key = ''
  return ok
}

export function disconnect(): void {
  sync.key = ''
  sync.state = 'off'
  try { localStorage.removeItem(KEY) } catch { /* ignore */ }
}

function changedSince(t: number) {
  return Object.fromEntries(Object.entries(store.cards).filter(([, c]) => (c.t || 0) > t))
}

let timer: ReturnType<typeof setTimeout> | undefined
watch(store, () => {
  if (!sync.key) return
  clearTimeout(timer)
  timer = setTimeout(() => { if (sig() !== lastSig) syncNow() }, 3000)
}, { deep: true })

if (typeof window !== 'undefined') {
  // Leaving the app (switching away on the phone): send now; keepalive lets it finish.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && sync.key && sig() !== lastSig) {
      clearTimeout(timer)
      fetch(SYNC_URL, {
        method: 'POST', keepalive: true,
        headers: { 'Content-Type': 'application/json', 'X-Sync-Key': sync.key },
        // keepalive bodies are capped at 64 KB: only cards answered since the last good sync
        body: JSON.stringify({ ...uploadPayload(), cards: changedSince(sync.last - 60000) }),
      }).catch(() => { /* next start retries */ })
    } else if (document.visibilityState === 'visible' && sync.key) syncNow()
  })
  window.addEventListener('online', () => { if (sync.key) syncNow() })
  if (sync.key) syncNow()
}
