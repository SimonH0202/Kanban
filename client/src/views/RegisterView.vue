<script setup lang="ts">
import { ref } from 'vue'
import { register } from '@/api/api'
import { useRouter } from 'vue-router'

const router = useRouter()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')

const error = ref('')
const isLoading = ref(false)

async function submit() {
  if (isLoading.value) return

  error.value = ''

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  isLoading.value = true

  try {
    await register(email.value, password.value)
    await router.push({ name: 'login', query: { registered: '1' } })
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Registration failed'
    isLoading.value = false
  }
}
</script>

<template>
  <main
    class="flex h-svh w-full items-center justify-center bg-linear-to-r from-green-500 to-indigo-500 dark:bg-linear-to-r dark:from-indigo-900 dark:to-rose-900"
  >
    <form
      class="flex w-full max-h-full lg:max-w-sm flex-col gap-2 lg:gap-4 rounded-lg bg-white dark:bg-gray-800 p-8 shadow-md dark:text-gray-300"
      @submit.prevent="submit"
    >
      <div class="mb-4">
        <h1 class="text-2xl font-bold">Create Account</h1>
        <p class="text-sm text-gray-500">Create an account to start organizing your boards.</p>
      </div>
      <div class="flex flex-col gap-4 w-full">
        <div class="flex flex-col gap-1 w-full">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            required
            class="rounded-sm h-8 lg:h-12 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-gray-900 dark:text-gray-300 outline-blue-500"
          />
        </div>
        <div class="flex flex-col md:flex-row lg:flex-col gap-4">
          <div class="flex flex-col gap-1 w-full">
            <label for="password">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              autocomplete="new-password"
              required
              class="rounded-sm h-8 lg:h-12 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-gray-900 dark:text-gray-300 outline-blue-500"
            />
          </div>

          <div class="flex flex-col gap-1 w-full">
            <label for="confirm-password">Confirm Password</label>
            <input
              id="confirm-password"
              v-model="confirmPassword"
              type="password"
              autocomplete="new-password"
              required
              class="rounded-sm h-8 lg:h-12 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-gray-900 dark:text-gray-300 outline-blue-500"
            />
          </div>
        </div>
      </div>

      <p v-if="error" class="text-sm text-red-600 h-5 w-full">
        {{ error }}
      </p>
      <p v-else class="h-5 w-full"></p>

      <button
        type="submit"
        :disabled="isLoading"
        class="rounded-sm bg-blue-600 p-2 text-white disabled:opacity-50 hover:scale-101 hover:cursor-pointer"
      >
        Create Account
      </button>
      <p class="text-sm text-gray-500">
        Already have an account?
        <RouterLink to="/login" class="text-blue-600 hover:underline">Log in here</RouterLink>.
      </p>
    </form>
  </main>
</template>
