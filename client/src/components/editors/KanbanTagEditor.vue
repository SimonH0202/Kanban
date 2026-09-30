<script setup lang="ts">
import { useEditorStore } from '@/stores/editor'
import EditableKanbanTag from '../tags/EditableKanbanTag.vue'
import { useBoardStore } from '@/stores/board.ts'
import { computed, ref } from 'vue'
import type { Tag } from '@/types/Tag.ts'
import EditedKanbanTag from '../tags/EditedKanbanTag.vue'
import { useConfirmationStore } from '@/stores/confirmation.ts'
import SaveButton from '../buttons/SaveButton.vue'

const editorStore = useEditorStore()
const boardStore = useBoardStore()
const confirmationStore = useConfirmationStore()

const selectedTag = ref<Tag | null>(null)

const newTagName = ref(selectedTag.value?.name || '')
const newTagColor = ref(selectedTag.value?.color || '#000000')

const unsavedChanges = computed(() => {
  if (!selectedTag.value) return false
  return (
    newTagName.value !== selectedTag.value.name || newTagColor.value !== selectedTag.value.color
  )
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

  if (selectedTag.value && selectedTag.value.id === tagId) {
    selectedTag.value = null
    newTagName.value = ''
    newTagColor.value = '#000000'
  }

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

  await boardStore.updateTag(selectedTag.value.id, {
    name: newTagName.value,
    color: newTagColor.value,
  })

  selectedTag.value = null
  newTagName.value = ''
  newTagColor.value = '#000000'
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-2">
    <button
      class="fixed inset-0 backdrop-blur-sm"
      aria-label="Close tag editor"
      @click="closeEditor"
    ></button>

    <div
      class="relative z-50 flex max-h-[calc(100svh-1rem)] w-full max-w-200 flex-col overflow-hidden rounded-sm bg-white shadow-lg dark:bg-gray-800"
    >
      <!-- Header -->
      <div
        class="flex shrink-0 items-center justify-between border-b border-gray-300 p-4 text-gray-900 dark:border-gray-700 dark:text-gray-300"
      >
        <h1 class="text-lg font-bold">Tag Editor</h1>

        <button
          class="text-lg font-bold hover:cursor-pointer"
          aria-label="Close tag editor"
          @click="closeEditor"
        >
          ✕
        </button>
      </div>

      <div class="min-h-0 overflow-y-auto p-4 text-gray-900 lg:p-8 dark:text-gray-300">
        <div class="flex flex-wrap gap-2">
          <EditableKanbanTag
            v-for="tag in boardStore.board?.tags || []"
            :key="tag.id"
            :id="tag.id"
            :name="tag.name"
            :color="tag.color"
            @delete-tag="deleteTag"
            @edit-tag="editTag"
          />
        </div>
      </div>

      <!-- Footer -->
      <div
        class="flex shrink-0 flex-col gap-2 border-t border-gray-300 p-4 lg:p-8 dark:border-gray-700"
      >
        <EditedKanbanTag v-if="selectedTag" :name="newTagName" :color="newTagColor" />

        <div class="flex items-center justify-end gap-2">
          <input
            id="new-tag-name"
            v-model="newTagName"
            :disabled="!selectedTag"
            aria-label="Tag name"
            class="min-w-0 flex-1 rounded-sm border border-gray-200 bg-white p-2 text-left text-gray-900 outline-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            type="text"
          />

          <input
            v-model="newTagColor"
            :disabled="!selectedTag"
            type="color"
            aria-label="Tag color"
            class="h-10 w-10 shrink-0 rounded-sm border border-gray-200 bg-white px-0.5 outline-blue-500 hover:cursor-pointer dark:border-gray-700 dark:bg-gray-800"
          />

          <div class="shrink-0">
            <SaveButton :disableOn="unsavedChanges" @save="saveTag" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
