import { createRouter, createWebHistory } from 'vue-router'
import BoardListView from '../views/BoardListView.vue'
import BoardView from '@/views/BoardView.vue'
import RegisterView from '@/views/RegisterView.vue'
import LoginView from '@/views/LoginView.vue'
import VerifyEmailView from '@/views/VerifyEmailView.vue'
import { useAuthStore } from '@/stores/auth.ts'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: BoardListView,
      meta: { requiresAuth: true },
    },
    {
      path: '/boards/:boardId',
      name: 'board',
      component: BoardView,
      props: true,
      meta: { requiresAuth: true },
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/verify-email',
      name: 'verify-email',
      component: VerifyEmailView,
    },
  ],
})

router.beforeEach(async (to) => {
  if (to.name === 'verify-email') return

  const authStore = useAuthStore()

  // On the first navigation after loading/reloading the app,
  // check whether we already have a valid login cookie.
  if (!authStore.isInitialized) {
    await authStore.checkAuth()
  }

  // Protected route + not logged in → login
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return {
      name: 'login',
    }
  }

  // Already logged in → don't show login/register
  if ((to.name === 'login' || to.name === 'register') && authStore.isAuthenticated) {
    return {
      name: 'home',
    }
  }
})

export default router
