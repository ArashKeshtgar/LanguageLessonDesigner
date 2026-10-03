<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'

const route = useRoute()
const section = computed(() => route.meta.section)
</script>

<template>
  <nav class="topbar">
    <div class="topbar-in">
      <span class="brand">Arash · Workbench</span>
      <RouterLink to="/" class="tab" :class="{ on: section === 'lessons' }">
        <b>درس‌ها</b><small>Lessons</small>
      </RouterLink>
      <RouterLink to="/context" class="tab" :class="{ on: section === 'context' }">
        <b>کانتکست</b><small>Context</small>
      </RouterLink>
      <RouterLink to="/proverbs" class="tab" :class="{ on: section === 'proverbs' }">
        <b>ضرب‌المثل</b><small>Proverbs</small>
      </RouterLink>
    </div>
  </nav>
  <RouterView />
</template>
