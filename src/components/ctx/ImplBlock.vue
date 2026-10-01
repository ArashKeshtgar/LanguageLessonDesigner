<script setup lang="ts">
import { computed } from 'vue'
import { ctx } from '../../lib/context'
import type { ImplPart } from '../../types/context'
import CtxSection from './CtxSection.vue'
import TagChip from './TagChip.vue'

// One implementation part (#I:<pack>.<arch|db|deploy|run>): dark diagram, table, commands.
const props = defineProps<{ pack: string; part: string; data: ImplPart }>()
const meta = computed(() => ctx.value!.implParts[props.part])

async function copy(text: string) {
  try { await navigator.clipboard.writeText(text) } catch { /* clipboard blocked — ignore */ }
}
</script>

<template>
  <CtxSection kind="I" :icon="meta.icon" :title="meta.fa" :lab="meta.en" :id="`I-${part}`">
    <div class="ih"><TagChip :tag="`#I:${pack}.${part}`" /></div>
    <pre v-if="data.diagram" class="dg">{{ data.diagram }}</pre>
    <table v-if="data.rows?.length" class="it">
      <tr v-for="(r, i) in data.rows" :key="i">
        <td class="a">{{ r[0] }}</td>
        <td v-if="r.length === 3" class="b">{{ r[1] }}</td>
        <td>{{ r[r.length - 1] }}</td>
      </tr>
    </table>
    <div v-for="(c, i) in data.cmds || []" :key="i" class="cmd" title="کلیک = کپی" @click="copy(c)">{{ c }}</div>
  </CtxSection>
</template>
