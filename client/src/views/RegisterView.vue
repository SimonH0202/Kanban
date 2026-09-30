<script setup lang="ts">
import { ref } from 'vue'
import { register, resendVerificationEmail } from '@/api/api'
import { useRouter } from 'vue-router'

const router = useRouter()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')

const error = ref('')
const message = ref('')
const isLoading = ref(false)
const accountCreated = ref(false)

async function submit() {
  if (isLoading.value || accountCreated.value) return

  error.value = ''
  message.value = ''

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  if ([...password.value].length < 15) {
    error.value = 'Password must be at least 15 characters'
    return
  }

  if (new TextEncoder().encode(password.value).length > 72) {
    error.value = 'Password must not exceed 72 bytes'
    return
  }

  isLoading.value = true

  try {
    const result = await register(email.value, password.value)
    accountCreated.value = true
    message.value = result.message

    if (result.verificationEmailSent) {
      await router.push({
        name: 'login',
        query: { registered: '1' },
      })
    }
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Registration failed'
  } finally {
    isLoading.value = false
  }
}

async function resendVerification() {
  if (isLoading.value || !accountCreated.value) return

  error.value = ''
  isLoading.value = true

  try {
    const result = await resendVerificationEmail(email.value, password.value)

    message.value = result.message
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Could not resend verification email'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <main
    class="flex h-svh w-full items-center justify-center bg-linear-to-r from-green-500 to-indigo-500 dark:bg-linear-to-r dark:from-indigo-900 dark:to-rose-900"
  >
    <form
      class="flex w-full max-h-full lg:max-w-sm flex-col gap-2 lg:gap-4 rounded-lg bg-white dark:bg-gray-800 p-8 shadow-md dark:text-gray-300 overflow-y-auto"
      @submit.prevent="submit"
    >
      <div class="mb-2 lg:mb-4">
        <h1 class="text-lg lg:text-2xl font-bold">Create Account</h1>
        <p class="hidden lg:block text-sm text-gray-500">
          Create an account to start organizing your boards.
        </p>
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
            :disabled="isLoading || accountCreated"
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
              :disabled="isLoading || accountCreated"
            />
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Use at least 15 characters. Spaces are allowed.
            </p>
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
              :disabled="isLoading || accountCreated"
            />
          </div>
        </div>
      </div>

      <p v-if="error" class="w-full wrap-break-word text-sm text-red-600" role="alert">
        {{ error }}
      </p>

      <p
        v-if="message"
        class="w-full wrap-break-word text-sm text-gray-700 dark:text-gray-300"
        role="status"
      >
        {{ message }}
      </p>

      <button
        v-if="!accountCreated"
        type="submit"
        :disabled="isLoading"
        class="rounded-sm bg-blue-600 p-2 text-white enabled:hover:scale-101 enabled:hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 mt-4"
      >
        {{ isLoading ? 'Creating account...' : 'Create Account' }}
      </button>

      <button
        v-else
        type="button"
        :disabled="isLoading"
        class="rounded-sm bg-blue-600 p-2 text-white enabled:hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        @click="resendVerification"
      >
        {{ isLoading ? 'Sending...' : 'Resend verification email' }}
      </button>
      <p class="text-sm text-gray-500">
        Already have an account?
        <RouterLink to="/login" class="text-blue-600 hover:underline">Log in here</RouterLink>.
      </p>
    </form>
  </main>
</template>
