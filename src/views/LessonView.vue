<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { getUnit, listUnits } from '../lib/units'
import { shades } from '../lib/shades'
import HeroBlock from '../components/HeroBlock.vue'
import StorySection from '../components/StorySection.vue'
import DialogSection from '../components/DialogSection.vue'
import GrammarSection from '../components/GrammarSection.vue'
import CollocationsSection from '../components/CollocationsSection.vue'
import VocabSection from '../components/VocabSection.vue'
import CertSection from '../components/CertSection.vue'
import ListenSection from '../components/ListenSection.vue'
import ProdSection from '../components/ProdSection.vue'
import QuizSection from '../components/QuizSection.vue'

const route = useRoute()
const unit = computed(() => getUnit(route.params.id as string))
const index = listUnits()

const rootStyle = computed(() => {
  if (!unit.value) return {}
  const c = shades(unit.value.hue)
  return {
    '--hero': c.hero,
    '--hero-sub': c.sub,
    '--hero-txt': c.txt,
    '--chip': c.chip,
    '--chip-ink': c.chipInk,
  }
})

function neighborId(offset: number): string | null {
  const i = index.findIndex((u) => u.id === route.params.id)
  const n = index[i + offset]
  return n ? n.id : null
}
</script>

<template>
  <div v-if="unit" class="lesson-page" :style="rootStyle">
    <div class="lesson-nav">
      <RouterLink to="/">← همه‌ی درس‌ها</RouterLink>
      <RouterLink v-if="neighborId(-1)" :to="`/lesson/${neighborId(-1)}`">‹ درس قبل</RouterLink>
      <RouterLink v-if="neighborId(1)" :to="`/lesson/${neighborId(1)}`">درس بعد ›</RouterLink>
      <span class="spacer"></span>
      <RouterLink :to="`/lesson/${unit._id}/edit`">✎ ویرایش این درس</RouterLink>
    </div>

    <HeroBlock :unit="unit" />
    <StorySection :story="unit.story" />
    <DialogSection :dialog="unit.dialog" />
    <GrammarSection :grammar="unit.grammar" />
    <CollocationsSection :colls="unit.colls" />
    <VocabSection :vocab="unit.vocab" />
    <CertSection v-if="unit.cert" :cert="unit.cert" />
    <ListenSection :listen="unit.listen" />
    <ProdSection :prod="unit.prod" />
    <div class="take">
      <b>جمله‌ی مصاحبه:</b>
      <div class="en">{{ unit.take }}</div>
    </div>
    <QuizSection :quiz="unit.quiz" :n="unit.n" />
  </div>
  <div v-else class="lesson-page">
    <p>درس پیدا نشد.</p>
    <RouterLink to="/">← بازگشت به فهرست درس‌ها</RouterLink>
  </div>
</template>
