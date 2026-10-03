<script setup lang="ts">
import { computed } from 'vue'
import type { Proverb } from '../../types/proverbs'
import { pv } from '../../lib/proverbs'
import SpeakButton from '../SpeakButton.vue'

// One proverb, in the engine's row order: Persian → meaning → equivalent → where Americans say it → example.
const props = defineProps<{ p: Proverb; hide?: boolean }>()
const match = computed(() => pv.match[props.p.m])
const amer = computed(() => pv.amer[props.p.amer])
</script>

<template>
  <div class="pv" :id="p.tag.slice(1)">
    <div class="rh">
      <span class="pv-tag">{{ p.tag }}</span>
      <span class="pv-fa">{{ p.fa }}</span>
    </div>
    <div class="pv-where">
      <span v-for="w in p.where" :key="w">{{ pv.where[w]?.fa }}</span>
    </div>
    <div class="pv-mean">{{ p.mean }}</div>

    <template v-if="!hide">
      <div class="pv-en">
        <span>{{ p.en }}</span>
        <SpeakButton :text="p.en" lang="en-US" />
        <span class="badge" :style="{ '--b': match.color }" :title="match.fa">{{ match.en }}</span>
        <span class="badge" :style="{ '--b': amer.color }" :title="amer.fa">{{ amer.en }}</span>
      </div>
      <div class="pv-us"><b>آمریکایی‌ها کجا می‌گویند:</b> {{ p.us }}</div>
      <div class="pv-ex">
        <span>“{{ p.ex }}”</span>
        <SpeakButton :text="p.ex" lang="en-US" />
      </div>
      <div v-if="p.ex_work" class="pv-ex pv-exw">
        <i>at work</i><span>“{{ p.ex_work }}”</span>
      </div>
      <div v-if="p.alt?.length" class="pv-alt">
        <span v-for="a in p.alt" :key="a">{{ a }}</span>
      </div>
      <div v-if="p.note" class="pv-note"><b>نکته:</b> {{ p.note }}</div>
    </template>
  </div>
</template>
