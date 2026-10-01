<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { ctx, jumpTo } from '../lib/context'
import CtxGate from '../components/ctx/CtxGate.vue'
import CtxSection from '../components/ctx/CtxSection.vue'
import GapRow from '../components/ctx/GapRow.vue'
import LogRow from '../components/ctx/LogRow.vue'

// One page for the three cross-project lists: /context/gaps · /context/bugs · /context/work
const route = useRoute()
const list = computed(() => route.meta.list as 'gaps' | 'bugs' | 'work')
const pack = ref('')

const HEAD = {
  gaps: { en: 'Gaps', fa: 'همه‌ی شکاف‌ها — بسته، نیمه، باز', tag: 'from gap_tags.yml' },
  bugs: { en: 'Bugs', fa: 'باگ‌هایی که پیدا کردیم — نشانه، علت، رفع، درس', tag: 'interview material' },
  work: { en: 'Work done', fa: 'کارهایی که کردیم — به ترتیب تاریخ', tag: 'work log' },
}
const packsInList = computed(() => {
  if (!ctx.value || list.value === 'gaps') return []
  const keys = new Set((list.value === 'bugs' ? ctx.value.bugs : ctx.value.work).flatMap((x) => x.p))
  return ctx.value.packs.filter((p) => keys.has(p.key))
})
const rows = computed(() => {
  if (!ctx.value) return []
  const src = list.value === 'bugs' ? ctx.value.bugs : ctx.value.work
  const r = pack.value ? src.filter((x) => x.p.includes(pack.value)) : src
  return list.value === 'work' ? [...r].sort((a, b) => (a.d + a.n).localeCompare(b.d + b.n)) : r
})
const gapGroups = computed(() =>
  (['closed', 'partial', 'open'] as const).map((s) => ({ s, items: (ctx.value?.gaps || []).filter((g) => g.status === s) })))

onMounted(() => jumpTo(route.query.at))
watch(() => [route.fullPath, !!ctx.value], () => { pack.value = ''; jumpTo(route.query.at) })
</script>

<template>
  <CtxGate>
    <div class="lesson-page" v-if="ctx" style="--hero:#22303d">
      <div class="lesson-nav">
        <RouterLink to="/context">← همه‌ی بسته‌ها</RouterLink>
        <RouterLink v-for="l in (['gaps', 'bugs', 'work'] as const)" :key="l" :to="`/context/${l}`"
                    :class="{ on: l === list }">{{ HEAD[l].en }}</RouterLink>
      </div>
      <div class="hero">
        <div class="tag">{{ HEAD[list].tag }}</div>
        <h1>{{ HEAD[list].en }}</h1>
        <div class="hfa">{{ HEAD[list].fa }}</div>
        <div v-if="list === 'gaps'" class="bal">
          <span v-for="g in gapGroups" :key="g.s"><b>{{ g.items.length }}</b> {{ ctx.status[g.s].en.toLowerCase() }}</span>
        </div>
      </div>

      <template v-if="list === 'gaps'">
        <CtxSection v-for="g in gapGroups" :key="g.s" kind="G" :icon="g.s === 'closed' ? 'shield' : g.s === 'partial' ? 'steps' : 'compare'"
                    :title="`شکاف‌های ${ctx.status[g.s].fa}`" :lab="`${ctx.status[g.s].en} · ${g.items.length}`">
          <GapRow v-for="x in g.items" :key="x.slug" :gap="x" />
        </CtxSection>
        <p class="fs" style="margin-top:.8em">وضعیت فقط از متن خود gap_tags.yml خوانده می‌شود. برای بستن شکاف، اول شاهد در بانک حقیقت، بعد برچسب.</p>
      </template>

      <template v-else>
        <div class="sec ctx-filter">
          <button class="btn" :class="{ 'btn-primary': !pack }" @click="pack = ''">همه</button>
          <button v-for="p in packsInList" :key="p.key" class="btn" :class="{ 'btn-primary': pack === p.key }"
                  @click="pack = p.key">{{ p.en }}</button>
        </div>
        <CtxSection :kind="list === 'bugs' ? 'B' : 'W'" :icon="list === 'bugs' ? 'search' : 'steps'"
                    :title="list === 'bugs' ? 'باگ‌ها' : 'کارنامه'" :lab="`${rows.length} items`">
          <LogRow v-for="x in rows" :key="x.n" :item="x" show-packs />
        </CtxSection>
      </template>
    </div>
  </CtxGate>
</template>
