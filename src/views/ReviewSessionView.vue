<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import type { Card } from '../lib/review/cards'
import { KIND_FA } from '../lib/review/cards'
import { grade, log, plan, store, type Grade } from '../lib/review/srs'
import { mark } from '../lib/mark'
import { speak } from '../lib/speak'
import SpeakButton from '../components/SpeakButton.vue'

// One session: due reviews and new cards mixed. A card is graded by its first answer;
// if you miss it, it comes back a few cards later until you get it (not re-graded).
interface Item { c: Card; isNew: boolean; graded: boolean; opts?: string[] }

function shuffle<T>(a: T[]): T[] {
  const r = [...a]
  for (let k = r.length - 1; k > 0; k--) {
    const j = Math.floor(Math.random() * (k + 1));
    [r[k], r[j]] = [r[j], r[k]]
  }
  return r
}

function item(c: Card, isNew: boolean): Item {
  return { c, isNew, graded: false, opts: c.options && shuffle(c.options) }
}

const p = plan()
const queue = ref<Item[]>(mix(
  shuffle(p.due).map((c) => item(c, false)),
  p.fresh.map((c) => item(c, true)),
))
const total = queue.value.length
const finished = ref(0)
const right = ref(0)
const reveal = ref(false)
const picked = ref<string | null>(null)
const typedAns = ref('')
const verdict = ref<boolean | null>(null) // auto-check result for choice/typed cards
const input = ref<HTMLInputElement | null>(null)

// New cards spread among reviews, not all at the end.
function mix(rev: Item[], fresh: Item[]): Item[] {
  if (!rev.length) return fresh
  const out: Item[] = []
  const every = Math.max(1, Math.round(rev.length / Math.max(1, fresh.length)))
  rev.forEach((r, k) => { out.push(r); if ((k + 1) % every === 0 && fresh.length) out.push(fresh.shift()!) })
  return [...out, ...fresh]
}

const cur = computed(() => queue.value[0])
// New words start as multiple choice (recognise); after two good reviews you must recall.
const mode = computed<'choice' | 'typed' | 'recall'>(() => {
  const it = cur.value
  if (!it) return 'recall'
  const s = store.cards[it.c.id]
  if (it.c.options && (it.c.kind !== 'word' || !s || s.reps < 2)) return 'choice'
  if (it.c.typed) return 'typed'
  return 'recall'
})
const opts = computed(() => cur.value?.opts || [])

