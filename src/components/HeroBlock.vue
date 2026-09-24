<script setup lang="ts">
import type { Unit } from '../types/unit'

defineProps<{ unit: Unit }>()
</script>

<template>
  <div class="hero">
    <div class="tag">{{ unit.tag }}</div>
    <h1>{{ unit.en }}</h1>
    <div class="hfa">{{ unit.fa }}</div>
    <div class="src">
      <span v-for="([a, b], i) in unit.src" :key="i"><i>{{ a }}</i>{{ b }}</span>
    </div>
    <div v-if="unit.chain" class="chain">
      <span><i>from</i>{{ unit.chain.prev || '—' }}</span>
      <span class="now"><i>this</i>{{ unit.chain.now || unit.en }}</span>
      <span><i>next</i>{{ unit.chain.next || '—' }}</span>
    </div>
  </div>
</template>
