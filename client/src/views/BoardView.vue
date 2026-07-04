<script setup lang="ts">
import KanbanBoard from '@/components/KanbanBoard.vue'
import KanbanCardEditor from '@/components/KanbanCardEditor.vue'
import { useCardEditorStore } from '@/stores/cardEditor'
import { useBoardStore } from '@/stores/board'
import { onMounted } from 'vue'

const boardData = useBoardStore()
const cardEditorStore = useCardEditorStore()

onMounted(async () => {
  await boardData.loadBoard('cmr6u5v790000tho0gq6an305')
})
</script>

<template>
  <KanbanCardEditor v-if="cardEditorStore.isEditing" />
  <KanbanBoard :data="boardData.board" />
</template>
