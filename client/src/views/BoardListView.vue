<script setup lang="ts">
import { getBoards, createBoard } from '@/api/api'
import KanbanBoardCard from '@/components/KanbanBoardCard.vue'
import type { BoardListItem } from '@/types/Items'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

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
}

function removeBoard(boardId: string) {
  boards.value = boards.value.filter((board) => board.id !== boardId)
}

onMounted(() => {
  loadBoards()
})
</script>

<template>
  <main class="board-list-view">
    <h1>Your Boards</h1>

    <p v-if="isLoading">Loading boards...</p>
    <p v-else-if="error">{{ error }}</p>

    <div v-else class="board-list">
      <KanbanBoardCard
        v-for="board in boards"
        :board="board"
        @delete="removeBoard"
      ></KanbanBoardCard>
      <div class="board-card-new" @click="addBoard">New Board +</div>
    </div>
  </main>
</template>

<style scoped>
.board-list-view {
  padding: 2rem;
}

.board-list-view h1 {
  margin-bottom: 1.5rem;
  color: var(--color-text);
}

.board-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
.board-card-new {
  display: flex;
  flex-direction: column;
  width: 240px;
  min-height: 140px;
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  box-shadow: var(--box-shadow);
  overflow: hidden;
  transition: 0.2s ease;
  padding: 1rem;
  color: var(--color-text);
  text-decoration: none;
  font-size: 1.1rem;
  font-weight: bold;
  text-align: end end;
  justify-content: end;
}
.board-card-new:hover {
  transform: translateY(-2px);
}
</style>
