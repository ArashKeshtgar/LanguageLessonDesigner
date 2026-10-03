<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { known, pv, setKnown } from '../lib/proverbs'
import ProverbCard from '../components/pv/ProverbCard.vue'

// Flashcards: Persian first, try to say the American equivalent out loud, then reveal.
// Cards you don't know yet come first; "learned" is remembered in this browser only.
const w = ref('')
const daily = ref(true)
const showLearned = ref(false)
const reveal = ref(false)
const i = ref(0)

function shuffle<T>(a: T[]): T[] {
  const r = [...a]
  for (let k = r.length - 1; k > 0; k--) {
    const j = Math.floor(Math.random() * (k + 1));
    [r[k], r[j]] = [r[j], r[k]]
  }
  return r
}
const pool = computed(() => pv.proverbs.filter((p) => (!w.value || p.where.includes(w.value))
  && (!daily.value || p.amer === 'daily') && (showLearned.value || !known.value.has(p.n))))
// Reshuffle only when the filters change, not when a card is marked learned.
const deck = ref(shuffle(pool.value))
watch([w, daily, showLearned], () => { deck.value = shuffle(pool.value); i.value = 0; reveal.value = false })

const card = computed(() => deck.value[i.value])
const learnedHere = computed(() => pv.proverbs.filter((p) => (!w.value || p.where.includes(w.value))
  && (!daily.value || p.amer === 'daily') && known.value.has(p.n)).length)
const total = computed(() => pv.proverbs.filter((p) => (!w.value || p.where.includes(w.value))
  && (!daily.value || p.amer === 'daily')).length)

function next(learned?: boolean) {
  if (learned !== undefined && card.value) setKnown(card.value.n, learned)
  reveal.value = false
  i.value++
}
function restart() { deck.value = shuffle(pool.value); i.value = 0; reveal.value = false }
</script>

<template>
  <div class="lesson-page pv-page">
    <div class="lesson-nav"><RouterLink to="/proverbs">← همه‌ی ضرب‌المثل‌ها</RouterLink></div>
    <div class="hero" style="--hero:#5b3a1e">
      <div class="tag">Practice · flashcards</div>
      <h1>Say it like an American</h1>
      <div class="hfa">فارسی را ببین، معادل آمریکایی‌اش را بلند بگو، بعد کارت را برگردان</div>
      <div class="bal"><span><b>{{ learnedHere }}</b> / {{ total }} learned</span></div>
    </div>

    <div class="sec pv-filters">
      <div class="pv-who">
        <span class="pv-who-l">با چه کسی؟</span>
        <button class="btn" :class="{ 'btn-primary': !w }" @click="w = ''">همه</button>
        <button v-for="(lab, key) in pv.where" :key="key" class="btn" :class="{ 'btn-primary': w === key }"
                @click="w = w === key ? '' : String(key)">{{ lab.fa }}</button>
      </div>
      <div class="pv-row">
        <label class="pv-check"><input v-model="daily" type="checkbox" /> فقط روزمره‌ی آمریکا</label>
        <label class="pv-check"><input v-model="showLearned" type="checkbox" /> کارت‌های بلدشده را هم نشان بده</label>
      </div>
    </div>

    <div v-if="card" class="sec pv-card">
      <div class="pv-step">{{ i + 1 }} / {{ deck.length }}</div>
      <ProverbCard :p="card" :hide="!reveal" />
      <div class="pv-actions">
        <button v-if="!reveal" class="btn btn-primary" @click="reveal = true">نشانم بده</button>
        <template v-else>
          <button class="btn btn-primary" @click="next(true)">✓ بلد بودم</button>
          <button class="btn" @click="next(false)">هنوز نه</button>
        </template>
        <button class="btn" @click="next()">رد شو</button>
      </div>
    </div>
    <div v-else class="sec">
      <p class="fs">این دسته تمام شد. 🎉</p>
      <p class="fs" style="margin-top:.5em">
        <button class="btn btn-primary" @click="restart">دوباره</button>
        <button v-if="!showLearned" class="btn" style="margin-right:.5em" @click="showLearned = true">مرور بلدشده‌ها</button>
      </p>
    </div>
  </div>
</template>
