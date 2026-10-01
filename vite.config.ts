import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig, type Plugin } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Same-origin check for the dev API: the browser always sends Origin on a
// POST fetch, so a missing one is refused too, and the origin must be this
// dev server itself on a loopback host.
function isTrustedOrigin(origin: string | undefined, host: string | undefined): boolean {
  if (!origin || !host) return false
  try {
    const u = new URL(origin)
    const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(u.hostname)
    return loopback && u.host === host
  } catch {
    return false
  }
}

// The context engine (truth bank, projects, gaps, work, bugs) lives in the
// separate SmartLedgerAI-JobPrep folder. Its JSON holds personal data (contact
// details, work history, server and database layout), so it is served only by
// the dev server and never copied into src/, public/ or a production build.
const CONTEXT_ENGINE =
  process.env.CONTEXT_ENGINE_DIR || 'C:/Users/akesh/Downloads/SmartLedgerAI-JobPrep/Context/engine'

function isLoopbackHost(host: string | undefined): boolean {
  if (!host) return false
  try {
    return ['localhost', '127.0.0.1', '[::1]'].includes(new URL(`http://${host}`).hostname)
  } catch {
    return false
  }
}

// Read guard for personal data: the Host must be loopback (stops DNS
// rebinding, since this middleware runs before Vite's own host check) and a
// cross-site request (Origin / Sec-Fetch-Site) is refused.
function isLocalRead(req: { headers: Record<string, string | string[] | undefined> }): boolean {
  const host = req.headers.host as string | undefined
  const origin = req.headers.origin as string | undefined
  const site = req.headers['sec-fetch-site'] as string | undefined
  if (!isLoopbackHost(host)) return false
  if (origin && !isTrustedOrigin(origin, host)) return false
  return !site || site === 'same-origin' || site === 'none'
}

function contextApiPlugin(): Plugin {
  return {
    name: 'context-api',
    configureServer(server) {
      server.middlewares.use('/api/context', (req, res) => {
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.setHeader('Cache-Control', 'no-store')
        const sub = (req.url || '').split('?')[0].replace(/^\/+/, '')
        if (req.method === 'GET' && sub === '') {
          if (!isLocalRead(req)) {
            res.statusCode = 403
            res.end(JSON.stringify({ ok: false, error: 'forbidden' }))
            return
          }
          const file = path.join(CONTEXT_ENGINE, 'out', 'context.json')
          if (!existsSync(file)) {
            res.statusCode = 404
            res.end(JSON.stringify({ ok: false, error: `not built yet: ${file} — run python ctx.py export` }))
            return
          }
          res.end(readFileSync(file, 'utf-8'))
          return
        }
        if (req.method === 'POST' && sub === 'rebuild') {
          if (!isLocalRead(req) || !isTrustedOrigin(req.headers.origin, req.headers.host)) {
            res.statusCode = 403
            res.end(JSON.stringify({ ok: false, error: 'forbidden' }))
            return
          }
          const py = spawn('python', ['ctx.py', 'export'], { cwd: CONTEXT_ENGINE, env: { ...process.env, PYTHONIOENCODING: 'utf-8' } })
          let out = ''
          py.stdout.on('data', (d) => (out += d))
          py.stderr.on('data', (d) => (out += d))
          py.on('error', (e) => {
            res.statusCode = 500
            res.end(JSON.stringify({ ok: false, error: `python not found: ${e.message}` }))
          })
          py.on('close', (code) => {
            res.statusCode = code === 0 ? 200 : 500
            res.end(JSON.stringify({ ok: code === 0, log: out.trim() }))
          })
          return
        }
        res.statusCode = 405
        res.end(JSON.stringify({ ok: false, error: 'method not allowed' }))
      })
    },
  }
}

// Dev-only API so the edit form can write a lesson straight to its JSON file
// and regenerate its official PDF via the Python engine — never runs in a
// production/static build, only under `vite dev`.
function lessonApiPlugin(): Plugin {
  return {
    name: 'lesson-api',
    configureServer(server) {
      server.middlewares.use('/api/save-lesson/', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method not allowed')
          return
        }
        // CSRF guard: any website open while `vite dev` runs could otherwise
        // POST here (a text/plain "simple request" needs no CORS preflight)
        // and overwrite a lesson — which is rendered with v-html — and run
        // the PDF script. Only the edit form's own same-origin JSON fetch passes.
        if (!isTrustedOrigin(req.headers.origin, req.headers.host) ||
            !(req.headers['content-type'] || '').startsWith('application/json')) {
          res.statusCode = 403
          res.end(JSON.stringify({ ok: false, error: 'forbidden' }))
          return
        }
        const id = (req.url || '').replace(/^\/+/, '').split('?')[0]
        if (!id || !/^u[a-z0-9]+$/i.test(id)) {
          res.statusCode = 400
          res.end(JSON.stringify({ ok: false, error: 'invalid lesson id' }))
          return
        }
        let body = ''
        req.on('data', (chunk) => (body += chunk))
        req.on('end', () => {
          let unit: unknown
          try {
            unit = JSON.parse(body)
          } catch {
            res.statusCode = 400
            res.end(JSON.stringify({ ok: false, error: 'invalid JSON body' }))
            return
          }
          const unitsDir = path.join(__dirname, 'src', 'data', 'units')
          if (!existsSync(unitsDir)) mkdirSync(unitsDir, { recursive: true })
          const jsonPath = path.join(unitsDir, `${id}.json`)
          writeFileSync(jsonPath, JSON.stringify(unit, null, 2) + '\n', 'utf-8')

          const script = path.join(__dirname, 'scripts', 'generate_pdf.py')
          const py = spawn('python', [script, id], { cwd: __dirname })
          let out = ''
          let err = ''
          py.stdout.on('data', (d) => (out += d))
          py.stderr.on('data', (d) => (err += d))
          py.on('error', (e) => {
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.statusCode = 500
            res.end(JSON.stringify({ ok: false, savedFile: true, error: `python not found: ${e.message}` }))
          })
          py.on('close', (code) => {
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            if (code === 0) {
              res.statusCode = 200
              res.end(JSON.stringify({ ok: true, log: out.trim() }))
            } else {
              res.statusCode = 500
              res.end(JSON.stringify({ ok: false, savedFile: true, error: (err || out).trim() }))
            }
          })
        })
      })
    },
  }
}

// https://vite.dev/config/
// For a GitHub Pages build (served from /LanguageLessonDesigner/, not the
// domain root) pass `--base=/LanguageLessonDesigner/` on the CLI, e.g. the
// "build:pages" npm script below — local dev and a root-domain deploy both
// keep the default base of "/".
export default defineConfig({
  plugins: [vue(), lessonApiPlugin(), contextApiPlugin()],
  server: {
    watch: {
      // PDFs aren't part of the module graph — writing one (e.g. from the
      // publish API above) shouldn't trigger a full page reload.
      ignored: ['**/public/pdf/**'],
    },
  },
})
