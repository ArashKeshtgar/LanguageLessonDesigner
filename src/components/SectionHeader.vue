<script setup lang="ts">
import { computed } from 'vue'
import { SK } from '../lib/skills'
import { ico } from '../lib/icons'

const props = defineProps<{
  skill: keyof typeof SK
  icon: string
  title: string
  lab: string
}>()

const meta = computed(() => SK[props.skill])
const iconSvg = computed(() => ico(props.icon))
</script>

<template>
  <div class="sh" :style="{ '--k': meta.color, '--t': meta.tint }">
    <div class="ic" v-html="iconSvg"></div>
    <div class="t">{{ title }}</div>
    <div class="lab">{{ lab }}</div>
  </div>
</template>
