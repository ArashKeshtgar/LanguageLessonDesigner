<script setup lang="ts">
import { computed } from 'vue'
import type { Cert } from '../types/unit'
import { mark } from '../lib/mark'
import SectionHeader from './SectionHeader.vue'

const props = defineProps<{ cert: Cert }>()
const body = computed(() => (props.cert.read?.body || []).map(([e, f]) => ({ e: mark(e), f: mark(f) })))
</script>

<template>
  <div class="sec" style="--k:#1F6F6B">
    <SectionHeader skill="X" icon="shield" :title="cert.h || 'مدرک — ریدینگ'" :lab="cert.lab || 'Microsoft certification'" />
    <div class="chips">
      <span class="chip cert" v-for="(t, i) in cert.terms || []" :key="i">
        <b>{{ t[0] }}</b><s>{{ t[1] }}</s>
        <em v-if="t[2]">{{ t[2] }}</em>
      </span>
    </div>
    <div v-if="cert.read" class="rd">
      <div class="rt">{{ cert.read.t }}</div>
      <template v-for="(p, i) in body" :key="i">
        <p class="rp" v-html="p.e"></p>
        <p class="rfa" v-html="p.f"></p>
      </template>
    </div>
    <div class="two">
      <div v-if="cert.read?.qs?.length" class="box">
        <div class="k">After reading — answer in English</div>
        <ol class="steps en">
          <li v-for="(q, i) in cert.read.qs" :key="i">{{ q }}</li>
        </ol>
      </div>
      <div v-if="cert.why" class="box">
        <div class="k">Why it matters</div>
        <div v-html="cert.why"></div>
      </div>
    </div>
  </div>
</template>
