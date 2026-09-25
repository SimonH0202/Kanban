<script setup lang="ts">
import { useBoardStore } from '@/stores/board'
import { useCardEditorStore } from '@/stores/cardEditor'
import { formatDateToInputValueString } from '@/util/util'
import { nextTick, ref } from 'vue'
import trashIcon from '@/assets/icons/trash.png'

const isTitleActive = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

function activateInput() {
  isTitleActive.value = true
  nextTick(() => {
    inputRef.value?.focus()
  })
}

const cardEditorStore = useCardEditorStore()
const boardStore = useBoardStore()

function closeEditor() {
  cardEditorStore.stopEditing()
}

function saveCard() {
  if (cardEditorStore.currentCard) {
    boardStore.updateCard(cardEditorStore.currentCard.columnId, cardEditorStore.currentCard.id, {
      title: cardEditorStore.currentCard.title,
      description: cardEditorStore.currentCard.description,
      dueDate: cardEditorStore.currentCard.dueDate,
    })
  }
}

function deleteCard() {
  if (cardEditorStore.currentCard) {
    boardStore.deleteCard(cardEditorStore.currentCard.columnId, cardEditorStore.currentCard.id)
  }
  closeEditor()
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <button class="fixed inset-0 backdrop-blur-sm" @click="closeEditor"></button>
    <div class="z-50 bg-white rounded-sm shadow-lg w-200">
      <div class="text-gray-900 flex justify-end items-center p-4 border-b border-gray-300">
        <button class="text-lg font-bold hover:scale-105 hover:cursor-pointer" @click="closeEditor">
          ✕
        </button>
      </div>
      <div class="p-8 flex flex-col gap-4 text-gray-900">
        <div class="w-full h-fit flex justify-end">
          <button class="h-fit w-fit hover:cursor-pointer hover:scale-105" @click="deleteCard">
            <img :src="trashIcon" alt="Delete Card" class="w-5 h-5" />
          </button>
        </div>
        <button
          v-if="!isTitleActive"
          class="w-full font-bold text-left text-gray-900 text-2xl hover:cursor-pointer"
          @click="activateInput"
        >
          {{ cardEditorStore.currentCard?.title || 'Untitled Card' }}
        </button>
        <input
          v-else
          ref="inputRef"
          id="card-title"
          class="w-full text-left text-gray-900 text-2xl font-bold border-gray-300 outline-blue-500 rounded-sm focus:p-2"
          type="text"
          :value="cardEditorStore.currentCard?.title"
          @input="
            (e) => {
              if (cardEditorStore.currentCard) {
                cardEditorStore.currentCard.title = (e.target as HTMLInputElement).value
              }
            }
          "
          @blur="
            {
              ;((isTitleActive = false), saveCard())
            }
          "
        />
        <input
          id="card-due-date"
          type="date"
          class="w-32 bg-gray-200 rounded-md py-1 px-2 hover:cursor-pointer"
          :value="formatDateToInputValueString(cardEditorStore.currentCard?.dueDate)"
          @input="
            (e) => {
              if (cardEditorStore.currentCard) {
                cardEditorStore.currentCard.dueDate = (e.target as HTMLInputElement).value
                  ? new Date((e.target as HTMLInputElement).value)
                  : undefined
              }
            }
          "
          @blur="saveCard"
        />
        <label for="card-description" class="text-md font-medium text-gray-800 pt-8"
          >Description</label
        >
        <textarea
          id="card-description"
          class="w-full min-h-60 p-2 text-left bg-white text-gray-900 text-md rounded-sm border border-gray-200 outline-blue-500"
          :value="cardEditorStore.currentCard?.description"
          @input="
            (e) => {
              if (cardEditorStore.currentCard) {
                cardEditorStore.currentCard.description = (e.target as HTMLTextAreaElement).value
              }
            }
          "
          @blur="saveCard"
        ></textarea>
      </div>
    </div>
  </div>
</template>
