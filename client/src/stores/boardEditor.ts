import type { BoardListItem } from '@/types/Items'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useBoardEditorStore = defineStore('boardEditor', () => {
  const isEditing = ref(false)
  const currentBoard = ref(null as BoardListItem | null)

  function startEditing(board: BoardListItem) {
    isEditing.value = true
    currentBoard.value = board
  }
  function stopEditing() {
    isEditing.value = false
    currentBoard.value = null
  }

  return { isEditing, currentBoard, startEditing, stopEditing }
})
