<script setup lang="ts">
import { useEditorStore } from '@/stores/editor'
import EditableKanbanTag from '../tags/EditableKanbanTag.vue'
import { useBoardStore } from '@/stores/board.ts'
import { computed, ref } from 'vue'
import type { Tag } from '@/types/Tag.ts'
import EditedKanbanTag from '../tags/EditedKanbanTag.vue'
import { useConfirmationStore } from '@/stores/confirmation.ts'

const editorStore = useEditorStore()
const boardStore = useBoardStore()
const confirmationStore = useConfirmationStore()

const selectedTag = ref<Tag | null>(null)

const newTagName = ref(selectedTag.value?.name || '')
const newTagColor = ref(selectedTag.value?.color || '#000000')

const unsavedChanges = computed(() => {
  if (!selectedTag.value) return false
  return newTagName.value !== selectedTag.value.name || newTagColor.value !== selectedTag.value.color
})

function closeEditor() {
  if (unsavedChanges.value) {
    confirmationStore.requestConfirmation('Discard your unsaved changes?', () => {
      selectedTag.value = null
      newTagName.value = ''
      newTagColor.value = '#000000'
      editorStore.stopEditing()
    })
    return
  }
  editorStore.stopEditing()
}

async function deleteTag(tagId: string) {
  if (!boardStore.board) return

  confirmationStore.requestConfirmation('Are you sure you want to delete this tag?', async () => {
    await boardStore.deleteTag(tagId)
  })
}

function editTag(tagId: string) {
  const tag = boardStore.board?.tags.find((t) => t.id === tagId)
  if (tag) {
    selectedTag.value = tag
    newTagName.value = tag.name
    newTagColor.value = tag.color
  }
}

async function saveTag() {
  if (!boardStore.board || !selectedTag.value) return

  await boardStore.updateTag(selectedTag.value.id, { name: newTagName.value, color: newTagColor.value })

  selectedTag.value = null
  newTagName.value = ''
  newTagColor.value = '#000000'
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <button class="fixed inset-0 backdrop-blur-sm" @click="closeEditor"></button>
    <div class="z-50 bg-white dark:bg-gray-800 rounded-sm shadow-lg w-200 flex flex-col gap-4">
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
      <div class="p-8 text-gray-900 dark:text-gray-300">
        <div class="flex flex-wrap gap-2">
          <EditableKanbanTag
            v-for="tag in boardStore.board?.tags || []"
            :key="tag.id"
            :id="tag.id"
            :name="tag.name"
            :color="tag.color"
            @delete-tag="(tagId: string) => deleteTag(tagId)"
            @edit-tag="(tagId: string) => editTag(tagId)"
          />
        </div>
      </div>
      <div class="flex flex-col gap-2 p-8">
        <EditedKanbanTag
          v-if="selectedTag"
          :name="newTagName"
          :color="newTagColor"
          />
        <div class="flex justify-end gap-2">
          <input
            id="new-tag-name"
            v-model="newTagName"
            class="grow rounded-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-left text-gray-900 dark:text-gray-300 outline-blue-500"
          >
          </input>
          <input
            type="color"
            class="h-full aspect-square px-0.5 rounded-sm border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 text-left text-gray-900 outline-blue-500 hover:cursor-pointer"
            v-model="newTagColor"
          />

          <button
            class="rounded-md bg-blue-500 px-4 py-2 font-medium text-white hover:scale-105 hover:cursor-pointer hover:bg-blue-600 enabled:hover:scale-105 enabled:hover:cursor-pointer disabled:bg-gray-400 disabled:text-gray-200 disabled:opacity-60 disabled:cursor-not-allowed"
            @click="saveTag"
            :disabled="!unsavedChanges"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
