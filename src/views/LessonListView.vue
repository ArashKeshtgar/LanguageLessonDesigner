<script setup lang="ts">
import { listUnits, getUnit, allUnits, blankUnit } from '../lib/units'
import { saveDraft } from '../lib/drafts'
import { shades } from '../lib/shades'
import { RouterLink, useRouter } from 'vue-router'

const router = useRouter()

const units = listUnits().map((u) => {
  const full = getUnit(u.id)!
  return { ...u, hero: shades(full.hue).hero }
})

function createLesson() {
  const id = window.prompt('شناسه‌ی درس جدید (مثلاً u416):')?.trim()
  if (!id) return
  if (!/^u[a-z0-9]+$/i.test(id)) {
    window.alert('شناسه باید با u شروع بشه و فقط حرف/عدد باشه، مثل u416.')
    return
  }
  if (getUnit(id)) {
    window.alert('این شناسه از قبل استفاده شده.')
    return
  }
  const maxN = Math.max(0, ...allUnits().map((u) => u.n))
  saveDraft(id, blankUnit(id, maxN + 1))
  router.push(`/lesson/${id}/edit`)
}
</script>

<template>
  <div class="lesson-page">
    <div class="hero" style="--hero:#22303d">
      <div class="tag">Language Lesson Designer</div>
      <h1>English lessons</h1>
      <div class="hfa">{{ units.length }} درسی که تا الان طراحی شده — گرامر، کالوکیشن، واژه، شنیدن و تولید</div>
    </div>

    <div class="lesson-list">
      <RouterLink
        v-for="u in units"
        :key="u.id"
        :to="`/lesson/${u.id}`"
        class="lesson-card"
        :style="{ '--hero': u.hero }"
      >
        <div class="tag">{{ u.tag }}</div>
        <div class="en">{{ u.en }}</div>
        <div class="fa">{{ u.fa }}</div>
      </RouterLink>
      <button class="lesson-card lesson-card-add" @click="createLesson">
        <div class="en">+ درس جدید</div>
      </button>
    </div>
  </div>
</template>

<style scoped>
.lesson-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1em;
  margin-top: 1.2em;
}
.lesson-card {
  display: block;
  border-radius: 10px;
  padding: 1em 1.2em;
  text-decoration: none;
  color: #1a2430;
  background: #fff;
  border: 1px solid #e6e8eb;
  border-top: 4px solid var(--hero);
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}
.lesson-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}
.lesson-card .tag {
  font-size: 0.72em;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--hero);
  font-family: Calibri, Carlito, Arial, sans-serif;
  direction: ltr;
  text-align: left;
}
.lesson-card .en {
  font-family: Calibri, Carlito, Arial, sans-serif;
  direction: ltr;
  text-align: left;
  font-size: 1.2em;
  font-weight: 700;
  margin-top: 0.3em;
}
.lesson-card .fa {
  font-family: 'B Nazanin', 'B Yekan', serif;
  color: #6b7580;
  margin-top: 0.3em;
}
.lesson-card-add {
  display: flex;
  align-items: center;
  justify-content: center;
  border-style: dashed;
  border-top-width: 1px;
  cursor: pointer;
  font: inherit;
  color: #8a94a0;
  min-height: 4.5em;
}
.lesson-card-add:hover {
  color: #2d5f86;
  border-color: #2d5f86;
}
</style>
