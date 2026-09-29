<script setup lang="ts">
import { computed, ref } from 'vue'
import { useBoardStore } from '@/stores/board'
import { useEditorStore } from '@/stores/editor'
import { useConfirmationStore } from '@/stores/confirmation'
import { formatDateToInputValueString } from '@/util/util'
import type { Tag } from '@/types/Tag'
import KanbanTag from '../tags/KanbanTag.vue'
import TagSelector from '../overlays/TagSelector.vue'
import SaveButton from '../buttons/SaveButton.vue'
import ContextMenu from '../overlays/ContextMenu.vue'
import type { ContextMenuItem } from '@/types/Items.ts'

const editorStore = useEditorStore()
const confirmationStore = useConfirmationStore()
const boardStore = useBoardStore()

const menuItems: ContextMenuItem[] = [
  {
    label: 'Delete Card',
    action: deleteCard,
    danger: true,
  },
]

const card = editorStore.currentCard

const original = {
  title: card?.title ?? '',
  description: card?.description ?? '',
  dueDate: formatDateToInputValueString(card?.dueDate),
  tagIds: (card?.tags ?? []).map((tag) => tag.id).sort(),
}

const newTitle = ref(original.title)
const newDescription = ref(original.description)
const newDueDate = ref(original.dueDate)
const newTags = ref<Tag[]>([...(card?.tags ?? [])])

const saveError = ref('')
const isSaving = ref(false)

const unsavedChanges = computed(() => {
  const currentTagIds = newTags.value.map((tag) => tag.id).sort()

  return (
    newTitle.value !== original.title ||
    newDescription.value !== original.description ||
    newDueDate.value !== original.dueDate ||
    currentTagIds.length !== original.tagIds.length ||
    currentTagIds.some((id, index) => id !== original.tagIds[index])
  )
})

function closeEditor() {
  if (isSaving.value) return

  if (!unsavedChanges.value) {
    editorStore.stopEditing()
    return
  }

  confirmationStore.requestConfirmation('Discard your unsaved changes?', () =>
    editorStore.stopEditing(),
  )
}

async function saveCard() {
  const currentCard = editorStore.currentCard
  if (!currentCard || !unsavedChanges.value || isSaving.value) return

  isSaving.value = true
  saveError.value = ''

  try {
    await boardStore.updateCard(currentCard.columnId, currentCard.id, {
      title: newTitle.value,
      description: newDescription.value,
      dueDate: newDueDate.value ? `${newDueDate.value}T00:00:00.000Z` : null,
      tags: [...newTags.value],
    })

    // Close directly. Calling closeEditor() here would prompt about the draft.
    editorStore.stopEditing()
  } catch (error) {
    saveError.value = error instanceof Error ? error.message : 'Could not save card'
  } finally {
    isSaving.value = false
  }
}

function deleteCard() {
  const currentCard = editorStore.currentCard
  if (!currentCard || isSaving.value) return

  const { columnId, id } = currentCard

  confirmationStore.requestConfirmation('Do you really want to delete this card?', async () => {
    await boardStore.deleteCard(columnId, id)
    editorStore.stopEditing()
  })
}

function addTag(id: string) {
  const tag = boardStore.board.tags.find((item) => item.id === id)
  if (!tag || newTags.value.some((item) => item.id === id)) return

  newTags.value = [...newTags.value, tag]
}

function removeTag(id: string) {
  newTags.value = newTags.value.filter((tag) => tag.id !== id)
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <button
      class="fixed inset-0 backdrop-blur-sm"
      aria-label="Close card editor"
      @click="closeEditor"
    ></button>

    <div class="z-50 w-200 rounded-sm bg-white dark:bg-gray-800 shadow-lg">
      <div
        class="flex justify-between items-center p-4 border-b border-gray-300 dark:border-gray-700"
      >
        <h1 class="text-lg font-bold">Card Editor</h1>
        <div class="flex items-center gap-2">
          <ContextMenu :items="menuItems" />
          <button
            class="text-lg font-bold text-gray-900 dark:text-gray-300 hover:cursor-pointer"
            aria-label="Close card editor"
            @click="closeEditor"
          >
            ✕
          </button>
        </div>
      </div>

      <div class="p-8 flex flex-col gap-4 text-gray-900 dark:text-gray-300">
        <div class="flex flex-wrap gap-2">
          <KanbanTag
            v-for="tag in newTags"
            :key="tag.id"
            :id="tag.id"
            :name="tag.name"
            :color="tag.color"
            @remove-tag="removeTag"
          />

          <TagSelector :current-tags="newTags" @select-tag="addTag" />
        </div>
        <input
          id="card-title"
          v-model="newTitle"
          class="w-full rounded-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-left text-gray-900 dark:text-gray-300 outline-blue-500"
          type="text"
        />

        <input
          id="card-due-date"
          v-model="newDueDate"
          type="date"
          class="w-32 bg-gray-200 dark:bg-indigo-900 dark:text-gray-300 rounded-md py-1 px-2 hover:cursor-pointer"
        />

        <label
          for="card-description"
          class="text-md font-medium text-gray-800 dark:text-gray-300 pt-8"
        >
          Description
        </label>

        <textarea
          id="card-description"
          v-model="newDescription"
          class="w-full min-h-60 p-2 text-left bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-300 text-md rounded-sm border border-gray-200 dark:border-gray-700 outline-blue-500"
        ></textarea>

        <p v-if="saveError" class="text-red-500" role="alert">
          {{ saveError }}
        </p>

        <div class="mt-4 flex justify-end gap-2">
          <button
            class="rounded-md bg-gray-200 dark:bg-gray-600 px-4 py-2 font-medium text-gray-800 dark:text-gray-300 hover:scale-105 hover:cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-500"
            @click="closeEditor"
          >
            Cancel
          </button>
          <SaveButton :unsavedChanges="unsavedChanges || isSaving" @save="saveCard" />
        </div>
      </div>
    </div>
  </div>
</template>
