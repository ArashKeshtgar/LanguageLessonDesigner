<script setup lang="ts">
defineProps<{ story: string }>()
</script>

<template>
  <div class="sec" style="--k:#8C5A2B">
    <SectionHeader skill="S" icon="flag" title="صحنه — از داستان خودت" lab="Story hook" />
    <p class="fs" v-html="story"></p>
  </div>
</template>

<script lang="ts">
import SectionHeader from './SectionHeader.vue'
export default { components: { SectionHeader } }
</script>
