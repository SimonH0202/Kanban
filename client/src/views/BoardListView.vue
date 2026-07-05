<script setup lang="ts">
import { getBoards, createBoard } from '@/api/api'
import { onMounted, ref } from 'vue'

type BoardListItem = {
  id: string
  title: string
}

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
  await createBoard('New Board')

  await loadBoards()
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
      <RouterLink
        v-for="board in boards"
        :key="board.id"
        :to="`/boards/${board.id}`"
        class="board-card"
      >
        {{ board.title }}
      </RouterLink>
      <div class="board-card" @click="addBoard">New Board +</div>
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

.board-card {
  width: 240px;
  min-height: 120px;
  padding: 1rem;
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  box-shadow: var(--box-shadow);
  color: var(--color-text);
  text-decoration: none;
  font-size: 1.1rem;
  font-weight: bold;
  transition: 0.2s ease;
}

.board-card:hover {
  background-color: var(--color-background-soft);
  transform: translateY(-2px);
}
</style>
