<script setup lang="ts">
defineProps<{
  id: string
  email: string
  showDeleteButton: boolean
}>()

defineEmits<{
  removeMember: [memberId: string]
}>()
</script>

<template>
  <div>
    <span
      class="rounded-sm px-2 py-1 bg-gray-200 dark:bg-indigo-900 dark:text-gray-300 text-gray-900 h-sm w-fit text-center flex items-center justify-center gap-1"
    >
      {{ email }}
      <button
        v-if="showDeleteButton"
        class="hover:cursor-pointer px-1 py-0.5 text-xs font-bold"
        @click="$emit('removeMember', id)"
      >
        ✕
      </button>
    </span>
  </div>
</template>
