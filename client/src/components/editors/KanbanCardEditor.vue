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
  <div class="fixed inset-0 z-50 flex items-center justify-center p-2">
    <button
      class="fixed inset-0 backdrop-blur-sm"
      aria-label="Close card editor"
      @click="closeEditor"
    ></button>

    <div
      class="relative z-50 flex max-h-[calc(100svh-1rem)] w-full max-w-200 flex-col overflow-hidden rounded-sm bg-white shadow-lg dark:bg-gray-800"
    >
      <!-- Header -->
      <div
        class="flex shrink-0 items-center justify-between border-b border-gray-300 p-4 dark:border-gray-700"
      >
        <h1 class="text-lg font-bold">Card Editor</h1>

        <div class="flex items-center gap-2">
          <ContextMenu :items="menuItems" />

          <button
            class="text-lg font-bold text-gray-900 hover:cursor-pointer dark:text-gray-300"
            aria-label="Close card editor"
            @click="closeEditor"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- Scrollable content -->
      <div
        class="flex min-h-0 flex-col gap-4 overflow-y-auto p-4 text-gray-900 lg:p-8 dark:text-gray-300"
      >
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
          class="w-full shrink-0 rounded-sm border border-gray-200 bg-white p-2 text-left text-gray-900 outline-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          type="text"
          :disabled="isSaving"
        />

        <input
          id="card-due-date"
          v-model="newDueDate"
          type="date"
          class="w-32 shrink-0 rounded-md bg-gray-200 px-2 py-1 hover:cursor-pointer dark:bg-indigo-900 dark:text-gray-300"
          :disabled="isSaving"
        />

        <label
          for="card-description"
          class="text-md font-medium text-gray-800 lg:pt-8 dark:text-gray-300"
        >
          Description
        </label>

        <textarea
          id="card-description"
          v-model="newDescription"
          :disabled="isSaving"
          class="text-md min-h-16 w-full shrink-0 rounded-sm border border-gray-200 bg-white p-2 text-left text-gray-900 outline-blue-500 lg:min-h-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
        ></textarea>

        <p v-if="saveError" class="text-red-500" role="alert">
          {{ saveError }}
        </p>
      </div>

      <!-- Footer -->
      <div
        class="flex shrink-0 justify-end gap-2 border-t border-gray-300 p-4 lg:p-8 dark:border-gray-700"
      >
        <button
          class="rounded-md bg-gray-200 px-4 py-2 font-medium text-gray-800 hover:scale-105 hover:cursor-pointer hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
          @click="closeEditor"
        >
          Cancel
        </button>

        <SaveButton :disableOn="!(unsavedChanges && !isSaving) || isSaving" @save="saveCard" />
      </div>
    </div>
  </div>
</template>
