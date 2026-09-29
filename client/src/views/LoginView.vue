<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'
import { useRoute } from 'vue-router'

const authStore = useAuthStore()
const route = useRoute()

const email = ref('')
const password = ref('')

const error = ref('')
const isLoading = ref(false)

async function submit() {
  error.value = ''
  isLoading.value = true

  try {
    const user = await authStore.login(email.value, password.value)

    router.push('/')
  } catch (err: any) {
    if (err.response) {
      error.value = err.response.data.message || 'Invalid email or password.'
      console.error(err.response.data)
    } else {
      error.value = 'An error occurred. Please try again later.'
      console.error(err)
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <main
    class="flex min-h-screen items-center justify-center bg-linear-to-r from-green-500 to-indigo-500 dark:bg-linear-to-r dark:from-indigo-900 dark:to-rose-900"
  >
    <form
      class="flex w-full max-w-sm flex-col gap-4 rounded-lg bg-white dark:bg-gray-800 p-8 shadow-md dark:text-gray-300"
      @submit.prevent="submit"
    >
      <div>
        <h1 class="text-2xl font-bold">Log In</h1>
        <p class="text-sm text-gray-500">Log in to your account to start organizing your boards.</p>
      </div>

      <div class="flex flex-col gap-1">
        <label for="email">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          autocomplete="email"
          required
          class="rounded-sm border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-gray-900 dark:text-gray-300 outline-blue-500"
        />
      </div>

      <div class="flex flex-col gap-1">
        <label for="password">Password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          autocomplete="new-password"
          required
          class="rounded-sm border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-gray-900 dark:text-gray-300 outline-blue-500"
        />
      </div>

      <p v-if="route.query.registered === '1'" class="text-sm text-green-600">
        Account created successfully! Please log in.
      </p>

      <p v-if="error" class="text-sm text-red-600 h-5 w-full">
        {{ error }}
      </p>
      <p v-else class="h-5 w-full"></p>

      <button
        type="submit"
        :disabled="isLoading"
        class="rounded-sm bg-blue-600 p-2 text-white disabled:opacity-50 hover:scale-101 hover:cursor-pointer"
      >
        {{ isLoading ? 'Logging in...' : 'Log In' }}
      </button>

      <p class="text-sm text-gray-500">
        Don't have an account?
        <RouterLink to="/register" class="text-blue-600 hover:underline">Register here</RouterLink>.
      </p>
    </form>
  </main>
</template>
