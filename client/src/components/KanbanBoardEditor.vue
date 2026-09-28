```vue
<script setup lang="ts">
import { useBoardEditorStore } from '@/stores/boardEditor'
import { useBoardStore } from '@/stores/board'
import { ref } from 'vue'

const boardEditorStore = useBoardEditorStore()
const boardStore = useBoardStore()

const newTitle = ref(boardEditorStore.currentBoard?.title || '')

function closeEditor() {
  boardEditorStore.stopEditing()
}

async function saveBoard() {
  if (!boardEditorStore.currentBoard) return

  await boardStore.updateBoard(boardEditorStore.currentBoard.id, newTitle.value)

  boardEditorStore.currentBoard.title = newTitle.value

  closeEditor()
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Backdrop -->
    <button
      class="fixed inset-0 backdrop-blur-sm"
      aria-label="Close editor"
      @click="closeEditor"
    ></button>

    <!-- Editor -->
    <div class="z-50 w-200 rounded-sm bg-white dark:bg-gray-800 shadow-lg">
      <!-- Header -->
      <div
        class="flex items-center justify-end border-b border-gray-300 dark:border-gray-700 p-4 text-gray-900 dark:text-gray-300"
      >
        <button class="text-lg font-bold hover:scale-105 hover:cursor-pointer" @click="closeEditor">
          ✕
        </button>
      </div>

      <!-- Content -->
      <div class="flex flex-col gap-4 p-8 text-gray-900 dark:text-gray-300">
        <input
          id="board-title"
          v-model="newTitle"
          class="w-full rounded-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-left text-gray-900 dark:text-gray-300 outline-blue-500"
          type="text"
          @keyup.enter="saveBoard"
        />

        <!-- Actions -->
        <div class="mt-4 flex justify-end gap-2">
          <button
            class="rounded-md bg-gray-200 dark:bg-gray-600 px-4 py-2 font-medium text-gray-800 dark:text-gray-300 hover:scale-105 hover:cursor-pointer hover:bg-gray-300"
            @click="closeEditor"
          >
            Cancel
          </button>

          <button
            class="rounded-md bg-blue-500 px-4 py-2 font-medium text-white hover:scale-105 hover:cursor-pointer hover:bg-blue-600"
            @click="saveBoard"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
```
