<script setup lang="ts">
import { useBoardStore } from '@/stores/board.ts'
import KanbanColumn from './KanbanColumn.vue'
import { provide } from 'vue'
import TagEditorButton from '../components/buttons/TagEditorButton.vue'

const boardStore = useBoardStore()

// Provide board to child columns for cross-column drag and drop
provide('board', boardStore.board)

function addColumn() {
  boardStore.addColumn({ title: `New Column ${boardStore.board.columns.length + 1}` })
}
</script>

<template>
  <div
    v-if="boardStore.board.id !== ''"
    class="flex h-full min-h-0 w-full flex-col overflow-hidden bg-linear-to-r from-green-500 to-indigo-500 dark:from-indigo-900 dark:to-rose-900"
  >
    <div
      class="flex h-13 shrink-0 items-center justify-between bg-white px-4 py-2 font-bold text-gray-900 shadow-md lg:text-xl dark:bg-gray-800 dark:text-gray-300"
    >
      <h1>{{ boardStore.board.title }}</h1>
      <TagEditorButton />
    </div>

    <div class="min-h-0 flex-1 overflow-x-auto overflow-y-hidden">
      <div class="flex h-full w-max min-w-full items-start gap-4 p-2">
        <KanbanColumn
          v-for="column in boardStore.board.columns"
          :key="column.id"
          :data="column"
          class="shrink-0"
        />

        <div
          class="flex h-fit w-80 shrink-0 flex-col overflow-hidden rounded-sm bg-white/10 p-2 shadow-lg backdrop-blur-lg"
        >
          <button class="w-full text-white hover:scale-105 hover:cursor-pointer" @click="addColumn">
            + Add Column
          </button>
        </div>
      </div>
    </div>
  </div>

  <div
    v-else
    class="flex h-full w-full items-center justify-center p-4 text-center text-gray-900 dark:text-gray-300"
  >
    Select a board from the left sidebar or create a new one to get started.
  </div>
</template>
