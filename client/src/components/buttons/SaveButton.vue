<script setup lang="ts">
defineProps<{
  unsavedChanges: boolean
}>()

defineEmits<{
  save: []
}>()
</script>

<template>
  <button
    class="rounded-md bg-blue-500 px-4 py-2 font-medium text-white hover:scale-105 hover:cursor-pointer hover:bg-blue-600 disabled:bg-gray-400 disabled:text-gray-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
    @click="$emit('save')"
    :disabled="!unsavedChanges"
  >
    Save Changes
  </button>
</template>
