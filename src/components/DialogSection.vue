<script setup lang="ts">
import { computed } from 'vue'
import type { Dialog } from '../types/unit'
import { mark } from '../lib/mark'
import { stripForSpeech } from '../lib/speak'
import SectionHeader from './SectionHeader.vue'
import SpeakButton from './SpeakButton.vue'

const props = defineProps<{ dialog: Dialog }>()
const lines = computed(() =>
  props.dialog.lines.map(([w, en, fa]) => ({ w, en: mark(en), fa: mark(fa), raw: stripForSpeech(en) })),
)
</script>

<template>
  <div class="sec" style="--k:#2D5F86">
    <SectionHeader skill="G" icon="handshake" :title="dialog.h" :lab="dialog.lab" />
    <div class="dl">
      <template v-for="(l, i) in lines" :key="i">
        <div class="who">{{ l.w }}</div>
        <div class="d">
          <span v-html="l.en"></span>
          <SpeakButton :text="l.raw" style="margin-inline-start:.4em;vertical-align:-.3em" />
        </div>
        <div class="dfa" v-html="l.fa"></div>
      </template>
    </div>
  </div>
</template>
