<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'
import { useRoute } from 'vue-router'
import { ApiError, resendVerificationEmail } from '@/api/api'
import PasswordInput from '@/components/input/PasswordInput.vue'

const authStore = useAuthStore()
const route = useRoute()

const email = ref('')
const password = ref('')

const error = ref('')
const success = ref('')
const needsVerification = ref(false)
const isLoading = ref(false)
const isResending = ref(false)

watch([email, password], () => {
  needsVerification.value = false
  error.value = ''
  success.value = ''
})

async function submit() {
  if (isLoading.value || isResending.value) return

  error.value = ''
  success.value = ''
  needsVerification.value = false
  isLoading.value = true

  try {
    await authStore.login(email.value, password.value)
    await router.push('/')
  } catch (err: unknown) {
    needsVerification.value = err instanceof ApiError && err.code === 'EMAIL_NOT_VERIFIED'
    error.value = err instanceof Error ? err.message : 'Could not log in. Please try again.'
  } finally {
    isLoading.value = false
  }
}

async function resendVerification() {
  if (isLoading.value || isResending.value) return

  error.value = ''
  success.value = ''
  isResending.value = true

  try {
    const result = await resendVerificationEmail(email.value, password.value)

    success.value = result.message
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Could not resend the verification email.'
  } finally {
    isResending.value = false
  }
}
</script>

<template>
  <main
    class="flex h-svh w-full items-center justify-center bg-linear-to-r from-green-500 to-indigo-500 dark:from-indigo-900 dark:to-rose-900"
  >
    <form
      class="flex max-h-full w-full flex-col overflow-y-auto rounded-lg bg-white p-8 shadow-md lg:max-w-sm gap-2 lg:gap-4 dark:bg-gray-800 dark:text-gray-300"
      @submit.prevent="submit"
    >
      <div class="mb-2 lg:mb-4 shrink-0">
        <h1 class="text-lg lg:text-2xl font-bold">Log In</h1>
        <p class="hidden lg:block text-sm text-gray-500">
          Log in to your account to start organizing your boards.
        </p>
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
          <PasswordInput v-model:password="password" />
        </div>
      </div>

      <p
        v-if="route.query.registered === '1'"
        class="shrink-0 text-sm text-green-600"
        role="status"
      >
        Account created. Check your inbox for the verification email before logging in.
      </p>

      <p
        class="min-h-5 w-full shrink-0 wrap-break-word text-sm text-red-600"
        :role="error ? 'alert' : undefined"
      >
        {{ error }}
      </p>
      <p v-if="success" class="shrink-0 text-sm text-green-600" role="status">
        {{ success }}
      </p>

      <button
        v-if="needsVerification"
        type="button"
        :disabled="isLoading || isResending"
        class="shrink-0 rounded-sm bg-gray-200 p-2 text-gray-900 hover:cursor-pointer hover:scale-101 disabled:cursor-not-allowed disabled:opacity-50 disabled:scale-100 dark:bg-gray-700 dark:text-gray-300"
        @click="resendVerification"
      >
        {{ isResending ? 'Sending...' : 'Resend verification email' }}
      </button>

      <button
        type="submit"
        :disabled="isLoading || isResending"
        class="shrink-0 rounded-sm bg-blue-600 p-2 text-white hover:scale-101 hover:cursor-pointer disabled:opacity-50 disabled:scale-100"
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
