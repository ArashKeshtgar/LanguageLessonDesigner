<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { canRebuild, ctx, jumpTo } from '../lib/context'
import CtxGate from '../components/ctx/CtxGate.vue'
import CtxSection from '../components/ctx/CtxSection.vue'
import TagChip from '../components/ctx/TagChip.vue'
import SpeakButton from '../components/SpeakButton.vue'

// /context/recruit — recruiters and IT staffing agencies: pitch, messages, call, objections,
// technical-interview stories, rules, agencies. Every `say` was checked by the engine's guard
// (Context/engine/registry.py check_recruit) against the truth bank.
const route = useRoute()
const r = computed(() => ctx.value?.recruit)
const g = ref(typeof route.query.g === 'string' ? route.query.g : '')
const q = ref('')

// Blanks in the scripts — filled live, so the copied text is ready to paste.
const blanks = ref<Record<string, string>>({ Name: '', Agency: '', Role: '', Client: '' })
function fill(s: string): string {
  return s.replace(/\{(\w+)\}/g, (m, k) => blanks.value[k]?.trim() || m)
}

const items = computed(() => {
  const s = q.value.trim().toLowerCase()
  return (r.value?.items || []).filter((x) => (!g.value || x.g === g.value)
    && (!s || [x.fa, x.en, x.when, x.say, x.why].join(' ').toLowerCase().includes(s)))
})
const groups = computed(() => (r.value?.groups || []).filter((gr) => items.value.some((x) => x.g === gr.key)))
const showAgencies = computed(() => !g.value || g.value === 'agency')

const copied = ref('')
async function copy(id: string, text: string) {
  try {
    await navigator.clipboard.writeText(text)
    copied.value = id
    setTimeout(() => { if (copied.value === id) copied.value = '' }, 1500)
  } catch { /* clipboard blocked — the text is selectable anyway */ }
}

onMounted(() => jumpTo(route.query.at))
// after the render, so the row exists when we scroll to it (ctx may arrive after mount)
watch(() => [route.fullPath, !!ctx.value], () => jumpTo(route.query.at), { flush: 'post' })
</script>

