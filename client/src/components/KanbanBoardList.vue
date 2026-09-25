<script setup lang="ts">
import { getBoards, createBoard } from '@/api/api'
import KanbanBoardCard from '@/components/KanbanBoardCard.vue'
import KanbanBoardEditor from '@/components/KanbanBoardEditor.vue'
import { useBoardEditorStore } from '@/stores/boardEditor'
import type { BoardListItem } from '@/types/Items'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const boardEditorStore = useBoardEditorStore()

const boards = ref<BoardListItem[]>([])
const isLoading = ref(false)
const error = ref('')

async function loadBoards() {
  isLoading.value = true
  error.value = ''

  try {
    boards.value = await getBoards()
  } catch (err) {
    error.value = 'Failed to load boards'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

async function addBoard() {
  const board = await createBoard('New Board')

  router.push({
    name: 'board',
    params: {
      boardId: board.id,
    },
  })

  loadBoards()
}

function removeBoard(boardId: string) {
  boards.value = boards.value.filter((board) => board.id !== boardId)
}

onMounted(() => {
  loadBoards()
})
</script>

<template>
  <main
    class="w-fit h-screen flex flex-col items-center justify-start gap-2 p-2 bg-white border-r border-gray-300"
  >
    <p v-if="isLoading">Loading boards...</p>
    <p v-else-if="error">{{ error }}</p>

    <div v-else class="flex flex-col gap-4 w-full">
      <KanbanBoardCard
        v-for="board in boards"
        :board="board"
        @delete="removeBoard"
      ></KanbanBoardCard>
      <div
        class="h-8 w-64 bg-white rounded-sm shadow-md flex flex-col justify-center gap-2 p-4 hover:scale-105 hover:cursor-pointer"
        @click="addBoard"
      >
        + Add Board
      </div>
    </div>
    <KanbanBoardEditor v-if="boardEditorStore.isEditing"></KanbanBoardEditor>
  </main>
</template>
