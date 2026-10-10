<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  dayToDate, dayTotal, doneToday, exportJson, forecast, importJson, plan, progressBySource,
  reminderIcs, resetAll, store, streak, today,
} from '../lib/review/srs'
import { connect, disconnect, sync, syncNow } from '../lib/review/sync'

// Today's plan, built from the spaced-repetition state: what's due, what's new,
// your streak, the next 7 days, and per-lesson progress.
const p = computed(() => plan())
const left = computed(() => p.value.due.length + p.value.fresh.length)
const done = computed(() => doneToday())
const goal = computed(() => store.settings.goal)
const pct = computed(() => Math.min(100, Math.round((done.value / Math.max(1, goal.value)) * 100)))
const st = computed(() => streak())
const fc = computed(() => forecast(7))
const fcMax = computed(() => Math.max(1, ...fc.value))
const prog = computed(() => progressBySource())
const acc = computed(() => { const l = dayTotal(today()); return l.n + l.r ? Math.round((l.ok / (l.n + l.r)) * 100) : null })
const dayName = (k: number) => k === 0 ? 'امروز' : k === 1 ? 'فردا'
  : dayToDate(today() + k).toLocaleDateString('fa-IR', { weekday: 'short' })

// Last 28 days as a small heat strip.
const heat = computed(() => Array.from({ length: 28 }, (_, k) => {
  const d = today() - 27 + k
  const l = dayTotal(d)
  const n = l.n + l.r
  return { d, n, lvl: n === 0 ? 0 : n < goal.value / 2 ? 1 : n < goal.value ? 2 : 3 }
}))

const showSettings = ref(false)
const msg = ref('')

