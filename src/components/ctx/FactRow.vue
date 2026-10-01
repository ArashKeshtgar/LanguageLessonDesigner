<script setup lang="ts">
import type { Fact } from '../../types/context'
import TagChip from './TagChip.vue'

defineProps<{ fact: Fact }>()
const strengthColor: Record<string, string> = { strong: '#2E6B4A', medium: '#9A7414' }
</script>

<template>
  <div class="crow" :id="`F-${fact.id}`">
    <div class="rh">
      <TagChip :tag="fact.tag" />
      <span class="badge" :style="{ '--b': strengthColor[fact.strength] || '#8A94A0' }">{{ fact.strength.toUpperCase() }}</span>
      <span v-for="w in fact.forbidden" :key="w" class="no" title="برای این فکت ممنوع">{{ w }}</span>
    </div>
    <div class="cl">{{ fact.claim }}</div>
    <div v-if="fact.fa" class="cfa">{{ fact.fa }}</div>
    <details class="ev"><summary>evidence · facts/{{ fact.file }}.yml</summary>{{ fact.evidence }}</details>
  </div>
</template>
