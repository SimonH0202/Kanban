<script setup lang="ts">
defineEmits(['toggle'])
</script>

<template>
  <button
    @click="$emit('toggle')"
    class="flex flex-col justify-center items-center w-8 h-8 gap-1 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    <span class="block w-5 h-[2px] bg-gray-900 dark:bg-gray-300"></span>
    <span class="block w-5 h-[2px] bg-gray-900 dark:bg-gray-300"></span>
    <span class="block w-5 h-[2px] bg-gray-900 dark:bg-gray-300"></span>
  </button>
</template>
