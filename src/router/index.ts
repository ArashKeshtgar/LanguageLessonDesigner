import { createRouter, createWebHistory } from 'vue-router'
import LessonListView from '../views/LessonListView.vue'
import LessonView from '../views/LessonView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'lessons', component: LessonListView },
    { path: '/lesson/:id', name: 'lesson', component: LessonView },
  ],
})

export default router
