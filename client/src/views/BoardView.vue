<script setup lang="ts">
import KanbanBoard from '@/components/KanbanBoard.vue'
import KanbanCardEditor from '@/components/KanbanCardEditor.vue'
import { useCardEditorStore } from '@/stores/cardEditor'
import { useBoardStore } from '@/stores/board'
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import KanbanBoardList from '@/components/KanbanBoardList.vue'
import ActionConfirmation from '@/components/overlays/ActionConfirmation.vue'

const boardData = useBoardStore()
const cardEditorStore = useCardEditorStore()
const route = useRoute()

const isLoading = ref(false)
const error = ref('')

watch(
  () => route.params.boardId,
  async (boardId) => {
    if (typeof boardId !== 'string') return

    isLoading.value = true
    error.value = ''

    try {
      await boardData.loadBoard(boardId)
    } catch (err) {
      error.value = 'Failed to load board'
    } finally {
      isLoading.value = false
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="flex flex-row">
    <KanbanBoardList />
    <div v-if="isLoading" class="p-6 w-full text-center text-lg">Loading...</div>
    <div v-else-if="error" class="text-red-500 text-lg p-6 w-full text-center" role="alert">
      {{ error }}
    </div>
    <template v-else-if="boardData.board">
      <KanbanBoard :data="boardData.board" />
      <KanbanCardEditor v-if="cardEditorStore.isEditing" />
    </template>
    <ActionConfirmation />
  </div>
</template>
