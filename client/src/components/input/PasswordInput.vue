<script setup lang="ts">
import showIcon from '@/assets/icons/show.png'
import hideIcon from '@/assets/icons/hide.png'
import showIconBlack from '@/assets/icons/show-b.png'
import hideIconBlack from '@/assets/icons/hide-b.png'
import { computed, ref } from 'vue'

const props = defineProps<{
  password: string
  id?: string
  autocomplete?: 'current-password' | 'new-password'
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:password': [value: string]
}>()

const showPassword = ref(false)

const value = computed({
  get: () => props.password,
  set: (newValue: string) => emit('update:password', newValue),
})
</script>

<template>
  <div
    class="flex h-8 w-full items-center overflow-hidden rounded-sm border border-gray-300 lg:h-12 dark:border-gray-700"
  >
    <input
      :id="id ?? 'password'"
      v-model="value"
      :type="showPassword ? 'text' : 'password'"
      :autocomplete="autocomplete ?? 'current-password'"
      :disabled="props.disabled"
      required
      class="h-full min-w-0 flex-1 bg-white px-2 text-gray-900 outline-blue-500 dark:bg-gray-800 dark:text-gray-300"
    />

    <button
      type="button"
      :aria-label="showPassword ? 'Hide password' : 'Show password'"
      :aria-pressed="showPassword"
      :disabled="props.disabled"
      class="group flex aspect-square h-full shrink-0 items-center justify-center bg-gray-200 hover:cursor-pointer dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      @click="showPassword = !showPassword"
    >
      <img
        :src="showPassword ? hideIconBlack : showIconBlack"
        alt=""
        class="aspect-square w-6 object-contain group-hover:scale-105 dark:hidden"
      />
      <img
        :src="showPassword ? hideIcon : showIcon"
        alt=""
        class="hidden aspect-square w-6 object-contain group-hover:scale-105 dark:block"
      />
    </button>
  </div>
</template>
