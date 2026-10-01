<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ctx, resolveTag, kindOfTag } from '../../lib/context'

// One tag (#B07, #F:proj.x.y …) in its kind's colour; links to the item when it resolves.
const props = defineProps<{ tag: string }>()
const kind = computed(() => ctx.value?.kinds[kindOfTag(props.tag)])
const target = computed(() => resolveTag(props.tag, ctx.value))
const style = computed(() => ({ '--k': kind.value?.color, '--t': kind.value?.tint }))
</script>

<template>
  <RouterLink v-if="target" :to="target.route" class="tg" :style="style" :title="target.label">{{ tag }}</RouterLink>
  <span v-else class="tg" :style="style">{{ tag }}</span>
</template>
