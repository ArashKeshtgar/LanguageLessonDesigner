<script setup lang="ts">
import { speak, speechAvailable } from '../lib/speak'

const props = defineProps<{ text: string }>()

function onClick() {
  speak(props.text)
}
</script>

<template>
  <button v-if="speechAvailable()" class="speak-btn" type="button" title="بشنو" @click="onClick">🔊</button>
</template>

<style scoped>
.speak-btn {
  border: 1px solid var(--line);
  background: #fff;
  border-radius: 50%;
  width: 1.8em;
  height: 1.8em;
  line-height: 1;
  font-size: 0.8em;
  cursor: pointer;
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.speak-btn:hover {
  background: #f6f7f8;
}
</style>
