import * as api from '@/api/api'
import type { User } from '@/types/User'
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const isInitialized = ref(false)

  const isAuthenticated = computed(() => user.value !== null)

  async function login(email: string, password: string) {
    user.value = await api.login(email, password)
  }

  async function logout() {
    await api.logout()
    user.value = null
  }

  async function checkAuth() {
    isLoading.value = true

    try {
      user.value = await api.getCurrentUser()
    } catch (error) {
      user.value = null
    } finally {
      isLoading.value = false
      isInitialized.value = true
    }
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    isInitialized,
    login,
    logout,
    checkAuth,
  }
})
