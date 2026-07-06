<script setup lang="ts">
import type { BoardListItem, ContextMenuItem } from '@/types/Items'
import ContextMenu from './ContextMenu.vue'
import { deleteBoard, updateBoard } from '@/api/api.ts'
import { useBoardEditorStore } from '@/stores/boardEditor.ts'

const boardEditorStore = useBoardEditorStore()

const props = defineProps<{
  board: BoardListItem
}>()

const emit = defineEmits<{
  (e: 'delete', boardId: string): void
  (e: 'rename', boardId: string): void
}>()

const menuItems: ContextMenuItem[] = [
  {
    label: 'Rename Board',
    action: renameB,
    danger: false,
  },
  {
    label: 'Delete Board',
    action: deleteB,
    danger: true,
  },
]

async function deleteB() {
  await deleteBoard(props.board.id)
  emit('delete', props.board.id)
}

function renameB() {
  boardEditorStore.startEditing(props.board)
}
</script>

<template>
  <div class="board-card">
    <div class="board-card__header">
      <ContextMenu :items="menuItems" />
    </div>
    <RouterLink class="board-card__body" :to="`/boards/${board.id}`">
      {{ board.title }}
    </RouterLink>
  </div>
</template>

<style scoped>
.board-card {
  display: flex;
  flex-direction: column;
  width: 240px;
  min-height: 140px;
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-inner);
  box-shadow: var(--box-shadow);
  overflow: hidden;
  justify-content: space-between;
}

.board-card:hover {
  background-color: var(--color-background-soft);
}

.board-card__header {
  position: absolute;
  align-self: end;
  border-radius: var(--border-radius-inner);
}

.board-card__body {
  flex: 1;
  padding: 1rem;
  color: var(--color-text);
  text-decoration: none;
  font-size: 1.1rem;
  font-weight: bold;
  text-align: end end;
  overflow: visible;
}

.board-card__body:hover {
  background-color: var(--color-background-soft);
}
</style>
