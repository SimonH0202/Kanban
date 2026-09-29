<script setup lang="ts">
import type { BoardListItem, ContextMenuItem } from '@/types/Items'
import { useBoardEditorStore } from '@/stores/boardEditor.ts'
import { useConfirmationStore } from '@/stores/confirmation.ts'
import ContextMenu from '../components/overlays/ContextMenu.vue'
import { useAuthStore } from '@/stores/auth.ts'

const boardEditorStore = useBoardEditorStore()
const confirmationStore = useConfirmationStore()
const authStore = useAuthStore()

const props = defineProps<{
  board: BoardListItem
}>()

const emit = defineEmits<{
  (e: 'delete', boardId: string): void
  (e: 'rename', boardId: string): void
}>()

const ownerMenuItems: ContextMenuItem[] = [
  {
    label: 'Edit Board',
    action: renameB,
    danger: false,
  },
  {
    label: 'Delete Board',
    action: confirmationStore.requestConfirmation.bind(
      confirmationStore,
      'Do you really want to delete this board?',
      deleteB,
      () => {},
    ),
    danger: true,
  },
]

const nonOwnerMenuItems: ContextMenuItem[] = [
  {
    label: 'View Members',
    action: () => {
      // Implement view members functionality here
    },
    danger: false,
  },
]

function deleteB() {
  emit('delete', props.board.id)
}

function renameB() {
  boardEditorStore.startEditing(props.board)
}
</script>

<template>
  <div
    class="h-8 w-full bg-white dark:bg-indigo-900 rounded-sm shadow-md flex flex-row justify-between items-center hover:bg-gray-200 dark:hover:bg-indigo-800 hover:cursor-pointer pr-2 dark:text-gray-300"
  >
    <RouterLink class="p-4 h-8 w-full flex items-center" :to="`/boards/${board.id}`">
      {{ board.title }}
    </RouterLink>
    <ContextMenu
      v-if="authStore.checkIsOwner(board.ownerId)"
      :items="ownerMenuItems"
      :dotColor="'gray-900'"
    />
    <ContextMenu v-else :items="nonOwnerMenuItems" :dotColor="'gray-900'" />
  </div>
</template>
