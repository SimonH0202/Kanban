<script setup lang="ts">
import { getBoards, createBoard } from '@/api/api'
import KanbanBoardCard from '@/components/KanbanBoardCard.vue'
import KanbanBoardEditor from '../components/editors/KanbanBoardEditor.vue'
import { useEditorStore } from '@/stores/editor'
import type { BoardListItem } from '@/types/Items'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useBoardStore } from '@/stores/board'
import BurgerMenuButton from './buttons/BurgerMenuButton.vue'

const router = useRouter()
const authStore = useAuthStore()

const editorStore = useEditorStore()
const boardStore = useBoardStore()

const boards = ref<BoardListItem[]>([])
const isLoading = ref(false)
const showLoading = ref(false)
const error = ref('')

const isSidebarOpen = ref(false)

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
  let loadingTimer: ReturnType<typeof setTimeout> | undefined

  try {
    isLoading.value = true
    error.value = ''

    loadingTimer = setTimeout(() => {
      showLoading.value = true
    }, 300)

    const board = await createBoard('New Board')

    await loadBoards()

    router.push({
      name: 'board',
      params: {
        boardId: board.id,
      },
    })
  } catch (err) {
    error.value = 'Failed to create board'
    console.error(err)
  } finally {
    if (loadingTimer) {
      clearTimeout(loadingTimer)
    }

    isLoading.value = false
    showLoading.value = false
  }
}

async function deleteBoard(boardId: string) {
  try {
    error.value = ''

    const isCurrentBoard = boardStore.board?.id === boardId

    await boardStore.deleteBoard(boardId)

    boards.value = boards.value.filter((board) => board.id !== boardId)

    if (isCurrentBoard) {
      await router.push('/')
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to delete board'

    console.error(err)
  }
}

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
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
    class="hidden h-full min-h-0 w-fit shrink-0 flex-col items-center justify-start gap-2 overflow-y-auto border-r border-gray-300 bg-white px-2 lg:flex dark:border-gray-700 dark:bg-gray-800"
  >
    <div
      class="w-full h-fit py-2 gap-4 flex items-center justify-between border-b border-gray-300 dark:border-gray-700"
    >
      <span class="text-gray-900 dark:text-gray-300 text-md font-bold">
        {{ authStore.user?.email || 'Boards' }}
      </span>
      <button
        class="text-red-500 bg-transparent border-red-500 border-2 py-1 px-3 rounded-sm text-md font-bold hover:bg-red-500 hover:text-white hover:cursor-pointer"
        @click="logout"
      >
        Logout
      </button>
    </div>

    <p v-if="showLoading">Loading boards...</p>
    <p v-else-if="error">{{ error }}</p>
    <div v-else class="flex flex-col gap-2 w-full">
      <KanbanBoardCard
        v-for="board in boards"
        :board="board"
        @delete="deleteBoard"
      ></KanbanBoardCard>
    </div>
    <div
      class="h-8 w-full bg-white dark:bg-indigo-900 rounded-sm shadow-md flex flex-col justify-center gap-2 p-4 hover:bg-gray-200 dark:hover:bg-indigo-800 hover:cursor-pointer dark:text-gray-300"
      @click="addBoard"
    >
      + Add Board
    </div>
  </main>
  <KanbanBoardEditor v-if="editorStore.isEditingBoard"></KanbanBoardEditor>
  <main class="max-h-full w-full shrink-0 overflow-y-auto px-2 lg:hidden">
    <div
      class="w-full h-fit py-2 flex items-center justify-between border-b border-gray-300 dark:border-gray-700"
    >
      <BurgerMenuButton @toggle="toggleSidebar" />
      <span class="text-gray-900 dark:text-gray-300 text-sm font-bold">
        {{ authStore.user?.email || 'Boards' }}
      </span>
      <button
        class="text-red-500 bg-transparent border-red-500 border-2 py-1 px-3 rounded-sm text-sm lg:text-md font-bold hover:bg-red-500 hover:text-white hover:cursor-pointer"
        @click="logout"
      >
        Logout
      </button>
    </div>
    <div v-if="isSidebarOpen" class="flex flex-col gap-2 w-full mt-2">
      <p v-if="showLoading">Loading boards...</p>
      <p v-else-if="error">{{ error }}</p>
      <div v-else class="flex flex-col gap-2 w-full">
        <KanbanBoardCard
          v-for="board in boards"
          :board="board"
          @delete="deleteBoard"
        ></KanbanBoardCard>
      </div>
      <div
        class="h-8 w-full bg-white dark:bg-indigo-900 rounded-sm shadow-md flex flex-col justify-center gap-2 p-4 hover:bg-gray-200 dark:hover:bg-indigo-800 hover:cursor-pointer dark:text-gray-300"
        @click="addBoard"
      >
        + Add Board
      </div>
    </div>
  </main>
</template>
