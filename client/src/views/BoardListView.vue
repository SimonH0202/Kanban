<script setup lang="ts">
import KanbanBoardList from '@/components/KanbanBoardList.vue'
</script>

<template>
  <div class="flex flex-row">
    <KanbanBoardList />
    <span class="text-gray-900 dark:text-gray-300 text-lg p-6 w-full h-full text-center">
      Select a board from the left sidebar or create a new one to get started.
    </span>
  </div>
</template>
