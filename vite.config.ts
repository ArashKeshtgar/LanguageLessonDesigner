import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig, type Plugin } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

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
  plugins: [vue(), lessonApiPlugin()],
  server: {
    watch: {
      // PDFs aren't part of the module graph — writing one (e.g. from the
      // publish API above) shouldn't trigger a full page reload.
      ignored: ['**/public/pdf/**'],
    },
  },
})
