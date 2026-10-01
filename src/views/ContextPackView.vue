<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { ctx, jumpTo } from '../lib/context'
import CtxGate from '../components/ctx/CtxGate.vue'
import CtxSection from '../components/ctx/CtxSection.vue'
import FactRow from '../components/ctx/FactRow.vue'
import GapRow from '../components/ctx/GapRow.vue'
import LogRow from '../components/ctx/LogRow.vue'
import ImplBlock from '../components/ctx/ImplBlock.vue'

const route = useRoute()
const pack = computed(() => ctx.value?.packs.find((p) => p.key === route.params.key))
const parts = computed(() => (ctx.value ? Object.keys(ctx.value.implParts).filter((k) => pack.value?.impl[k]) : []))
const gaps = computed(() => (ctx.value?.gaps || []).filter((g) => pack.value?.gaps.includes(g.slug)))
const work = computed(() => (ctx.value?.work || []).filter((w) => pack.value?.work.includes(w.n)))
const bugs = computed(() => (ctx.value?.bugs || []).filter((b) => pack.value?.bugs.includes(b.n)))
const rootStyle = computed(() => {
  const c = pack.value?.colors
  return c ? { '--hero': c.hero, '--hero-sub': c.sub, '--hero-txt': c.txt, '--chip': c.chip, '--chip-ink': c.chipInk } : {}
})
const neighbors = computed(() => {
  const list = ctx.value?.packs || []
  const i = list.findIndex((p) => p.key === route.params.key)
  return { prev: list[i - 1], next: list[i + 1] }
})

onMounted(() => jumpTo(route.query.at))
watch(() => [route.fullPath, !!ctx.value], () => jumpTo(route.query.at))
</script>

<template>
  <CtxGate>
    <div v-if="pack" class="lesson-page" :style="rootStyle">
      <div class="lesson-nav">
        <RouterLink to="/context">← همه‌ی بسته‌ها</RouterLink>
        <RouterLink v-if="neighbors.prev" :to="`/context/p/${neighbors.prev.key}`">‹ {{ neighbors.prev.en }}</RouterLink>
        <RouterLink v-if="neighbors.next" :to="`/context/p/${neighbors.next.key}`">{{ neighbors.next.en }} ›</RouterLink>
        <span class="spacer"></span>
        <a v-for="p in parts" :key="p" :href="`#`" @click.prevent="jumpTo(`I-${p}`)">{{ ctx!.implParts[p].fa.split(' ')[0] }}</a>
        <a href="#" @click.prevent="jumpTo('sec-facts')">فکت‌ها</a>
        <a href="#" @click.prevent="jumpTo('sec-bugs')">باگ‌ها</a>
      </div>

      <div class="hero">
        <div class="tag">{{ pack.kind }} · context pack</div>
        <h1>{{ pack.en }}</h1>
        <div class="hfa">{{ pack.fa }}</div>
        <div class="me">{{ pack.tag }}</div>
        <div class="src"><span v-for="([a, b], i) in pack.src" :key="i"><i>{{ a }}</i>{{ b }}</span></div>
        <div class="bal"><span v-for="(v, k) in pack.balance" :key="k"><b>{{ v }}</b> {{ k }}</span></div>
      </div>

      <CtxSection kind="S" icon="flag" title="داستان — در سه خط" lab="Story">
        <p class="fs">{{ pack.story || '—' }}</p>
      </CtxSection>

      <ImplBlock v-for="p in parts" :key="p" :pack="pack.key" :part="p" :data="pack.impl[p]" />

      <CtxSection kind="F" icon="shield" title="بانک حقیقت — فقط این‌ها در رزومه و مصاحبه"
                  :lab="`Truth bank · ${pack.facts.length} facts`" id="sec-facts">
        <FactRow v-for="f in pack.facts" :key="f.id" :fact="f" />
        <p v-if="!pack.facts.length" class="fs empty">این بسته در بانک حقیقت فکتی ندارد — هیچ‌چیزش در رزومه قابل ادعا نیست.</p>
        <p v-else class="fs hint-line">کلمه‌های <span class="no">خط‌خورده</span> برای همان فکت ممنوع‌اند.</p>
      </CtxSection>

      <CtxSection kind="G" icon="compare" title="شکاف‌ها — آنچه این بسته رویش اثر دارد" lab="Gaps · gap_tags.yml">
        <GapRow v-for="g in gaps" :key="g.slug" :gap="g" />
        <p v-if="!gaps.length" class="fs empty">شکافی به این بسته وصل نیست.</p>
      </CtxSection>

      <CtxSection kind="W" icon="steps" title="کارهایی که کردیم" lab="Work log">
        <LogRow v-for="w in work" :key="w.n" :item="w" />
        <p v-if="!work.length" class="fs empty">—</p>
      </CtxSection>

      <CtxSection kind="B" icon="search" title="باگ‌هایی که پیدا کردیم" lab="Bugs found" id="sec-bugs">
        <LogRow v-for="b in bugs" :key="b.n" :item="b" />
        <p v-if="!bugs.length" class="fs empty">—</p>
      </CtxSection>

      <div v-if="pack.take" class="take"><b>جمله‌ی معرفی (از بانک):</b><div class="en">{{ pack.take }}</div></div>
    </div>
    <div v-else class="lesson-page"><p>بسته پیدا نشد.</p><RouterLink to="/context">← بازگشت</RouterLink></div>
  </CtxGate>
</template>
