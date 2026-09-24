<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { getUnit, getOriginalUnit } from '../lib/units'
import { saveDraft, clearDraft, hasDraft } from '../lib/drafts'
import type { Unit } from '../types/unit'

const route = useRoute()
const router = useRouter()
const id = route.params.id as string

const original = getUnit(id)
if (!original) {
  router.replace('/')
}

const unit = reactive<Unit>(JSON.parse(JSON.stringify(original)))
const savedMsg = ref('')
const draftActive = ref(hasDraft(id))

function linesToArr(text: string): string[] {
  return text.split('\n').map((s) => s.trim()).filter(Boolean)
}

// ---------- src ----------
function addSrc() { unit.src.push(['', '']) }
function removeSrc(i: number) { unit.src.splice(i, 1) }

// ---------- dialog ----------
function addDialogLine() { unit.dialog.lines.push(['', '', '']) }
function removeDialogLine(i: number) { unit.dialog.lines.splice(i, 1) }

// ---------- grammar ----------
function addGrammarRow() { unit.grammar.rows.push(['', '', '']) }
function removeGrammarRow(i: number) { unit.grammar.rows.splice(i, 1) }
function addGrammarError() { unit.grammar.errors.push(['', '']) }
function removeGrammarError(i: number) { unit.grammar.errors.splice(i, 1) }

// ---------- collocations ----------
function addCollGroup() { unit.colls.groups.push({ h: '', n: '', ok: [], no: '' }) }
function removeCollGroup(i: number) { unit.colls.groups.splice(i, 1) }
function addCollRow() { unit.colls.rows = unit.colls.rows || []; unit.colls.rows.push(['', '', '']) }
function removeCollRow(i: number) { unit.colls.rows?.splice(i, 1) }
function addCollEx() { unit.colls.ex.push(['', '']) }
function removeCollEx(i: number) { unit.colls.ex.splice(i, 1) }

// ---------- vocab ----------
function addVocabSet() { unit.vocab.sets = unit.vocab.sets || []; unit.vocab.sets.push({ u: '', chips: [] }) }
function removeVocabSet(i: number) { unit.vocab.sets?.splice(i, 1) }
function addChip(setIdx: number) { unit.vocab.sets?.[setIdx].chips.push(['', '', '']) }
function removeChip(setIdx: number, i: number) { unit.vocab.sets?.[setIdx].chips.splice(i, 1) }
function addVocabEx() { unit.vocab.ex.push(['', '']) }
function removeVocabEx(i: number) { unit.vocab.ex.splice(i, 1) }

// ---------- cert ----------
function addCert() {
  unit.cert = { h: 'مدرک — ریدینگ', lab: 'Microsoft certification', exam: '', areas: [], terms: [], read: { t: '', body: [], qs: [] }, why: '' }
}
function removeCert() { unit.cert = undefined }
function addCertTerm() { unit.cert!.terms = unit.cert!.terms || []; unit.cert!.terms.push(['', '', '']) }
function removeCertTerm(i: number) { unit.cert!.terms?.splice(i, 1) }
function addCertBody() { unit.cert!.read = unit.cert!.read || { t: '', body: [], qs: [] }; unit.cert!.read.body.push(['', '']) }
function removeCertBody(i: number) { unit.cert!.read?.body.splice(i, 1) }

// ---------- listen ----------
function addListenStep() { unit.listen.steps.push('') }
function removeListenStep(i: number) { unit.listen.steps.splice(i, 1) }
function addRec() { unit.listen.rec = { h: 'ضبط خودت — تمرین اصلی شنیدن', min: '10 min', steps: [], watch: [], compare: [] } }
function removeRec() { unit.listen.rec = undefined }
function addRecStep() { unit.listen.rec!.steps = unit.listen.rec!.steps || []; unit.listen.rec!.steps.push('') }
function removeRecStep(i: number) { unit.listen.rec?.steps?.splice(i, 1) }
function addWatch() { unit.listen.rec!.watch = unit.listen.rec!.watch || []; unit.listen.rec!.watch.push(['', '', '']) }
function removeWatch(i: number) { unit.listen.rec?.watch?.splice(i, 1) }
function addCompare() { unit.listen.rec!.compare = unit.listen.rec!.compare || []; unit.listen.rec!.compare.push(['', '']) }
function removeCompare(i: number) { unit.listen.rec?.compare?.splice(i, 1) }

