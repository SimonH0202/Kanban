<script setup lang="ts">
import { useBoardStore } from '@/stores/board'
import { useEditorStore } from '@/stores/editor'
import { useConfirmationStore } from '@/stores/confirmation'
import { formatDateToInputValueString } from '@/util/util'
import { ref } from 'vue'
import trashIcon from '@/assets/icons/trash.png'
import KanbanTag from '../tags/KanbanTag.vue'
import TagSelector from '../overlays/TagSelector.vue'

const editorStore = useEditorStore()
const confirmationStore = useConfirmationStore()
const boardStore = useBoardStore()

const newTitle = ref(editorStore.currentCard?.title || '')

function closeEditor() {
  editorStore.stopEditing()
}

async function saveCard() {
  if (editorStore.currentCard) {
    await boardStore.updateCard(editorStore.currentCard.columnId, editorStore.currentCard.id, {
      title: newTitle.value,
      description: editorStore.currentCard.description,
      dueDate: editorStore.currentCard.dueDate,
      tags: editorStore.currentCard.tags,
    })
  }
}

function deleteCard() {
  const card = editorStore.currentCard
  if (!card) return

  const { columnId, id } = card

  confirmationStore.requestConfirmation(
    'Do you really want to delete this card?',
    async () => {
      await boardStore.deleteCard(columnId, id)
      closeEditor()
    },
    () => {},
  )
}

async function addTag(id: string) {
  const tag = boardStore.board?.tags.find((t) => t.id === id)

  if (!tag || !editorStore.currentCard) return

  editorStore.currentCard.tags?.push(tag)
  await saveCard()
}

async function removeTag(tagId: string) {
  if (editorStore.currentCard) {
    editorStore.currentCard.tags = editorStore.currentCard.tags?.filter((t) => t.id !== tagId)
    await saveCard()
    console.log(editorStore.currentCard?.tags)
  }
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <button class="fixed inset-0 backdrop-blur-sm" @click="closeEditor"></button>
    <div class="z-50 bg-white dark:bg-gray-800 rounded-sm shadow-lg w-200">
      <div
        class="text-gray-900 flex justify-end items-center p-4 border-b border-gray-300 dark:border-gray-700"
      >
        <button
          class="text-lg font-bold hover:scale-105 hover:cursor-pointer dark:text-gray-300"
          @click="closeEditor"
        >
          ✕
        </button>
      </div>
      <div class="p-8 flex flex-col gap-4 text-gray-900 dark:text-gray-300">
        <div class="flex flex-wrap gap-2">
          <KanbanTag
            v-for="tag in editorStore.currentCard?.tags || []"
            :key="tag.id"
            :id="tag.id"
            :name="tag.name"
            :color="tag.color"
            @remove-tag="(tagId: string) => removeTag(tagId)"
          />
          <TagSelector :currentTags="editorStore.currentCard?.tags || []" @select-tag="addTag" />
        </div>
        <div class="w-full h-fit flex justify-end">
          <button class="h-fit w-fit hover:cursor-pointer hover:scale-105" @click="deleteCard">
            <img :src="trashIcon" alt="Delete Card" class="w-5 h-5" />
          </button>
        </div>
        <input
          id="board-title"
          v-model="newTitle"
          class="w-full rounded-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-left text-gray-900 dark:text-gray-300 outline-blue-500"
          type="text"
          @keyup.enter="async () => await saveCard()"
          @blur="async () => await saveCard()"
        />
        <input
          id="card-due-date"
          type="date"
          class="w-32 bg-gray-200 dark:bg-indigo-900 dark:text-gray-300 rounded-md py-1 px-2 hover:cursor-pointer"
          :value="formatDateToInputValueString(editorStore.currentCard?.dueDate)"
          @input="
            (e) => {
              if (editorStore.currentCard) {
                editorStore.currentCard.dueDate = (e.target as HTMLInputElement).value
                  ? new Date((e.target as HTMLInputElement).value)
                  : null
              }
            }
          "
          @blur="async () => await saveCard()"
        />
        <label for="card-description" class="text-md font-medium text-gray-800 pt-8"
          >Description</label
        >
        <textarea
          id="card-description"
          class="w-full min-h-60 p-2 text-left bg-white dark:bg-gray-800 dark:text-gray-300 text-gray-900 text-md rounded-sm border border-gray-200 dark:border-gray-700 outline-blue-500"
          :value="editorStore.currentCard?.description"
          @input="
            (e) => {
              if (editorStore.currentCard) {
                editorStore.currentCard.description = (e.target as HTMLTextAreaElement).value
              }
            }
          "
          @blur="async () => await saveCard()"
        ></textarea>
      </div>
    </div>
  </div>
</template>
