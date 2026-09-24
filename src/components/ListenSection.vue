<script setup lang="ts">
import { computed } from 'vue'
import type { Listen } from '../types/unit'
import { mark } from '../lib/mark'
import SectionHeader from './SectionHeader.vue'

const props = defineProps<{ listen: Listen }>()
const compare = computed(() => (props.listen.rec?.compare || []).map(([e, f]) => ({ e: mark(e), f: mark(f) })))
</script>

<template>
  <div class="sec" style="--k:#6B4E8C">
    <SectionHeader skill="L" icon="mic" :title="listen.h" :lab="listen.lab" />
    <div class="two">
      <div class="box">
        <div class="k">Tactic · book track</div>
        <div v-html="listen.tactic"></div>
      </div>
      <div class="box">
        <div class="k">Where</div>
        <div v-html="listen.where"></div>
      </div>
    </div>
    <ol class="steps">
      <li v-for="(s, i) in listen.steps" :key="i" v-html="s"></li>
    </ol>
    <div v-if="listen.rec" class="rec">
      <div class="rh">
        {{ listen.rec.h || 'ضبط خودت — تمرین اصلی شنیدن' }}
        <span class="min">{{ listen.rec.min || '10 min' }}</span>
      </div>
      <ol v-if="listen.rec.steps?.length" class="steps">
        <li v-for="(s, i) in listen.rec.steps" :key="i" v-html="s"></li>
      </ol>
      <div v-if="listen.rec.watch?.length" class="box" style="margin-top:.5em">
        <div class="k">Watch these in your own recording</div>
        <table>
          <tr v-for="(w, i) in listen.rec.watch" :key="i">
            <td class="x">{{ w[0] }}</td>
            <td class="e">{{ w[1] }}</td>
            <td>{{ w[2] }}</td>
          </tr>
        </table>
      </div>
      <div v-if="compare.length" class="box" style="margin-top:.5em">
        <div class="k">Compare with these lines</div>
        <table>
          <tr v-for="(c, i) in compare" :key="i">
            <td class="e" v-html="c.e"></td>
            <td v-html="c.f"></td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>
