<script setup lang="ts">
import { computed } from 'vue'
import type { Vocab } from '../types/unit'
import { mark } from '../lib/mark'
import SectionHeader from './SectionHeader.vue'

const props = defineProps<{ vocab: Vocab }>()

const sets = computed(() => props.vocab.sets || [{ u: props.vocab.lab || '', chips: props.vocab.chips || [] }])
const ex = computed(() => props.vocab.ex.map(([e, f]) => ({ e: mark(e), f: mark(f) })))
</script>

<template>
  <div class="sec" style="--k:#9A7414">
    <SectionHeader skill="W" icon="book" :title="vocab.h" :lab="vocab.lab" />
    <div v-for="(s, i) in sets" :key="i" class="wset">
      <div class="wu">{{ s.u }}</div>
      <div class="chips">
        <span class="chip" v-for="(c, j) in s.chips" :key="j">
          <b>{{ c[0] }}</b><s>{{ c[1] }}</s>
          <em v-if="c[2] && c[2] !== 'A1'">{{ c[2] }}</em>
        </span>
      </div>
    </div>
    <div class="ex two">
      <div v-for="(item, i) in ex" :key="i">
        <span class="en" v-html="item.e"></span><br />
        <span class="fa" v-html="item.f"></span>
      </div>
    </div>
  </div>
</template>
