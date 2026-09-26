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
  error.value = ''
  isLoading.value = true

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    isLoading.value = false
    return
  }

  try {
    const user = await register(email.value, password.value)

    await router.push({
      name: 'login',
      query: { registered: '1' },
    })
    console.log('Registered User:', user)
  } catch (err: any) {
    error.value = err.message || 'An error occurred during registration'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <main
    class="flex min-h-screen items-center justify-center bg-linear-to-r from-green-500 to-indigo-500"
  >
    <form
      class="flex w-full max-w-sm flex-col gap-4 rounded-lg bg-white p-8 shadow-md"
      @submit.prevent="submit"
    >
      <div>
        <h1 class="text-2xl font-bold">Create Account</h1>
        <p class="text-sm text-gray-500">Create an account to start organizing your boards.</p>
      </div>

      <div class="flex flex-col gap-1">
        <label for="email">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          autocomplete="email"
          required
          class="rounded-sm border border-gray-300 p-2 outline-blue-500"
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
          class="rounded-sm border border-gray-300 p-2 outline-blue-500"
        />
      </div>

      <div class="flex flex-col gap-1">
        <label for="confirm-password">Confirm Password</label>
        <input
          id="confirm-password"
          v-model="confirmPassword"
          type="password"
          autocomplete="new-password"
          required
          class="rounded-sm border border-gray-300 p-2 outline-blue-500"
        />
      </div>

      <p v-if="error" class="text-sm text-red-600">
        {{ error }}
      </p>

      <button
        type="submit"
        :disabled="isLoading"
        class="rounded-sm bg-blue-600 p-2 text-white disabled:opacity-50 hover:scale-101 hover:cursor-pointer"
      >
        {{ isLoading ? 'Creating account...' : 'Create Account' }}
      </button>
      <p class="text-sm text-gray-500">
        Already have an account?
        <RouterLink to="/login" class="text-blue-600 hover:underline">Log in here</RouterLink>.
      </p>
    </form>
  </main>
</template>
