<script setup lang="ts">
import type { BugItem, WorkItem } from '../../types/context'
import TagChip from './TagChip.vue'

// One work-log or bug row. Bugs get the symptom/cause/fix grid and the lesson box.
const props = defineProps<{ item: WorkItem | BugItem; showPacks?: boolean }>()
const bug = 'cause' in props.item ? (props.item as BugItem) : null
const fields: [string, keyof BugItem][] = [['نشانه', 'sym'], ['علت', 'cause'], ['رفع', 'fix']]
</script>

<template>
  <div class="crow" :id="item.tag.slice(1)">
    <div class="rh">
      <TagChip :tag="item.tag" />
      <span class="date">{{ item.d }}</span>
      <span class="rt">{{ item.fa }}</span>
      <span v-if="item.commit" class="cm">{{ item.commit }}</span>
      <template v-if="showPacks"><TagChip v-for="p in item.p" :key="p" :tag="`#P:${p}`" /></template>
    </div>
    <div class="en sub">{{ item.en }}</div>
    <div v-if="!bug" class="fs">{{ (item as WorkItem).did }}</div>
    <template v-else>
      <div class="kv">
        <template v-for="[label, key] in fields" :key="key">
          <template v-if="bug[key]"><div class="k">{{ label }}</div><div>{{ bug[key] }}</div></template>
        </template>
      </div>
      <div class="lesson"><b>درس:</b> {{ bug.lesson }}</div>
    </template>
    <div v-if="item.facts?.length || item.gaps?.length" class="refs">
      <TagChip v-for="f in item.facts || []" :key="f" :tag="`#F:${f}`" />
      <TagChip v-for="g in item.gaps || []" :key="g" :tag="`#G:${g}`" />
    </div>
  </div>
</template>
