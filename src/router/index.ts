import { createRouter, createWebHistory } from 'vue-router'
import LessonListView from '../views/LessonListView.vue'
import LessonView from '../views/LessonView.vue'
import LessonEditView from '../views/LessonEditView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'lessons', component: LessonListView },
    { path: '/lesson/:id', name: 'lesson', component: LessonView },
    { path: '/lesson/:id/edit', name: 'lesson-edit', component: LessonEditView },
  ],
})

export default router