<template>
  <CtxGate>
    <div class="lesson-page" v-if="ctx" style="--hero:#7a3b1c">
      <div class="lesson-nav"><RouterLink to="/context">← همه‌ی بسته‌ها</RouterLink></div>
      <div class="hero">
        <div class="tag">Recruiters + IT staffing agencies</div>
        <h1>Recruiters</h1>
        <div class="hfa">ریکروترها و آژانس‌های کاریابی IT — قانعشان کن که معرفی‌ات کنند، و برای مصاحبه‌ی فنی آماده باش</div>
        <div class="bal" v-if="r">
          <span><b>{{ r.items.length }}</b> scripts</span><span><b>{{ r.agencies.length }}</b> agencies</span>
        </div>
      </div>

      <div v-if="!r" class="sec">
        <p class="fs">این نسخه‌ی context.json هنوز بخش ریکروترها را ندارد.
          <template v-if="canRebuild">در <span class="en">Context\engine</span> اجرا کن: <code class="en">python ctx.py export</code></template>
          <template v-else>روی کامپیوتر: <code class="en">deploy\vps\push-context.ps1 -Export</code></template></p>
      </div>

      <template v-else>
        <div class="sec rc-filters">
          <div class="ctx-filter">
            <button class="btn" :class="{ 'btn-primary': !g }" @click="g = ''">همه</button>
            <button v-for="gr in r.groups" :key="gr.key" class="btn" :class="{ 'btn-primary': g === gr.key }"
                    @click="g = gr.key">{{ gr.fa }}</button>
            <button class="btn" :class="{ 'btn-primary': g === 'agency' }" @click="g = 'agency'">آژانس‌ها</button>
          </div>
          <input v-model="q" type="search" class="pv-q" placeholder="جستجو: salary، Canadian experience، SQL…" />
          <div class="rc-blanks">
            <span class="fs">جای خالی‌ها:</span>
            <input v-for="(_, k) in blanks" :key="k" v-model="blanks[k]" :placeholder="`{${k}}`" class="en" />
          </div>
        </div>

        <template v-if="g !== 'agency'">
          <CtxSection v-for="gr in groups" :key="gr.key" kind="R" :icon="gr.icon" :title="gr.fa" :lab="`${gr.en} · ${gr.tag}`">
            <div v-for="x in items.filter((i) => i.g === gr.key)" :key="x.id" :id="`R-${x.id}`" class="crow">
              <div class="rh"><TagChip :tag="x.tag" /><span class="rt">{{ x.fa }}</span></div>
              <div class="sub en">{{ x.en }}</div>
              <div class="sub">کی: {{ x.when }}</div>
              <div class="rc-say">{{ fill(x.say) }}</div>
              <div class="rc-tools">
                <button class="btn" @click="copy(x.id, fill(x.say))">{{ copied === x.id ? '✓ کپی شد' : 'کپی' }}</button>
                <SpeakButton :text="fill(x.say)" lang="en-US" />
                <span v-if="x.limit" class="rc-lim" :class="{ over: fill(x.say).length > x.limit }">
                  {{ fill(x.say).length }} / {{ x.limit }} chars</span>
              </div>
              <div class="rc-why"><b>چرا:</b> {{ x.why }}</div>
              <div v-if="x.dont?.length" class="rc-dont"><span v-for="d in x.dont" :key="d">✗ {{ d }}</span></div>
              <div v-if="x.facts?.length || x.refs?.length" class="refs">
                <TagChip v-for="f in x.facts" :key="f" :tag="`#F:${f}`" />
                <TagChip v-for="t in x.refs" :key="t" :tag="t" />
              </div>
            </div>
          </CtxSection>
          <p v-if="!items.length" class="empty" style="margin-top:1em">چیزی پیدا نشد.</p>
        </template>

        <CtxSection v-if="showAgencies" kind="R" icon="case" title="آژانس‌ها" :lab="`Agencies · ${r.agencies.length}`">
          <div v-for="a in r.agencies" :key="a.id" :id="`R-agency.${a.id}`" class="crow">
            <div class="rh"><TagChip :tag="a.tag" /><span class="rt en">{{ a.name }}</span>
              <a class="cm" :href="`https://${a.url}`" target="_blank" rel="noopener">{{ a.url }}</a></div>
            <div>{{ a.focus }}</div>
            <div class="sub">چطور: {{ a.how }}</div>
          </div>
          <p class="fs hint-line">این فهرست از دانش عمومی است، نه جستجوی زنده — قبل از تماس سایت را چک کن.</p>
        </CtxSection>
      </template>
    </div>
  </CtxGate>
</template>

<style scoped>
.rc-filters { display: flex; flex-direction: column; gap: .6em; }
.rc-blanks { display: flex; flex-wrap: wrap; align-items: center; gap: .4em; }
.rc-blanks input { width: 9em; border: 1px solid var(--line); border-radius: 6px; padding: .3em .5em; font-size: .9em; }
.rc-say { font: 1em/1.6 Calibri, Carlito, Arial, sans-serif; direction: ltr; text-align: left; white-space: pre-wrap;
          background: #fbede2; border-left: 3px solid #a3542a; border-radius: 5px; padding: .5em .8em; margin-top: .35em; }
.rc-tools { display: flex; align-items: center; gap: .5em; margin-top: .35em; }
.rc-lim { font: 600 .78em Calibri, Carlito, Arial, sans-serif; color: #8a94a0; direction: ltr; }
.rc-lim.over { color: #b4534e; }
.rc-why { color: #4a5562; margin-top: .35em; line-height: 1.85; }
.rc-dont { display: flex; flex-wrap: wrap; gap: .3em; margin-top: .3em; }
.rc-dont span { font-size: .8em; color: #b4534e; background: #f7e9e8; border-radius: 1em; padding: 0 .6em; }
</style>
