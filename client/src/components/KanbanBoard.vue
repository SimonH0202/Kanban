<script setup lang="ts">
import { useBoardStore } from '@/stores/board.ts'
import KanbanColumn from './KanbanColumn.vue'
import { provide } from 'vue'

const boardStore = useBoardStore()

// Provide board to child columns for cross-column drag and drop
provide('board', boardStore.board)

function addColumn() {
  boardStore.addColumn({ title: `New Column ${boardStore.board.columns.length + 1}` })
}
</script>

<template>
  <div
    v-if="boardStore.board"
    class="bg-linear-to-r from-green-500 to-indigo-500 dark:bg-linear-to-r dark:from-indigo-900 dark:to-rose-900 h-screen w-full flex flex-col overflow-hidden"
  >
    <!-- Header -->
    <div
      class="h-13 flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-300 text-xl font-bold shadow-md"
    >
      <h1>{{ boardStore.board.title }}</h1>
    </div>

    <!-- Scrollable board -->
    <div class="flex-1 min-h-0 overflow-x-auto overflow-y-hidden">
      <div class="flex items-start gap-4 p-2 w-max min-w-full">
        <KanbanColumn
          v-for="column in boardStore.board.columns"
          :key="column.id"
          :data="column"
          class="shrink-0"
        />

        <!-- Add column -->
        <div
          class="w-80 shrink-0 h-fit flex flex-col bg-white/10 backdrop-blur-lg rounded-sm shadow-lg overflow-hidden p-2"
        >
          <button @click="addColumn" class="w-full text-white hover:scale-105 hover:cursor-pointer">
            + Add Column
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
