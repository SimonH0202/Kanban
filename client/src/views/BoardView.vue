<script setup lang="ts">
import KanbanBoard from '@/components/KanbanBoard.vue'
import KanbanCardEditor from '@/components/KanbanCardEditor.vue'
import { useCardEditorStore } from '@/stores/cardEditor'
import { useBoardStore } from '@/stores/board'

const boardData = useBoardStore()

const cardEditorStore = useCardEditorStore()
</script>

<template>
  <KanbanCardEditor v-if="cardEditorStore.isEditing" />
  <KanbanBoard :data="boardData.board" />
</template>