// ---------- prod ----------
function addTask() { unit.prod.tasks = unit.prod.tasks || []; unit.prod.tasks.push({ k: '', t: '', lines: 0 }) }
function removeTask(i: number) { unit.prod.tasks?.splice(i, 1) }

// ---------- quiz ----------
function addQuiz() { unit.quiz.push({ k: 'G', q: '', a: '', afa: '', qfa: '' }) }
function removeQuiz(i: number) { unit.quiz.splice(i, 1) }

function opText(q: (typeof unit.quiz)[number]): string {
  return (q.op || []).join('\n')
}
function setOp(q: (typeof unit.quiz)[number], text: string) {
  const arr = linesToArr(text)
  q.op = arr.length ? arr : undefined
}

function save() {
  saveDraft(id, JSON.parse(JSON.stringify(unit)))
  draftActive.value = true
  savedMsg.value = 'ذخیره شد ✓'
  setTimeout(() => (savedMsg.value = ''), 2000)
}

function resetToFile() {
  const orig = getOriginalUnit(id)
  if (!orig) return
  Object.assign(unit, JSON.parse(JSON.stringify(orig)))
  clearDraft(id)
  draftActive.value = false
  savedMsg.value = 'به نسخه‌ی فایل برگشت'
  setTimeout(() => (savedMsg.value = ''), 2000)
}

