<script setup lang="ts">
import { computed } from 'vue'
import type { Grammar } from '../types/unit'
import { mark } from '../lib/mark'
import SectionHeader from './SectionHeader.vue'

const props = defineProps<{ grammar: Grammar }>()
const rows = computed(() => props.grammar.rows.map(([r, e, x]) => ({ r, e: mark(e), x })))
const errText = computed(() =>
  props.grammar.errors.map(([a, b]) => `<s style="color:#B4534E">${a}</s> → <b>${b}</b>`).join(' · '),
)
</script>

<template>
  <div class="sec" style="--k:#2D5F86">
    <SectionHeader skill="G" icon="layers" :title="grammar.h" :lab="grammar.lab" />
    <table>
      <tr v-for="(row, i) in rows" :key="i">
        <td class="r">{{ row.r }}</td>
        <td class="e" v-html="row.e"></td>
        <td class="x">{{ row.x }}</td>
      </tr>
    </table>
    <div class="two">
      <div class="box">
        <div class="k">{{ grammar.elab }}</div>
        <div class="en" v-html="errText"></div>
      </div>
      <div class="box">
        <div class="k">Interview trigger</div>
        <div v-html="grammar.trigger"></div>
      </div>
    </div>
  </div>
</template>
