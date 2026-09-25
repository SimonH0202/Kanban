<script setup lang="ts">
import KanbanBoard from '@/components/KanbanBoard.vue'
import KanbanCardEditor from '@/components/KanbanCardEditor.vue'
import { useCardEditorStore } from '@/stores/cardEditor'
import { useBoardStore } from '@/stores/board'
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import KanbanBoardList from '@/components/KanbanBoardList.vue'

const boardData = useBoardStore()
const cardEditorStore = useCardEditorStore()
const route = useRoute()

watch(
  () => route.params.boardId,
  async (boardId) => {
    if (typeof boardId !== 'string') return

    await boardData.loadBoard(boardId)
  },
  { immediate: true },
)
</script>

<template>
  <div class="flex flex-row">
    <KanbanBoardList />
    <KanbanBoard :data="boardData.board" />
  </div>
  <KanbanCardEditor v-if="cardEditorStore.isEditing" />
</template>
