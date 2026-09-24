<script setup lang="ts">
import { computed } from 'vue'
import type { Dialog } from '../types/unit'
import { mark } from '../lib/mark'
import SectionHeader from './SectionHeader.vue'

const props = defineProps<{ dialog: Dialog }>()
const lines = computed(() => props.dialog.lines.map(([w, en, fa]) => ({ w, en: mark(en), fa: mark(fa) })))
</script>

<template>
  <div class="sec" style="--k:#2D5F86">
    <SectionHeader skill="G" icon="handshake" :title="dialog.h" :lab="dialog.lab" />
    <div class="dl">
      <template v-for="(l, i) in lines" :key="i">
        <div class="who">{{ l.w }}</div>
        <div class="d" v-html="l.en"></div>
        <div class="dfa" v-html="l.fa"></div>
      </template>
    </div>
  </div>
</template>
