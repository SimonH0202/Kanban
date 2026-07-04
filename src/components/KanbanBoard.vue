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
  <div class="kanban-board__container">
    <div class="kanban-board__header">
      <h1>{{ boardStore.board.title }}</h1>
      <button @click="addColumn" class="kanban-board__add-column">Add Column</button>
    </div>
    <div class="kanban-board">
      <KanbanColumn v-for="column in boardStore.board.columns" :key="column.id" :data="column" />
    </div>
  </div>
</template>

<style scoped>
.kanban-board {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  padding: 1rem;
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
}
.kanban-board__header {
  padding: 1rem 2rem;
  background-color: var(--color-background-soft);
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}
.kanban-board__add-column {
  padding: 0.5rem 1rem;
  background-color: var(--color-background);
  color: var(--text-on-primary);
  border: none;
  border-radius: var(--border-radius-button);
  cursor: pointer;
}
.kanban-board__add-column:hover {
  background-color: var(--color-background-hover);
}
.kanban-board__container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border-radius: var(--border-radius-outer);
  background-color: var(--vt-c-indigo);
}
</style>
