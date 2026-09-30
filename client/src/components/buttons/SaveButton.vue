<script setup lang="ts">
defineProps<{
  disableOn: boolean
}>()

defineEmits<{
  save: []
}>()
</script>

<template>
  <button
    class="rounded-md bg-blue-500 px-4 py-2 font-medium text-sm lg:text-md text-white hover:scale-105 hover:cursor-pointer hover:bg-blue-600 disabled:bg-gray-400 disabled:text-gray-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
    @click="$emit('save')"
    :disabled="disableOn"
  >
    Save
  </button>
</template>
