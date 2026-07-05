<script setup lang="ts">
import KanbanBoard from '@/components/KanbanBoard.vue'
import KanbanCardEditor from '@/components/KanbanCardEditor.vue'
import { useCardEditorStore } from '@/stores/cardEditor'
import { useBoardStore } from '@/stores/board'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

const boardData = useBoardStore()
const cardEditorStore = useCardEditorStore()
const route = useRoute()

onMounted(async () => {
  const boardId = route.params.boardId as string

  await boardData.loadBoard(boardId)
})
</script>

<template>
  <KanbanCardEditor v-if="cardEditorStore.isEditing" />
  <KanbanBoard :data="boardData.board" />
</template>
