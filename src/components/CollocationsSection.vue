<script setup lang="ts">
import { computed } from 'vue'
import type { Colls } from '../types/unit'
import { mark } from '../lib/mark'
import SectionHeader from './SectionHeader.vue'

const props = defineProps<{ colls: Colls }>()

const rowCols = computed(() => {
  const rows = props.colls.rows || []
  const half = Math.ceil(rows.length / 2)
  return [rows.slice(0, half), rows.slice(half)].filter((c) => c.length)
})

const ex = computed(() => props.colls.ex.map(([e, f]) => ({ e: mark(e), f: mark(f) })))
</script>

<template>
  <div class="sec" style="--k:#2E6B4A">
    <SectionHeader skill="C" icon="quote" :title="colls.h" :lab="colls.lab" />
    <div class="grp">
      <div class="gc" v-for="(g, i) in colls.groups" :key="i">
        <div class="h">{{ g.h }}</div>
        <div class="n">{{ g.n }}</div>
        <div class="ok" v-for="(o, j) in g.ok" :key="j">{{ o }}</div>
        <div v-if="g.no" class="no">{{ g.no }}</div>
      </div>
    </div>
    <div v-if="rowCols.length" class="two">
      <table v-for="(col, ci) in rowCols" :key="ci">
        <tr v-for="(row, ri) in col" :key="ri">
          <td class="e" v-html="mark(row[0])"></td>
          <td>{{ row[1] }}</td>
          <td class="x">{{ row[2] || '' }}</td>
        </tr>
      </table>
    </div>
    <div class="ex two">
      <div v-for="(item, i) in ex" :key="i">
        <span class="en" v-html="item.e"></span><br />
        <span class="fa" v-html="item.f"></span>
      </div>
    </div>
  </div>
</template>
