import { createRouter, createWebHistory } from 'vue-router'
import BoardListView from '../views/BoardListView.vue'
import BoardView from '@/views/BoardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: BoardListView,
    },
    {
      path: '/boards/:boardId',
      name: 'board',
      component: BoardView,
    },
  ],
})

export default router
