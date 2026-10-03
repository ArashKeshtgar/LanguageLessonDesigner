<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { canRebuild, ctx, rebuildContext, resolveTag } from '../lib/context'
import CtxGate from '../components/ctx/CtxGate.vue'
import CtxSection from '../components/ctx/CtxSection.vue'
import TagChip from '../components/ctx/TagChip.vue'

const router = useRouter()
const q = ref('')
const msg = ref('')
const busy = ref(false)

const GROUPS: [string, string, string][] = [
  ['infra', 'زیرساخت', 'Servers + databases'],
  ['proj', 'پروژه‌های پرتفوی', 'Portfolio projects'],
  ['tool', 'ابزارها', 'Tools'],
  ['exp', 'سابقه‌ی کار', 'Experience'],
  ['bank', 'بقیه‌ی بانک حقیقت', 'Truth bank'],
]
const LEGEND: [string, string][] = [['P', '#P:rebiomed'], ['F', '#F:proj.x.y'], ['G', '#G:app-security'],
                                   ['W', '#W07'], ['B', '#B07'], ['I', '#I:servers.db']]

const hit = computed(() => (q.value.trim() ? resolveTag(q.value, ctx.value) : null))
const textHits = computed(() => {
  const s = q.value.trim().toLowerCase()
  if (!ctx.value || s.length < 3 || hit.value) return []
  const out: { tag: string; text: string }[] = []
  for (const p of ctx.value.packs) for (const f of p.facts)
    if ((f.claim + ' ' + f.fa).toLowerCase().includes(s)) out.push({ tag: f.tag, text: f.fa || f.claim })
  for (const b of ctx.value.bugs) if ((b.en + b.fa + b.cause + b.lesson).toLowerCase().includes(s)) out.push({ tag: b.tag, text: b.fa })
  for (const w of ctx.value.work) if ((w.en + w.fa + w.did).toLowerCase().includes(s)) out.push({ tag: w.tag, text: w.fa })
  for (const g of ctx.value.gaps) if ((g.slug + g.label).toLowerCase().includes(s)) out.push({ tag: g.tag, text: g.label })
  return out.slice(0, 25)
})
const seen = new Set<string>()
const uniqueHits = computed(() => { seen.clear(); return textHits.value.filter((h) => !seen.has(h.tag) && seen.add(h.tag)) })

function go() { if (hit.value) router.push(hit.value.route) }
function bal(b: Record<string, number>) {
  return Object.entries(b).filter(([, v]) => v).map(([k, v]) => `${v} ${k}`).join(' · ')
}
async function rebuild() {
  busy.value = true
  msg.value = ''
  try { await rebuildContext(); msg.value = 'از موتور دوباره ساخته شد ✓' }
  catch (e) { msg.value = 'نشد: ' + (e instanceof Error ? e.message : e) }
  finally { busy.value = false }
}
</script>

<template>
  <CtxGate>
    <div class="lesson-page" v-if="ctx">
      <div class="hero" style="--hero:#22303d">
        <div class="tag">Context engine · {{ ctx.generated.replace('T', ' ') }}</div>
        <h1>Context</h1>
        <div class="hfa">بانک حقیقت، پروژه‌ها، پیاده‌سازی، شکاف‌ها، کارها و باگ‌ها — با تگ</div>
        <div class="bal"><span v-for="(v, k) in ctx.counts" :key="k"><b>{{ v }}</b> {{ k }}</span></div>
      </div>

      <div class="sec">
        <form class="ctx-search" @submit.prevent="go">
          <input v-model="q" type="text" placeholder="#B07 · #P:rebiomed · #I:servers.db · یا یک کلمه مثل managed identity" />
          <button class="btn btn-primary" type="submit" :disabled="!hit">برو</button>
        </form>
        <div v-if="hit" class="fs" style="margin-top:.4em">→ <RouterLink :to="hit.route">{{ hit.label }}</RouterLink></div>
        <div v-else-if="uniqueHits.length" class="hits">
          <div v-for="h in uniqueHits" :key="h.tag" class="hit"><TagChip :tag="h.tag" /> <span>{{ h.text }}</span></div>
        </div>
        <div class="leg ctx-leg">
          <span v-for="[k, ex] in LEGEND" :key="k"><TagChip :tag="ex" /> {{ ctx.kinds[k].fa }}</span>
        </div>
      </div>

      <div class="ctx-quick">
        <RouterLink to="/context/gaps" class="qk" :style="{ '--k': ctx.kinds.G.color, '--t': ctx.kinds.G.tint }">
          <b>{{ ctx.counts.gaps }}</b> شکاف<small>Gaps</small></RouterLink>
        <RouterLink to="/context/bugs" class="qk" :style="{ '--k': ctx.kinds.B.color, '--t': ctx.kinds.B.tint }">
          <b>{{ ctx.counts.bugs }}</b> باگ<small>Bugs found</small></RouterLink>
        <RouterLink to="/context/work" class="qk" :style="{ '--k': ctx.kinds.W.color, '--t': ctx.kinds.W.tint }">
          <b>{{ ctx.counts.work }}</b> کار<small>Work log</small></RouterLink>
      </div>

      <template v-for="[kind, fa, en] in GROUPS" :key="kind">
        <CtxSection v-if="ctx.packs.some((p) => p.kind === kind)" kind="P" icon="case" :title="fa" :lab="en">
          <div class="lesson-list">
            <RouterLink v-for="p in ctx.packs.filter((x) => x.kind === kind)" :key="p.key" :to="`/context/p/${p.key}`"
                        class="lesson-card" :style="{ '--hero': p.colors.hero }">
              <div class="tag">{{ p.tag }}</div>
              <div class="en">{{ p.en }}</div>
              <div class="fa">{{ p.fa }}</div>
              <div class="cbal">{{ bal(p.balance) }}</div>
            </RouterLink>
          </div>
        </CtxSection>
      </template>

      <p v-if="canRebuild" class="fs" style="margin-top:1em">
        <button class="btn" :disabled="busy" @click="rebuild">{{ busy ? 'در حال ساخت…' : 'ساخت دوباره از موتور' }}</button>
        <span style="margin-right:.6em">{{ msg }}</span>
      </p>
    </div>
  </CtxGate>
</template>
