<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { verifyEmail } from '@/api/api'

const route = useRoute()
const router = useRouter()

const isLoading = ref(false)
const isVerified = ref(false)
const error = ref('')

const token = computed(() => {
  const value = route.query.token
  return typeof value === 'string' ? value : ''
})

const hasValidToken = computed(() => /^[a-f0-9]{64}$/.test(token.value))

async function submitVerification() {
  if (!hasValidToken.value || isLoading.value || isVerified.value) return

  isLoading.value = true
  error.value = ''

  try {
    await verifyEmail(token.value)
    isVerified.value = true
  } catch (err: unknown) {
    error.value =
      err instanceof Error ? err.message : 'Could not verify your email. Please try again.'
  } finally {
    isLoading.value = false
  }

  if (isVerified.value) {
    // Remove the consumed token from the address bar.
    await router.replace({
      name: 'verify-email',
      query: {},
    })
  }
}
</script>

<template>
  <main
    class="flex min-h-svh w-full items-center justify-center bg-linear-to-r from-green-500 to-indigo-500 p-4 dark:from-indigo-900 dark:to-rose-900"
  >
    <section
      class="flex w-full max-w-sm flex-col gap-4 rounded-lg bg-white p-8 shadow-md dark:bg-gray-800 dark:text-gray-300"
    >
      <h1 class="text-2xl font-bold">Verify your email</h1>

      <template v-if="isVerified">
        <p class="text-sm text-green-600 dark:text-green-400" role="status">
          Your email is verified. You can now log in.
        </p>

        <RouterLink
          to="/login"
          class="rounded-sm bg-blue-600 p-2 text-center text-white hover:bg-blue-700"
        >
          Go to login
        </RouterLink>
      </template>

      <template v-else>
        <p v-if="hasValidToken" class="text-sm">Click below to confirm your email address.</p>

        <p v-else class="text-sm text-red-600 dark:text-red-400" role="alert">
          This link is missing a valid verification token. Open the link from your email, or request
          a new one from the login page.
        </p>

        <p v-if="error" class="wrap-break-word text-sm text-red-600 dark:text-red-400" role="alert">
          {{ error }}
        </p>

        <button
          v-if="hasValidToken"
          type="button"
          :disabled="isLoading"
          class="rounded-sm bg-blue-600 p-2 text-white enabled:hover:cursor-pointer enabled:hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          @click="submitVerification"
        >
          {{ isLoading ? 'Verifying...' : 'Verify email' }}
        </button>

        <RouterLink to="/login" class="text-sm text-blue-600 hover:underline dark:text-blue-400">
          Back to login
        </RouterLink>
      </template>
    </section>
  </main>
</template>
