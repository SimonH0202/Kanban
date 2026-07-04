<script setup lang="ts">
import type { Column } from '@/types/Column'
import { nextTick, ref, inject } from 'vue'
import { VueDraggableNext } from 'vue-draggable-next'
import KanbanCard from './KanbanCard.vue'
import { generateUniqueId } from '@/util/util.ts'

const draggable = VueDraggableNext

const props = defineProps<{
  data: Column
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const isInputActive = ref(false)

const board = inject<any>('board', null)

function updateTitle(event: FocusEvent) {
  const target = event.target as HTMLInputElement
  props.data.title = target.value
  isInputActive.value = false
}

function activateInput() {
  isInputActive.value = true
  nextTick(() => {
    inputRef.value?.focus()
  })
}

function addCard() {
  const newCard = {
    id: `card-${generateUniqueId()}`,
    columnId: props.data.id,
    title: `New Card ${props.data.cards.length + 1}`,
    description: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  props.data.cards.push(newCard)
}
</script>

<template>
  <div class="kanban-column">
    <h2 v-if="!isInputActive" @click="activateInput" class="kanban-column__title">
      {{ data.title }}
    </h2>
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
.kanban-column__title {
  font-size: 1.2rem;
  font-weight: bold;
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
}
.kanban-column__title:hover {
  background-color: var(--color-background-soft);
  cursor: pointer;
}
.kanban-column__input {
  font-size: 1.2rem;
  font-weight: bold;
  padding: 1rem;
  border: none;
  border-bottom: 1px solid var(--color-border);
  outline: none;
  background-color: var(--color-background-soft);
  color: var(--color-text);
}
.kanban-column__input:focus {
  background-color: var(--color-background);
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
