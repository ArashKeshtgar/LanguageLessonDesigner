<script setup lang="ts">
import { computed } from 'vue'
import { ctx } from '../../lib/context'
import { ico } from '../../lib/icons'

// Same header as the lesson sections (icon tile + Persian title + English label),
// coloured by tag kind instead of by skill.
const props = defineProps<{ kind: string; icon: string; title: string; lab?: string; id?: string }>()
const k = computed(() => ctx.value?.kinds[props.kind] || { color: '#2D5F86', tint: '#E8F0F7' })
</script>

<template>
  <div class="sec" :id="id">
    <div class="sh" :style="{ '--k': k.color, '--t': k.tint }">
      <div class="ic" v-html="ico(icon)"></div>
      <div class="t">{{ title }}</div>
      <div class="lab">{{ lab }}</div>
    </div>
    <slot />
  </div>
</template>
