import { createRouter, createWebHashHistory } from 'vue-router'
import LessonListView from '../views/LessonListView.vue'
import LessonView from '../views/LessonView.vue'
import LessonEditView from '../views/LessonEditView.vue'

// Hash history (e.g. #/lesson/u201) — works unmodified on GitHub Pages and
// any other static host, with no server rewrite rules needed for deep links.
// Two sections: lessons (/, /lesson/…) and context (/context/…). The context
// views are lazy chunks; their data only comes from the dev server.
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'lessons', component: LessonListView, meta: { section: 'lessons' } },
    { path: '/lesson/:id', name: 'lesson', component: LessonView, meta: { section: 'lessons' } },
    { path: '/lesson/:id/edit', name: 'lesson-edit', component: LessonEditView, meta: { section: 'lessons' } },
    { path: '/context', name: 'context', component: () => import('../views/ContextHomeView.vue'), meta: { section: 'context' } },
    { path: '/context/p/:key', name: 'context-pack', component: () => import('../views/ContextPackView.vue'), meta: { section: 'context' } },
    { path: '/context/gaps', component: () => import('../views/ContextListView.vue'), meta: { section: 'context', list: 'gaps' } },
    { path: '/context/bugs', component: () => import('../views/ContextListView.vue'), meta: { section: 'context', list: 'bugs' } },
    { path: '/context/work', component: () => import('../views/ContextListView.vue'), meta: { section: 'context', list: 'work' } },
  ],
  scrollBehavior(to, from) {
    return to.path === from.path ? false : { top: 0 }
  },
})

export default router