const normA = (s: string) => s.toLowerCase().replace(/<[^>]+>/g, '').replace(/[’‘]/g, "'")
  .replace(/[^\p{L}\p{N}' ]/gu, ' ').replace(/\s+/g, ' ').trim()

function choose(o: string) {
  if (picked.value) return
  picked.value = o
  verdict.value = o === cur.value.c.answer
  reveal.value = true
  sayAnswer()
}
function check() {
  // Answers are often fragments ("is waiting"), so a full sentence that contains them counts.
  const t = ` ${normA(typedAns.value)} `
  const a = normA(cur.value.c.answer)
  verdict.value = !!a && t.trim() !== '' && t.includes(a.startsWith("'") ? `${a} ` : ` ${a} `) // 'm finishing ⊂ I'm finishing
  reveal.value = true
  sayAnswer()
}
function show() { reveal.value = true; sayAnswer() }
function sayAnswer() { if (cur.value.c.speak) speak(cur.value.c.speak, 1, cur.value.c.lang) }

const pct = computed(() => Math.round((finished.value / Math.max(1, total)) * 100))

function answer(g: Grade) {
  const it = queue.value.shift()!
  if (!it.graded) {
    grade(it.c.id, g, it.isNew)
    it.graded = true
    if (g > 0) right.value++
  }
  if (g === 0) { // again soon, with the choices in a new order
    if (it.opts) it.opts = shuffle(it.opts)
    queue.value.splice(Math.min(3, queue.value.length), 0, it)
  }
  else finished.value++
  reveal.value = false
  picked.value = null
  typedAns.value = ''
  verdict.value = null
  if (!queue.value.length) log().fin = true
  nextTick(() => input.value?.focus())
}

function onKey(e: KeyboardEvent) {
  if (!cur.value || (e.target as HTMLElement).tagName === 'INPUT') return
  if (reveal.value && verdict.value !== null) { // auto-checked: Enter/space continues with that verdict
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); answer(verdict.value ? 2 : 0) }
  } else if (!reveal.value && e.key === ' ') { e.preventDefault(); if (mode.value === 'recall') show() }
  else if (reveal.value && ['1', '2', '3', '4'].includes(e.key)) answer((Number(e.key) - 1) as Grade)
  else if (!reveal.value && mode.value === 'choice' && /^[1-9]$/.test(e.key)) { const o = opts.value[Number(e.key) - 1]; if (o) choose(o) }
}
onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="lesson-page rv-page">
    <div class="lesson-nav">
      <RouterLink to="/review">✕ پایان</RouterLink>
      <div class="rv-progress"><i :style="{ width: pct + '%' }"></i></div>
      <span class="rv-count">{{ finished }}/{{ total }}</span>
    </div>

    <div v-if="cur" class="sec rv-card" :class="{ ok: verdict === true, bad: verdict === false }">
      <div class="rv-meta">
        <span class="rv-kind" :class="cur.c.kind">{{ KIND_FA[cur.c.kind] }}</span>
        <span v-if="cur.isNew" class="rv-new">تازه</span>
        <small>{{ cur.c.srcLabel }}</small>
      </div>

      <div class="rv-front" :class="{ en: cur.c.kind === 'fix' || cur.c.kind === 'quiz' }" v-html="cur.c.front"></div>
      <div v-if="cur.c.hint" class="rv-hint">{{ cur.c.hint }}</div>

      <!-- multiple choice -->
      <div v-if="mode === 'choice'" class="rv-opts">
        <button v-for="(o, k) in opts" :key="o" class="rv-opt"
                :class="{ right: reveal && o === cur.c.answer, wrong: picked === o && o !== cur.c.answer }"
                :disabled="!!picked" @click="choose(o)"><small>{{ k + 1 }}</small>{{ o }}</button>
      </div>

      <!-- type the answer -->
      <form v-else-if="mode === 'typed' && !reveal" class="rv-type" @submit.prevent="check">
        <input ref="input" v-model="typedAns" dir="ltr" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Type the answer…" />
        <button class="btn btn-primary" type="submit">بررسی</button>
        <button class="btn" type="button" @click="show">نمی‌دانم</button>
      </form>

      <div v-else-if="mode === 'recall' && !reveal" class="rv-actions">
        <p class="rv-say">اول بلند به انگلیسی بگو، بعد ببین 🗣️</p>
        <button class="btn btn-primary" @click="show">نشانم بده</button>
      </div>

      <div v-if="reveal" class="rv-back">
        <div class="rv-ans en">
          <span>{{ cur.c.answer }}</span>
          <SpeakButton v-if="cur.c.speak" :text="cur.c.speak" :lang="cur.c.lang" />
        </div>
        <div v-if="mode === 'typed' && typedAns" class="rv-you en">You: {{ typedAns }}</div>
        <div v-if="cur.c.answerFa" class="rv-afa">{{ cur.c.answerFa }}</div>
        <div v-if="cur.c.example" class="rv-ex en">
          <span v-html="mark(cur.c.example)"></span>
          <SpeakButton :text="cur.c.example" :lang="cur.c.lang" />
        </div>

        <!-- auto-checked: right → good/easy, wrong → again (or "I was right" for typos) -->
        <div v-if="verdict !== null" class="rv-actions">
          <template v-if="verdict">
            <button class="btn btn-primary" @click="answer(2)">✓ درست — ادامه</button>
            <button class="btn" @click="answer(3)">خیلی آسان بود</button>
          </template>
          <template v-else>
            <button class="btn btn-primary" @click="answer(0)">ادامه</button>
            <button v-if="mode === 'typed' && typedAns" class="btn" @click="answer(2)">درست گفته بودم</button>
          </template>
        </div>
        <div v-else class="rv-grades">
          <button class="g0" @click="answer(0)"><b>یادم نبود</b><small>۱ · فردا</small></button>
          <button class="g1" @click="answer(1)"><b>سخت</b><small>۲</small></button>
          <button class="g2" @click="answer(2)"><b>خوب</b><small>۳</small></button>
          <button class="g3" @click="answer(3)"><b>آسان</b><small>۴</small></button>
        </div>
      </div>
    </div>

    <div v-else class="sec rv-end">
      <div class="rv-big">🎉</div>
      <h2>آفرین! جلسه‌ی امروز تمام شد</h2>
      <p class="fs" v-if="total">{{ total }} کارت · {{ Math.round((right / total) * 100) }}% درست در اولین تلاش</p>
      <p class="fs" v-else>امروز چیزی برای مرور نمانده.</p>
      <RouterLink to="/review" class="btn btn-primary">برگشت به برنامه</RouterLink>
    </div>
  </div>
</template>
