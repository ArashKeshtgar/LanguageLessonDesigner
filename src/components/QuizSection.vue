<script setup lang="ts">
import { computed } from 'vue'
import type { QuizItem } from '../types/unit'
import { SK } from '../lib/skills'
import SectionHeader from './SectionHeader.vue'

const props = defineProps<{ quiz: QuizItem[]; n: number }>()

const legendKeys = ['G', 'C', 'W', 'L', 'P'] as const

const scoreGroups = computed(() => {
  const rng: Record<string, number[]> = {}
  props.quiz.forEach((q, i) => {
    rng[q.k] = rng[q.k] || []
    rng[q.k].push(i + 1)
  })
  return Object.entries(rng)
})
</script>

<template>
  <div class="quiz-wrap">
    <div class="sec" style="--k:#B4534E">
      <SectionHeader skill="P" icon="clip" title="آزمون یونیت — بدون نگاه به دو صفحه‌ی قبل" lab="Unit quiz" />
      <div class="leg">
        <span v-for="k in legendKeys" :key="k" :style="{ '--k': SK[k].color }">{{ SK[k].label }}</span>
      </div>
      <div class="q" v-for="(q, i) in quiz" :key="i" :style="{ '--k': SK[q.k as keyof typeof SK]?.color }">
        <div class="qn" :class="{ old: q.old }">{{ i + 1 }}</div>
        <div>
          <div class="qt" v-html="q.q"></div>
          <div v-if="q.op?.length" class="op">
            <span v-for="(o, j) in q.op" :key="j">{{ o }}</span>
          </div>
          <div v-if="q.qfa || q.fa" class="qfa">{{ q.qfa || q.fa }}</div>
          <div v-if="q.lines" class="lines"><div></div><div></div></div>
        </div>
      </div>
      <div class="score">
        <div class="sc" v-for="([k, idxs]) in scoreGroups" :key="k" :style="{ '--k': SK[k as keyof typeof SK]?.color }">
          {{ idxs.join('، ') }}
          <div class="en" style="text-align:center;font-size:.8em;color:#8A94A0">{{ SK[k as keyof typeof SK]?.label }}</div>
        </div>
      </div>
      <p class="fs" style="margin-top:.6em">هر رنگی که <b>یک غلط</b> داشت، فقط همان بخش یونیت را دوباره بخوان.</p>
    </div>

    <div class="key">
      <div class="sh">
        <div class="t" style="font-size:1.1em">کلید — در ماژول کامل، این بخش به صفحه‌ی آخر ماژول می‌رود</div>
        <div class="lab">Answer key</div>
      </div>
      <div class="kr">
        <div v-for="(q, i) in quiz" :key="i" :style="{ '--k': SK[q.k as keyof typeof SK]?.color }">
          <b class="en">{{ n }}.{{ i + 1 }}</b> <span class="en">{{ q.a }}</span>
          <div v-if="q.afa" class="afa">{{ q.afa }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
