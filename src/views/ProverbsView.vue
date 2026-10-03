<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { known, matches, pv, tagNumber, today } from '../lib/proverbs'
import { jumpTo } from '../lib/context'
import ProverbCard from '../components/pv/ProverbCard.vue'

// /proverbs?w=family&t=money&q=صبر&daily=1&at=M038 — filters live in the URL so a link reopens the same view.
const route = useRoute()
const router = useRouter()
const str = (v: unknown) => (typeof v === 'string' ? v : '')

const q = ref(str(route.query.q))
const w = ref(str(route.query.w))
const t = ref(str(route.query.t))
const daily = ref(route.query.daily === '1')

const day = today()
const tagHit = computed(() => {
  const n = tagNumber(q.value)
  return n ? pv.proverbs.find((p) => p.n === n) : undefined
})
const rows = computed(() => {
  if (tagHit.value) return [tagHit.value]
  return pv.proverbs.filter((p) => (!w.value || p.where.includes(w.value)) && (!t.value || p.t === t.value)
    && (!daily.value || p.amer === 'daily') && (!q.value.trim() || matches(p, q.value)))
})
const countIn = (key: string) => pv.proverbs.filter((p) => p.where.includes(key)).length

watch([q, w, t, daily], () => {
  const query: Record<string, string> = {}
  if (q.value.trim()) query.q = q.value.trim()
  if (w.value) query.w = w.value
  if (t.value) query.t = t.value
  if (daily.value) query.daily = '1'
  router.replace({ query })
})
onMounted(() => jumpTo(route.query.at))
</script>

<template>
  <div class="lesson-page pv-page">
    <div class="hero" style="--hero:#5b3a1e">
      <div class="tag">Persian proverbs · American English</div>
      <h1>Proverbs</h1>
      <div class="hfa">ضرب‌المثل فارسی ← معادلی که یک آمریکایی واقعاً می‌گوید، با خانواده، دوست، همسایه، فروشنده… و سر کار</div>
      <div class="bal">
        <span><b>{{ pv.proverbs.length }}</b> proverbs</span>
        <span><b>{{ pv.proverbs.filter((p) => p.amer === 'daily').length }}</b> daily US</span>
        <span><b>{{ known.size }}</b> learned</span>
      </div>
    </div>

    <div class="sec pv-today">
      <div class="pv-today-h">
        <b>ضرب‌المثل امروز</b>
        <RouterLink to="/proverbs/practice" class="btn btn-primary">تمرین با کارت ←</RouterLink>
      </div>
      <ProverbCard :p="day" />
    </div>

    <div class="sec pv-filters">
      <input v-model="q" type="search" class="pv-q" placeholder="جستجو: صبر، دوست، Rome، talk… یا #M038" />
      <div class="pv-who">
        <span class="pv-who-l">با چه کسی؟</span>
        <button class="btn" :class="{ 'btn-primary': !w }" @click="w = ''">همه</button>
        <button v-for="(lab, key) in pv.where" :key="key" class="btn" :class="{ 'btn-primary': w === key }"
                @click="w = w === key ? '' : String(key)">{{ lab.fa }} <small>{{ countIn(String(key)) }}</small></button>
      </div>
      <div class="pv-row">
        <select v-model="t">
          <option value="">همه‌ی موضوع‌ها</option>
          <option v-for="th in pv.themes" :key="th.key" :value="th.key">{{ th.fa }} · {{ th.en }}</option>
        </select>
        <label class="pv-check"><input v-model="daily" type="checkbox" /> فقط چیزهایی که آمریکایی‌ها هر روز می‌گویند</label>
        <span class="pv-count">{{ rows.length }} / {{ pv.proverbs.length }}</span>
      </div>
    </div>

    <div class="sec">
      <ProverbCard v-for="p in rows" :key="p.n" :p="p" />
      <p v-if="!rows.length" class="empty">چیزی پیدا نشد — فیلترها را کمتر کن.</p>
    </div>
  </div>
</template>
