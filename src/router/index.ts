import { createRouter, createWebHashHistory } from 'vue-router'
import LessonListView from '../views/LessonListView.vue'
import LessonView from '../views/LessonView.vue'
import LessonEditView from '../views/LessonEditView.vue'

// Hash history (e.g. #/lesson/u201) — works unmodified on GitHub Pages and
// any other static host, with no server rewrite rules needed for deep links.
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'lessons', component: LessonListView },
    { path: '/lesson/:id', name: 'lesson', component: LessonView },
    { path: '/lesson/:id/edit', name: 'lesson-edit', component: LessonEditView },
  ],
})

export default router
