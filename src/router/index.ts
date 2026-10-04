import { START_LOCATION, createRouter, createWebHashHistory } from 'vue-router'
import LessonListView from '../views/LessonListView.vue'
import LessonView from '../views/LessonView.vue'
import LessonEditView from '../views/LessonEditView.vue'

// Hash history (e.g. #/lesson/u201) — works unmodified on GitHub Pages and
// any other static host, with no server rewrite rules needed for deep links.
// Three sections: lessons (/, /lesson/…), context (/context/…) and proverbs
// (/proverbs/…). Context and proverbs are lazy chunks; context data only comes
// from the dev server or the private site.
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
    { path: '/context/recruit', component: () => import('../views/ContextRecruitView.vue'), meta: { section: 'context' } },
    // Proverbs: public data, bundled as its own lazy chunk (src/data/proverbs.json from the proverb engine).
    { path: '/proverbs', name: 'proverbs', component: () => import('../views/ProverbsView.vue'), meta: { section: 'proverbs' } },
    { path: '/proverbs/practice', component: () => import('../views/ProverbsPracticeView.vue'), meta: { section: 'proverbs' } },
  ],
  scrollBehavior(to, from) {
    // ?at=<id> links scroll to that row themselves (jumpTo); jumping to the top here
    // would cancel their smooth scroll half-way.
    if (to.query.at) return false
    return to.path === from.path ? false : { top: 0 }
  },
})

// The private ctx.<domain> copy (the phone's home-screen app) opens on Context;
// only the first navigation, so the Lessons tab still works there.
router.beforeEach((to, from) => {
  if (from === START_LOCATION && to.path === '/' && location.hostname.startsWith('ctx.')) return '/context'
})

export default router
