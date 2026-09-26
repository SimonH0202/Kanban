<script setup lang="ts">
import { getBoards, createBoard } from '@/api/api'
import KanbanBoardCard from '@/components/KanbanBoardCard.vue'
import KanbanBoardEditor from '@/components/KanbanBoardEditor.vue'
import { useBoardEditorStore } from '@/stores/boardEditor'
import type { BoardListItem } from '@/types/Items'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

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

async function logout() {
  await authStore.logout()
  router.push('/login')
}

onMounted(() => {
  loadBoards()
})
</script>

<template>
  <main
    class="w-fit min-w-sm h-screen flex flex-col items-center justify-start gap-2 px-2 bg-white border-r border-gray-300"
  >
    <div class="w-full h-fit py-2 flex items-center justify-between border-b border-gray-300">
      <span class="text-gray-900 text-md font-bold">
        {{ authStore.user?.email || 'Boards' }}
      </span>
      <button
        class="text-red-500 bg-transparent border-red-500 border-2 py-1 px-3 rounded-sm text-md font-bold hover:bg-red-500 hover:text-white hover:cursor-pointer"
        @click="logout"
      >
        Logout
      </button>
    </div>

    <p v-if="isLoading">Loading boards...</p>
    <p v-else-if="error">{{ error }}</p>

    <div v-else class="flex flex-col gap-2 w-full">
      <KanbanBoardCard
        v-for="board in boards"
        :board="board"
        @delete="removeBoard"
      ></KanbanBoardCard>
    </div>
    <div
      class="h-8 w-full bg-white rounded-sm shadow-md flex flex-col justify-center gap-2 p-4 hover:scale-101 hover:cursor-pointer"
      @click="addBoard"
    >
      + Add Board
    </div>
    <KanbanBoardEditor v-if="boardEditorStore.isEditing"></KanbanBoardEditor>
  </main>
</template>
