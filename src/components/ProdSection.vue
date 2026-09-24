<script setup lang="ts">
import type { Prod } from '../types/unit'
import SectionHeader from './SectionHeader.vue'

defineProps<{ prod: Prod }>()
</script>

<template>
  <div class="sec" style="--k:#B4534E">
    <SectionHeader skill="P" icon="pencil" :title="prod.h" :lab="prod.lab || 'Produce it'" />
    <div v-if="prod.tasks?.length" class="prod3">
      <div class="pt" v-for="(t, i) in prod.tasks" :key="i">
        <div class="k">{{ t.k }}</div>
        <div v-html="t.t"></div>
        <div v-if="t.lines" class="lines">
          <div v-for="n in t.lines" :key="n"></div>
        </div>
      </div>
    </div>
    <div v-else class="two">
      <div class="box">
        <div class="k">Speak · 60 sec</div>
        <div v-html="prod.speak"></div>
      </div>
      <div class="box">
        <div class="k">Write · 3 lines</div>
        <div v-html="prod.write"></div>
        <div class="lines"><div></div><div></div><div></div></div>
      </div>
    </div>
  </div>
</template>
