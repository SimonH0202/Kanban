<script setup lang="ts">
import type { Column } from '@/types/Column'
import { nextTick, ref } from 'vue'
import { VueDraggableNext } from 'vue-draggable-next'
import KanbanCard from './KanbanCard.vue'
import { useBoardStore } from '@/stores/board.ts'

const draggable = VueDraggableNext

const props = defineProps<{
  data: Column
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const isInputActive = ref(false)

const boardStore = useBoardStore()

function updateTitle(event: FocusEvent) {
  const target = event.target as HTMLInputElement
  boardStore.updateColumn(props.data.id, { title: target.value })
  isInputActive.value = false
}

function activateInput() {
  isInputActive.value = true
  nextTick(() => {
    inputRef.value?.focus()
  })
}

function addCard() {
  boardStore.addCard(props.data.id, {
    title: 'New Card',
    description: '',
  })
}
</script>

<template>
  <div class="kanban-column">
    <div v-if="!isInputActive" @click="activateInput" class="kanban-column__title">
      {{ data.title }}
    </div>
    <input
      v-else
      ref="inputRef"
      @focusout="updateTitle"
      type="text"
      :placeholder="data.title"
      :value="data.title"
      class="kanban-column__input"
    />
    <draggable
      v-model="data.cards"
      class="kanban-column__content"
      item-key="id"
      group="cards"
      :options="{
        ghostClass: 'kanban-card--ghost',
        dragClass: 'kanban-card--drag',
        animation: 200,
      }"
    >
      <KanbanCard
        v-for="card in data.cards"
        :key="card.id"
        :id="card.id"
        :columnId="card.columnId"
        :title="card.title"
        :description="card.description"
        :dueDate="card.dueDate"
        :createdAt="card.createdAt"
        :updatedAt="card.updatedAt"
      />
    </draggable>
    <button @click="addCard" class="kanban-column__add-card-button">Add Card</button>
  </div>
</template>

<style scoped>
.kanban-column {
  display: flex;
  flex-direction: column;
  width: 300px;
  height: 100%;
  min-height: 0;
  margin-right: 1rem;
  background-color: var(--color-background);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  border: 1px solid var(--color-border);
  border-radius: 24px;
  overflow: hidden;
}
.kanban-column__title,
.kanban-column__input {
  font-size: 1.2rem;
  font-weight: bold;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 1rem;
  border: none;
  box-sizing: border-box;
  line-height: 1.5;
  width: 100%;
}

.kanban-column__title {
  cursor: pointer;
}

.kanban-column__input {
  outline: none;
  background-color: var(--color-border);
  color: var(--color-text);
  appearance: none;
  -webkit-appearance: none;
  border-radius: 0;
}
.kanban-column__input:focus {
  background-color: var(--color-border);
}
.kanban-column__add-card-button {
  width: 100%;
  padding: 1rem;
  background-color: var(--color-background);
  color: var(--text-on-primary);
  border: none;
  border-top: 1px solid var(--color-border);
  outline: none;
  border-radius: var(--border-radius);
  cursor: pointer;
}
.kanban-column__add-card-button:hover {
  background-color: var(--color-background-soft);
}
.kanban-column__content {
  flex: 1;
  min-height: 0;
  padding: 1rem;
  gap: 1rem;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) var(--color-background);
  transition: background-color 0.2s ease;
}

.kanban-column__content::-webkit-scrollbar {
  width: 8px;
}

.kanban-column__content::-webkit-scrollbar-track {
  background: var(--color-background);
}

.kanban-column__content::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 4px;
}

.kanban-column__content::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-secondary);
}

.kanban-card--ghost {
  opacity: 0.5;
  background-color: var(--color-background-soft);
  transition: all 0.2s ease;
}

.kanban-card--drag {
  opacity: 0;
}
</style>
