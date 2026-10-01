<script setup lang="ts">
import { computed } from 'vue'
import { ctx } from '../../lib/context'
import type { Gap } from '../../types/context'
import TagChip from './TagChip.vue'

const props = defineProps<{ gap: Gap }>()
const st = computed(() => ctx.value!.status[props.gap.status])
</script>

<template>
  <div class="crow" :id="`G-${gap.slug}`">
    <div class="rh">
      <TagChip :tag="gap.tag" />
      <span class="badge" :style="{ '--b': st.color }">{{ st.en }}</span>
      <TagChip v-for="p in gap.packs" :key="p" :tag="`#P:${p}`" />
    </div>
    <div class="fs">{{ gap.label }}</div>
  </div>
</template>