function downloadJson() {
  const blob = new Blob([JSON.stringify(unit, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${id}.json`
  a.click()
  URL.revokeObjectURL(url)
}

watch(
  unit,
  () => {
    saveDraft(id, JSON.parse(JSON.stringify(unit)))
    draftActive.value = true
  },
  { deep: true },
)
</script>

<template>
  <div v-if="original" class="ef">
    <div class="lesson-nav">
      <RouterLink :to="`/lesson/${id}`">← بازگشت به نمایش درس</RouterLink>
      <span class="spacer"></span>
      <span v-if="draftActive" class="draft-flag">تغییرات ذخیره‌نشده در فایل (draft محلی)</span>
    </div>

    <fieldset>
      <legend>مشخصات درس</legend>
      <div class="row2">
        <div class="field">
          <label>شماره (n)</label>
          <input type="number" v-model.number="unit.n" />
        </div>
        <div class="field">
          <label>Tag</label>
          <input type="text" v-model="unit.tag" />
        </div>
      </div>
      <div class="field">
        <label>عنوان انگلیسی (en)</label>
        <input type="text" v-model="unit.en" />
      </div>
      <div class="field">
        <label>عنوان فارسی (fa)</label>
        <input type="text" v-model="unit.fa" />
      </div>
      <div class="field">
        <label>منابع (src)</label>
        <div class="item-card" v-for="(s, i) in unit.src" :key="i">
          <div class="row2">
            <input type="text" v-model="s[0]" placeholder="Grammar / Colloc. / Words / Listen" />
            <input type="text" v-model="s[1]" placeholder="GIU 1–4 · present simple" />
          </div>
          <button class="btn btn-danger" style="margin-top:.4em" @click="removeSrc(i)">حذف</button>
        </div>
        <button class="btn btn-add" @click="addSrc">+ افزودن منبع</button>
      </div>
    </fieldset>

    <fieldset>
      <legend>داستان (Story)</legend>
      <textarea v-model="unit.story" rows="4"></textarea>
      <div class="hint">می‌تونی از &lt;b&gt;...&lt;/b&gt; برای بولد کردن استفاده کنی.</div>
    </fieldset>

    <fieldset>
      <legend>دیالوگ</legend>
      <div class="row2">
        <div class="field"><label>عنوان بخش</label><input type="text" v-model="unit.dialog.h" /></div>
        <div class="field"><label>Label</label><input type="text" v-model="unit.dialog.lab" /></div>
      </div>
      <div class="item-card" v-for="(l, i) in unit.dialog.lines" :key="i">
        <div class="item-head"><span class="idx">خط {{ i + 1 }}</span><button class="btn btn-danger" @click="removeDialogLine(i)">حذف</button></div>
        <div class="field"><label>گوینده</label><input type="text" v-model="l[0]" placeholder="Recruiter / Arash" /></div>
        <div class="field"><label>English (از [[g:]] [[c:]] [[w:]] برای هایلایت استفاده کن)</label><textarea v-model="l[1]" rows="2"></textarea></div>
        <div class="field"><label>فارسی</label><textarea v-model="l[2]" rows="2"></textarea></div>
      </div>
      <button class="btn btn-add" @click="addDialogLine">+ افزودن خط دیالوگ</button>
    </fieldset>

    <fieldset>
      <legend>گرامر</legend>
      <div class="row2">
        <div class="field"><label>عنوان بخش</label><input type="text" v-model="unit.grammar.h" /></div>
        <div class="field"><label>Label</label><input type="text" v-model="unit.grammar.lab" /></div>
      </div>
      <div class="field"><label>جدول قاعده‌ها</label>
        <div class="item-card" v-for="(r, i) in unit.grammar.rows" :key="i">
          <div class="item-head"><span class="idx">ردیف {{ i + 1 }}</span><button class="btn btn-danger" @click="removeGrammarRow(i)">حذف</button></div>
          <input type="text" v-model="r[0]" placeholder="توضیح فارسی قاعده" style="margin-bottom:.4em" />
          <input type="text" v-model="r[1]" placeholder="جمله‌ی درست (با [[g:...]])" style="margin-bottom:.4em" />
          <input type="text" v-model="r[2]" placeholder="جمله‌ی غلط" />
        </div>
        <button class="btn btn-add" @click="addGrammarRow">+ افزودن ردیف</button>
      </div>
      <div class="field"><label>توضیح خطاها (elab)</label><input type="text" v-model="unit.grammar.elab" /></div>
      <div class="field"><label>خطاهای واقعی (wrong → right)</label>
        <div class="row2" v-for="(e, i) in unit.grammar.errors" :key="i" style="margin-bottom:.4em">
          <input type="text" v-model="e[0]" placeholder="غلط" />
          <div style="display:flex;gap:.4em">
            <input type="text" v-model="e[1]" placeholder="درست" />
            <button class="btn btn-danger" @click="removeGrammarError(i)">×</button>
          </div>
        </div>
        <button class="btn btn-add" @click="addGrammarError">+ افزودن خطا</button>
      </div>
      <div class="field"><label>Interview trigger</label><textarea v-model="unit.grammar.trigger" rows="2"></textarea></div>
    </fieldset>

    <fieldset>
      <legend>کالوکیشن</legend>
      <div class="row2">
        <div class="field"><label>عنوان بخش</label><input type="text" v-model="unit.colls.h" /></div>
        <div class="field"><label>Label</label><input type="text" v-model="unit.colls.lab" /></div>
      </div>
      <div class="field"><label>گروه‌های کالوکیشن</label>
        <div class="item-card" v-for="(g, i) in unit.colls.groups" :key="i">
          <div class="item-head"><span class="idx">گروه {{ i + 1 }}</span><button class="btn btn-danger" @click="removeCollGroup(i)">حذف</button></div>
          <div class="row2">
            <input type="text" v-model="g.h" placeholder="highly" />
            <input type="text" v-model="g.n" placeholder="توضیح فارسی گروه" />
          </div>
          <label style="margin-top:.4em">ترکیب‌های درست (هر خط یکی)</label>
          <textarea rows="2" :value="g.ok.join('\n')" @change="(e: Event) => (g.ok = linesToArr((e.target as HTMLTextAreaElement).value))"></textarea>
          <input type="text" v-model="g.no" placeholder="ترکیب غلط (اختیاری)" style="margin-top:.4em" />
        </div>
        <button class="btn btn-add" @click="addCollGroup">+ افزودن گروه</button>
      </div>
      <div class="field"><label>جدول ترکیب‌ها (phrase / فارسی / غلط)</label>
        <div class="row3" v-for="(r, i) in unit.colls.rows || []" :key="i" style="margin-bottom:.4em">
          <input type="text" v-model="r[0]" placeholder="apply for a job" />
          <input type="text" v-model="r[1]" placeholder="فارسی" />
          <div style="display:flex;gap:.4em">
            <input type="text" v-model="r[2] as string" placeholder="غلط (اختیاری)" />
            <button class="btn btn-danger" @click="removeCollRow(i)">×</button>
          </div>
        </div>
        <button class="btn btn-add" @click="addCollRow">+ افزودن ردیف</button>
      </div>
      <div class="field"><label>مثال‌ها</label>
        <div class="item-card" v-for="(ex, i) in unit.colls.ex" :key="i">
          <div class="item-head"><span class="idx">مثال {{ i + 1 }}</span><button class="btn btn-danger" @click="removeCollEx(i)">حذف</button></div>
          <textarea v-model="ex[0]" rows="2" placeholder="English (با [[c:...]])" style="margin-bottom:.4em"></textarea>
          <textarea v-model="ex[1]" rows="2" placeholder="فارسی (با [[c:...]])"></textarea>
        </div>
        <button class="btn btn-add" @click="addCollEx">+ افزودن مثال</button>
      </div>
    </fieldset>

    <fieldset>
      <legend>واژه (Vocab)</legend>
      <div class="row2">
        <div class="field"><label>عنوان بخش</label><input type="text" v-model="unit.vocab.h" /></div>
        <div class="field"><label>Label</label><input type="text" v-model="unit.vocab.lab" /></div>
      </div>
      <div class="field"><label>دسته‌های واژه</label>
        <div class="item-card" v-for="(s, si) in unit.vocab.sets || []" :key="si">
          <div class="item-head"><span class="idx">دسته {{ si + 1 }}</span><button class="btn btn-danger" @click="removeVocabSet(si)">حذف دسته</button></div>
          <input type="text" v-model="s.u" placeholder="65 · Careers" style="margin-bottom:.5em" />
          <div class="row3" v-for="(c, ci) in s.chips" :key="ci" style="margin-bottom:.4em">
            <input type="text" v-model="c[0]" placeholder="word" />
            <input type="text" v-model="c[1]" placeholder="فارسی" />
            <div style="display:flex;gap:.4em">
              <input type="text" v-model="c[2]" placeholder="سطح (B1/B2/C1)" />
              <button class="btn btn-danger" @click="removeChip(si, ci)">×</button>
            </div>
          </div>
          <button class="btn btn-add" @click="addChip(si)">+ افزودن واژه</button>
        </div>
        <button class="btn btn-add" @click="addVocabSet">+ افزودن دسته</button>
      </div>
      <div class="field"><label>مثال‌ها</label>
        <div class="item-card" v-for="(ex, i) in unit.vocab.ex" :key="i">
          <div class="item-head"><span class="idx">مثال {{ i + 1 }}</span><button class="btn btn-danger" @click="removeVocabEx(i)">حذف</button></div>
          <textarea v-model="ex[0]" rows="2" placeholder="English (با [[w:...]])" style="margin-bottom:.4em"></textarea>
          <textarea v-model="ex[1]" rows="2" placeholder="فارسی (با [[w:...]])"></textarea>
        </div>
        <button class="btn btn-add" @click="addVocabEx">+ افزودن مثال</button>
      </div>
    </fieldset>

    <fieldset>
      <legend>مدرک (Cert) — اختیاری</legend>
      <template v-if="unit.cert">
        <div class="row2">
          <div class="field"><label>عنوان بخش</label><input type="text" v-model="unit.cert.h" /></div>
          <div class="field"><label>Exam</label><input type="text" v-model="unit.cert.exam" /></div>
        </div>
        <div class="field"><label>اصطلاح‌ها (term / فارسی / تگ)</label>
          <div class="row3" v-for="(t, i) in unit.cert.terms || []" :key="i" style="margin-bottom:.4em">
            <input type="text" v-model="t[0]" placeholder="low-code platform" />
            <input type="text" v-model="t[1]" placeholder="فارسی" />
            <div style="display:flex;gap:.4em">
              <input type="text" v-model="t[2]" placeholder="PL-900" />
              <button class="btn btn-danger" @click="removeCertTerm(i)">×</button>
            </div>
          </div>
          <button class="btn btn-add" @click="addCertTerm">+ افزودن اصطلاح</button>
        </div>
        <div class="field"><label>عنوان متن ریدینگ</label><input type="text" v-model="unit.cert.read!.t" /></div>
        <div class="field"><label>پاراگراف‌های ریدینگ</label>
          <div class="item-card" v-for="(p, i) in unit.cert.read?.body || []" :key="i">
            <div class="item-head"><span class="idx">پاراگراف {{ i + 1 }}</span><button class="btn btn-danger" @click="removeCertBody(i)">حذف</button></div>
            <textarea v-model="p[0]" rows="2" placeholder="English" style="margin-bottom:.4em"></textarea>
            <textarea v-model="p[1]" rows="2" placeholder="فارسی"></textarea>
          </div>
          <button class="btn btn-add" @click="addCertBody">+ افزودن پاراگراف</button>
        </div>
        <div class="field"><label>سؤال‌های بعد از ریدینگ (هر خط یکی)</label>
          <textarea rows="3" :value="(unit.cert.read?.qs || []).join('\n')"
            @change="(e: Event) => { if (unit.cert && unit.cert.read) unit.cert.read.qs = linesToArr((e.target as HTMLTextAreaElement).value) }"></textarea>
        </div>
        <div class="field"><label>چرا مهمه (why)</label><textarea v-model="unit.cert.why" rows="2"></textarea></div>
        <button class="btn btn-danger" @click="removeCert">حذف کل بخش مدرک</button>
      </template>
      <button v-else class="btn btn-add" @click="addCert">+ افزودن بخش مدرک</button>
    </fieldset>

    <fieldset>
      <legend>شنیدن (Listen)</legend>
      <div class="row2">
        <div class="field"><label>عنوان بخش</label><input type="text" v-model="unit.listen.h" /></div>
        <div class="field"><label>Label</label><input type="text" v-model="unit.listen.lab" /></div>
      </div>
      <div class="field"><label>تاکتیک</label><textarea v-model="unit.listen.tactic" rows="2"></textarea></div>
      <div class="field"><label>کجا (Where)</label><textarea v-model="unit.listen.where" rows="2"></textarea></div>
      <div class="field"><label>مراحل</label>
        <div class="row2" v-for="(s, i) in unit.listen.steps" :key="i" style="margin-bottom:.4em">
          <input type="text" v-model="unit.listen.steps[i]" />
          <button class="btn btn-danger" style="justify-self:start" @click="removeListenStep(i)">حذف</button>
        </div>
        <button class="btn btn-add" @click="addListenStep">+ افزودن مرحله</button>
      </div>

      <template v-if="unit.listen.rec">
        <div class="row2">
          <div class="field"><label>عنوان ضبط</label><input type="text" v-model="unit.listen.rec.h" /></div>
          <div class="field"><label>زمان</label><input type="text" v-model="unit.listen.rec.min" /></div>
        </div>
        <div class="field"><label>مراحل ضبط</label>
          <div class="row2" v-for="(s, i) in unit.listen.rec.steps || []" :key="i" style="margin-bottom:.4em">
            <input type="text" v-model="unit.listen.rec.steps![i]" />
            <button class="btn btn-danger" style="justify-self:start" @click="removeRecStep(i)">حذف</button>
          </div>
          <button class="btn btn-add" @click="addRecStep">+ افزودن مرحله</button>
        </div>
        <div class="field"><label>اشتباهات تلفظی برای رصد (گفته‌شده / درست / نکته)</label>
          <div class="row3" v-for="(w, i) in unit.listen.rec.watch || []" :key="i" style="margin-bottom:.4em">
            <input type="text" v-model="w[0]" placeholder="گفته‌شده" />
            <input type="text" v-model="w[1]" placeholder="درست" />
            <div style="display:flex;gap:.4em">
              <input type="text" v-model="w[2]" placeholder="نکته" />
              <button class="btn btn-danger" @click="removeWatch(i)">×</button>
            </div>
          </div>
          <button class="btn btn-add" @click="addWatch">+ افزودن</button>
        </div>
        <div class="field"><label>جملات مقایسه‌ای</label>
          <div class="row2" v-for="(c, i) in unit.listen.rec.compare || []" :key="i" style="margin-bottom:.4em">
            <input type="text" v-model="c[0]" placeholder="English" />
            <div style="display:flex;gap:.4em">
              <input type="text" v-model="c[1]" placeholder="فارسی" />
              <button class="btn btn-danger" @click="removeCompare(i)">×</button>
            </div>
          </div>
          <button class="btn btn-add" @click="addCompare">+ افزودن</button>
        </div>
        <button class="btn btn-danger" @click="removeRec">حذف بخش ضبط</button>
      </template>
      <button v-else class="btn btn-add" @click="addRec">+ افزودن بخش «ضبط خودت»</button>
    </fieldset>

    <fieldset>
      <legend>تولید (Production)</legend>
      <div class="field"><label>عنوان بخش</label><input type="text" v-model="unit.prod.h" /></div>
      <div class="field"><label>تمرین‌ها</label>
        <div class="item-card" v-for="(t, i) in unit.prod.tasks || []" :key="i">
          <div class="item-head"><span class="idx">تمرین {{ i + 1 }}</span><button class="btn btn-danger" @click="removeTask(i)">حذف</button></div>
          <div class="row2">
            <input type="text" v-model="t.k" placeholder="Phone · 60 sec" />
            <input type="number" v-model.number="t.lines" placeholder="تعداد خط برای نوشتن" />
          </div>
          <textarea v-model="t.t" rows="2" placeholder="متن تمرین" style="margin-top:.4em"></textarea>
        </div>
        <button class="btn btn-add" @click="addTask">+ افزودن تمرین</button>
      </div>
    </fieldset>

    <fieldset>
      <legend>جمله‌ی جمع‌بندی (Take-away)</legend>
      <textarea v-model="unit.take" rows="2"></textarea>
    </fieldset>

    <fieldset>
      <legend>آزمون (Quiz)</legend>
      <div class="item-card" v-for="(q, i) in unit.quiz" :key="i">
        <div class="item-head"><span class="idx">سؤال {{ i + 1 }}</span><button class="btn btn-danger" @click="removeQuiz(i)">حذف</button></div>
        <div class="row2">
          <div class="field"><label>مهارت</label>
            <select v-model="q.k">
              <option value="G">Grammar</option>
              <option value="C">Collocations</option>
              <option value="W">Word Skills</option>
              <option value="L">Listening</option>
              <option value="P">Production</option>
              <option value="X">Certification</option>
            </select>
          </div>
          <div class="checkline" style="align-items:center;margin-top:1.3em">
            <label class="checkline"><input type="checkbox" v-model="q.lines" /> پاسخ چندخطی</label>
            <label class="checkline" style="margin-right:1em"><input type="checkbox" v-model="q.old" /> یادآوری از درس قبل</label>
          </div>
        </div>
        <div class="field"><label>سؤال</label><textarea v-model="q.q" rows="2"></textarea></div>
        <div class="field"><label>گزینه‌ها (هر خط یکی، اگر چندگزینه‌ای نیست خالی بذار)</label>
          <textarea rows="2" :value="opText(q)" @change="(e: Event) => setOp(q, (e.target as HTMLTextAreaElement).value)"></textarea>
        </div>
        <div class="field"><label>ترجمه‌ی سؤال (qfa)</label><input type="text" v-model="q.qfa" /></div>
        <div class="row2">
          <div class="field"><label>پاسخ درست</label><input type="text" v-model="q.a" /></div>
          <div class="field"><label>توضیح پاسخ (afa)</label><input type="text" v-model="q.afa" /></div>
        </div>
      </div>
      <button class="btn btn-add" @click="addQuiz">+ افزودن سؤال</button>
    </fieldset>

    <div class="actions">
      <button class="btn btn-primary" @click="save">ذخیره (محلی)</button>
      <button class="btn" @click="downloadJson">دانلود JSON</button>
      <button class="btn btn-danger" @click="resetToFile">بازگشت به نسخه‌ی فایل</button>
      <span class="saved-msg">{{ savedMsg }}</span>
    </div>
    <p class="hint">
      ذخیره‌ی «محلی» فقط توی همین مرورگر می‌مونه (localStorage). برای این‌که تغییرات واقعاً در پروژه و گیت ذخیره بشه،
      روی «دانلود JSON» بزن و فایل دانلودشده رو جای‌گزین <code>src/data/units/{{ id }}.json</code> کن.
    </p>
  </div>
</template>
