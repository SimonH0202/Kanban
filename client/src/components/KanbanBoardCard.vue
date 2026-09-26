<script setup lang="ts">
import type { BoardListItem, ContextMenuItem } from '@/types/Items'
import ContextMenu from './ContextMenu.vue'
import { deleteBoard } from '@/api/api.ts'
import { useBoardEditorStore } from '@/stores/boardEditor.ts'
import dotsIconBlack from '@/assets/icons/dots.png'

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
  <div
    class="h-8 w-full bg-white rounded-sm shadow-md flex flex-row justify-between items-center hover:scale-101 hover:cursor-pointer"
  >
    <RouterLink class="p-4 h-8 w-full flex items-center" :to="`/boards/${board.id}`">
      {{ board.title }}
    </RouterLink>
    <ContextMenu :items="menuItems" :image-src="dotsIconBlack" />
  </div>
</template>
