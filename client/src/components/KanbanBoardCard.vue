<script setup lang="ts">
import type { BoardListItem, ContextMenuItem } from '@/types/Items'
import ContextMenu from './ContextMenu.vue'

const props = defineProps<{
  board: BoardListItem
}>()

const menuItems: ContextMenuItem[] = [
  {
    label: 'Rename Board',
    action: renameBoard,
    danger: false,
  },
  {
    label: 'Delete Board',
    action: deleteBoard,
    danger: true,
  },
]

function deleteBoard() {}

function renameBoard() {}
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
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
  border-radius: var(--border-radius-inner);
}

.board-card__body {
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
