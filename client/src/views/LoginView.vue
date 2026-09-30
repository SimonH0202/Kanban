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
    class="flex h-svh w-full items-center justify-center bg-linear-to-r from-green-500 to-indigo-500 dark:from-indigo-900 dark:to-rose-900"
  >
    <form
      class="flex max-h-full w-full flex-col overflow-y-auto rounded-lg bg-white p-8 shadow-md lg:max-w-sm lg:gap-4 dark:bg-gray-800 dark:text-gray-300"
      @submit.prevent="submit"
    >
      <div class="mb-4 shrink-0">
        <h1 class="text-2xl font-bold">Log In</h1>
        <p class="text-sm text-gray-500">Log in to your account to start organizing your boards.</p>
      </div>

      <div class="flex w-full shrink-0 flex-col gap-4">
        <div class="flex w-full flex-col gap-1">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            required
            class="h-8 rounded-sm border border-gray-300 bg-white p-2 text-gray-900 outline-blue-500 lg:h-12 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          />
        </div>

        <div class="flex w-full flex-col gap-1">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
            class="h-8 rounded-sm border border-gray-300 bg-white p-2 text-gray-900 outline-blue-500 lg:h-12 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          />
        </div>
      </div>

      <p
        v-if="route.query.registered === '1'"
        class="shrink-0 text-sm text-green-600"
        role="status"
      >
        Account created successfully! Please log in.
      </p>

      <p
        class="min-h-5 w-full shrink-0 break-words text-sm text-red-600"
        :role="error ? 'alert' : undefined"
      >
        {{ error }}
      </p>

      <button
        type="submit"
        :disabled="isLoading"
        class="shrink-0 rounded-sm bg-blue-600 p-2 text-white hover:scale-101 hover:cursor-pointer disabled:opacity-50"
      >
        {{ isLoading ? 'Logging in...' : 'Log In' }}
      </button>

      <p class="shrink-0 text-sm text-gray-500">
        Don't have an account?
        <RouterLink to="/register" class="text-blue-600 hover:underline"> Register here</RouterLink
        >.
      </p>
    </form>
  </main>
</template>
