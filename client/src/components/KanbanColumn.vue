<script setup lang="ts">
import type { Column } from '@/types/Column'
import { nextTick, ref } from 'vue'
import { VueDraggableNext } from 'vue-draggable-next'
import KanbanCard from './KanbanCard.vue'
import { useBoardStore } from '@/stores/board.ts'
import ContextMenu from './ContextMenu.vue'
import type { ContextMenuItem } from '@/types/Items.ts'

const draggable = VueDraggableNext

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
    action: deleteColumn,
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
  await Promise.all(
    props.data.cards.map((card, index) => boardStore.moveCard(card.id, props.data.id, index)),
  )
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

function deleteColumn() {
  boardStore.deleteColumn(props.data.id)
}
</script>

<template>
  <div class="w-80 h-fit flex flex-col bg-white/10 backdrop-blur-lg rounded-sm shadow-lg">
    <div class="bg-transparent flex flex-row justify-between items-center p-4">
      <button
        v-if="!isInputActive"
        class="flex items-center font-bold bg-blue-500 text-white rounded-full py-1 px-3 hover:scale-105 hover:cursor-pointer"
        @click="activateInput"
      >
        {{ data.title }}
      </button>
      <input
        v-else
        ref="inputRef"
        class="font-bold bg-blue-500 text-white rounded-sm py-1 px-3 outline-none"
        type="text"
        :value="data.title"
        @blur="updateTitle"
        @keyup.enter="updateTitle"
      />
      <ContextMenu :items="menuItems"></ContextMenu>
    </div>
    <draggable
      v-model="data.cards"
      class="p-4 flex flex-col gap-2 overflow-y-auto"
      item-key="id"
      group="cards"
      @change="updateColumn"
      :options="{
        animation: 200,
      }"
    >
      <KanbanCard
        v-for="card in data.cards"
        :key="card.id"
        :id="card.id"
        :columnId="card.columnId"
        :position="data.cards.indexOf(card)"
        :title="card.title"
        :description="card.description"
        :dueDate="card.dueDate"
        :createdAt="card.createdAt"
        :updatedAt="card.updatedAt"
      />
    </draggable>
    <button @click="addCard" class="text-white hover:scale-105 hover:cursor-pointer p-2">
      + Add Card
    </button>
  </div>
</template>