function download(name: string, text: string, type: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([text], { type }))
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}
function addReminder() {
  download('english-review.ics', reminderIcs(location.href.replace(/#.*$/, '#/review')), 'text/calendar')
}
function backup() {
  download(`review-backup-${new Date().toISOString().slice(0, 10)}.json`, exportJson(), 'application/json')
}
function restore(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f) return
  f.text().then((t) => {
    try { msg.value = importJson(t) ? 'پیشرفت بازیابی شد ✓' : 'این فایل پشتیبان مرور نیست.' } catch { msg.value = 'فایل خراب است.' }
  })
}
const keyInput = ref('')
const syncLabel = computed(() => {
  if (sync.state === 'busy') return 'در حال همگام‌سازی…'
  if (sync.state === 'error') return sync.msg
  if (sync.state === 'ok') return `همگام شد · ${new Date(sync.last).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`
  return ''
})
async function doConnect() {
  if (await connect(keyInput.value)) { keyInput.value = ''; msg.value = 'وصل شد ✓ — پیشرفت این دستگاه با سرور یکی شد.' }
}

function reset() {
  if (window.confirm('همه‌ی پیشرفت مرور پاک شود؟ (قبلش پشتیبان بگیر)')) resetAll()
}
</script>

<template>
  <div class="lesson-page rv-page">
    <div class="hero" style="--hero:#1f4d3a">
      <div class="tag">Review · spaced repetition</div>
      <h1>Today's review</h1>
      <div class="hfa">برنامه‌ی امروز خودش ساخته می‌شود — هر کارتی را درست بگویی دیرتر برمی‌گردد، غلط بگویی فردا دوباره می‌آید</div>
    </div>

    <div class="sec rv-today">
      <div class="rv-ring" :style="{ '--p': pct }">
        <div><b>{{ done }}</b><small>/ {{ goal }}</small></div>
      </div>
      <div class="rv-today-body">
        <div class="rv-stats">
          <span class="rv-stat"><b>🔥 {{ st }}</b><small>روز پشت سر هم</small></span>
          <span class="rv-stat"><b>{{ p.due.length }}</b><small>مرور</small></span>
          <span class="rv-stat"><b>{{ p.fresh.length }}</b><small>کارت تازه</small></span>
          <span v-if="acc !== null" class="rv-stat"><b>{{ acc }}%</b><small>درست امروز</small></span>
        </div>
        <RouterLink v-if="left" to="/review/session" class="btn btn-primary rv-go">
          شروع مرور ({{ left }} کارت · حدود {{ Math.max(1, Math.round(left * 0.25)) }} دقیقه)
        </RouterLink>
        <p v-else class="fs rv-done">امروز تمام است ✓ — فردا کارت‌های تازه و مرورها خودشان می‌آیند.</p>
        <button v-if="sync.key" class="rv-sync" :class="sync.state" @click="syncNow">☁ {{ syncLabel }}</button>
      </div>
    </div>

    <div class="sec">
      <h3 class="rv-h">هفت روز آینده</h3>
      <div class="rv-fc">
        <div v-for="(n, k) in fc" :key="k" class="rv-fc-col">
          <span class="rv-fc-n">{{ n }}</span>
          <span class="rv-fc-bar" :style="{ height: (n / fcMax) * 70 + 4 + 'px' }"></span>
          <span class="rv-fc-d">{{ dayName(k) }}</span>
        </div>
      </div>
      <div class="rv-heat" title="۲۸ روز اخیر">
        <span v-for="h in heat" :key="h.d" :class="'l' + h.lvl" :title="`${dayToDate(h.d).toLocaleDateString('fa-IR')}: ${h.n}`"></span>
      </div>
    </div>

    <div class="sec">
      <h3 class="rv-h">پیشرفت هر بخش</h3>
      <div v-for="r in prog" :key="r.src" class="rv-prog">
        <div class="rv-prog-l">
          <RouterLink v-if="r.src !== 'pv'" :to="`/lesson/${r.src}`">{{ r.label }}</RouterLink>
          <RouterLink v-else to="/proverbs">{{ r.label }}</RouterLink>
          <small>{{ r.seen }}/{{ r.total }} دیده‌شده · {{ r.mature }} تثبیت‌شده</small>
        </div>
        <div class="rv-bar"><i class="m" :style="{ width: (r.mature / r.total) * 100 + '%' }"></i><i class="s" :style="{ width: ((r.seen - r.mature) / r.total) * 100 + '%' }"></i></div>
      </div>
    </div>

    <div class="sec">
      <button class="btn" @click="showSettings = !showSettings">⚙ تنظیمات، یادآور و پشتیبان</button>
      <div v-if="showSettings" class="rv-set">
        <label>کارت تازه از درس‌ها در روز <input v-model.number="store.settings.newLessons" type="number" min="0" max="50" /></label>
        <label>کارت تازه از ضرب‌المثل‌ها در روز <input v-model.number="store.settings.newProverbs" type="number" min="0" max="20" /></label>
        <label>هدف روزانه (برای حفظ رکورد) <input v-model.number="store.settings.goal" type="number" min="1" max="200" /></label>
        <label>حداکثر مرور در روز <input v-model.number="store.settings.maxReviews" type="number" min="10" max="500" /></label>
        <label class="pv-check"><input v-model="store.settings.lessons" type="checkbox" /> درس‌ها</label>
        <label class="pv-check"><input v-model="store.settings.proverbs" type="checkbox" /> ضرب‌المثل‌ها</label>
        <label class="pv-check"><input v-model="store.settings.dailyProverbsOnly" type="checkbox" /> فقط ضرب‌المثل‌های روزمره‌ی آمریکا</label>
        <hr />
        <div class="rv-row">
          <label>یادآور هر روز ساعت <input v-model="store.settings.remind" type="time" /></label>
          <button class="btn" @click="addReminder">📅 افزودن به تقویم</button>
        </div>
        <p class="rv-note">روی آیفون فایل را باز کن و «Add All» بزن — تقویم هر روز همان ساعت یادآوری می‌کند و با لمسش اپ باز می‌شود.</p>
        <hr />
        <h4 class="rv-h4">☁ همگام‌سازی گوشی و کامپیوتر</h4>
        <template v-if="sync.key">
          <div class="rv-row">
            <span class="rv-sync-st" :class="sync.state">{{ syncLabel || 'وصل' }}</span>
            <button class="btn" @click="syncNow">همگام‌سازی الان</button>
            <button class="btn btn-danger" @click="disconnect">قطع اتصال این دستگاه</button>
          </div>
          <p class="rv-note">هر جوابی که می‌دهی چند ثانیه بعد روی سرور می‌رود؛ دستگاه دیگر وقتی باز شود آن را می‌گیرد.</p>
        </template>
        <template v-else>
          <form class="rv-row" @submit.prevent="doConnect">
            <input v-model="keyInput" class="rv-key" type="password" dir="ltr" autocomplete="off" placeholder="sync key" />
            <button class="btn btn-primary" type="submit" :disabled="!keyInput.trim() || sync.state === 'busy'">وصل شو</button>
          </form>
          <p class="rv-note">کلید را یک بار روی هر دستگاه وارد کن. پیشرفت فعلی این دستگاه با سرور ادغام می‌شود (چیزی پاک نمی‌شود).</p>
          <p v-if="sync.state === 'error'" class="rv-note"><b>{{ sync.msg }}</b></p>
        </template>
        <hr />
        <div class="rv-row">
          <button class="btn" @click="backup">⬇ پشتیبان پیشرفت</button>
          <label class="btn">⬆ بازیابی <input type="file" accept="application/json,.json" hidden @change="restore" /></label>
          <button class="btn btn-danger" @click="reset">پاک کردن همه</button>
        </div>
        <p class="rv-note">پشتیبان یک فایل از پیشرفت این دستگاه است. «پاک کردن همه» بعد از همگام‌سازی، دستگاه‌های دیگر را هم پاک می‌کند.</p>
        <p v-if="msg" class="rv-note"><b>{{ msg }}</b></p>
      </div>
    </div>
  </div>
</template>
