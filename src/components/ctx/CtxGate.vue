<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { ctx, ctxError, ctxLoading, loadContext } from '../../lib/context'

// Loads the context once and shows the page only when it is there.
onMounted(() => loadContext())
</script>

<template>
  <div v-if="ctx"><slot /></div>
  <div v-else class="lesson-page">
    <div class="hero" style="--hero:#22303d">
      <div class="tag">Context engine</div>
      <h1>Context</h1>
      <div class="hfa">بانک حقیقت، پروژه‌ها، شکاف‌ها، کارها و باگ‌ها</div>
    </div>
    <div class="sec">
      <p v-if="ctxLoading" class="fs">در حال بارگذاری…</p>
      <template v-else-if="ctxError === 'local-only'">
        <p class="fs">این بخش اطلاعات شخصی دارد (تماس، سابقه‌ی کار، سرورها و دیتابیس‌ها)، پس در نسخه‌ی منتشرشده نیست.
          فقط روی کامپیوتر خودت با <code class="en">npm run dev</code> باز می‌شود.</p>
        <p class="fs"><RouterLink to="/">← برگشت به درس‌ها</RouterLink></p>
      </template>
      <template v-else-if="ctxError">
        <p class="fs">بارگذاری نشد: <span class="en">{{ ctxError }}</span></p>
        <p class="fs">در پوشه‌ی <span class="en">Context\engine</span> اجرا کن: <code class="en">python ctx.py export</code> — بعد صفحه را تازه کن.</p>
        <button class="btn" @click="loadContext(true)">دوباره</button>
      </template>
    </div>
  </div>
</template>
