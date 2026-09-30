<script setup lang="ts">
import type { Column } from '@/types/Column'
import { nextTick, ref } from 'vue'
import { VueDraggableNext } from 'vue-draggable-next'
import KanbanCard from './KanbanCard.vue'
import { useBoardStore } from '@/stores/board.ts'
import ContextMenu from '../components/overlays/ContextMenu.vue'
import type { ContextMenuItem } from '@/types/Items.ts'
import { useConfirmationStore } from '@/stores/confirmation.ts'

const draggable = VueDraggableNext

const confirmationStore = useConfirmationStore()

const props = defineProps<{
  data: Column
}>()

const menuItems: ContextMenuItem[] = [
  {
    label: 'Add Card',
    action: addCard,
    danger: false,
  },
  {
    label: 'Delete Column',
    action: confirmationStore.requestConfirmation.bind(
      confirmationStore,
      'Do you really want to delete this column?',
      deleteColumn,
      () => {},
    ),
    danger: true,
  },
]

const inputRef = ref<HTMLInputElement | null>(null)
const isInputActive = ref(false)

const boardStore = useBoardStore()

function updateTitle(event: Event) {
  const target = event.target as HTMLInputElement
  boardStore.updateColumn(props.data.id, { title: target.value })
  isInputActive.value = false
}

async function updateColumn() {
  try {
    await boardStore.saveCardOrder()
  } catch (error) {
    console.error('Failed to save card order:', error)
  }
}

function activateInput() {
  isInputActive.value = true
  nextTick(() => {
    inputRef.value?.focus()
  })
}

async function addCard() {
  await boardStore.addCard(props.data.id, {
    title: 'New Card',
    description: '',
  })
}

async function deleteColumn() {
  await boardStore.deleteColumn(props.data.id)
}
</script>

<template>
  <div
    class="flex h-fit max-h-full min-h-0 w-80 shrink-0 flex-col overflow-hidden rounded-sm bg-white/10 shadow-lg backdrop-blur-lg"
  >
    <div class="flex shrink-0 items-center justify-between bg-transparent p-4">
      <button
        v-if="!isInputActive"
        class="rounded-full bg-blue-500 px-3 py-1 font-bold text-white hover:scale-105 hover:cursor-pointer"
        @click="activateInput"
      >
        {{ data.title }}
      </button>

      <input
        v-else
        ref="inputRef"
        class="min-w-0 rounded-sm bg-blue-500 px-3 py-1 font-bold text-white outline-none"
        type="text"
        :value="data.title"
        @blur="updateTitle"
        @keyup.enter="updateTitle"
      />

      <ContextMenu :items="menuItems" :dotColor="'white'" />
    </div>

    <draggable
      v-model="data.cards"
      class="flex min-h-0 flex-col gap-2 overflow-y-auto p-4"
      item-key="id"
      group="cards"
      ghost-class="card-ghost"
      @end="updateColumn"
      :animation="200"
      :delay="250"
      :delay-on-touch-only="true"
      :touch-start-threshold="5"
    >
      <KanbanCard
        v-for="(card, index) in data.cards"
        :key="card.id"
        :id="card.id"
        :columnId="card.columnId"
        :position="index"
        :title="card.title"
        :description="card.description"
        :dueDate="card.dueDate"
        :createdAt="card.createdAt"
        :updatedAt="card.updatedAt"
        :tags="card.tags"
        class="shrink-0"
      />
    </draggable>

    <button class="shrink-0 p-2 text-white hover:scale-105 hover:cursor-pointer" @click="addCard">
      + Add Card
    </button>
  </div>
</template>

<style scoped>
:deep(.card-ghost) {
  opacity: 0.35;
  outline: 2px dashed #60a5fa;
  outline-offset: -2px;
}
</style>
