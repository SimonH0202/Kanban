import type { Board } from '@/types/Board'
import type { Card } from '@/types/Card'
import type { BoardListItem } from '@/types/Items'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useEditorStore = defineStore('editor', () => {
  const isEditingCard = ref(false)
  const isEditingBoard = ref(false)
  const isEditingTags = ref(false)

  const currentCard = ref(null as Card | null)
  const currentBoard = ref(null as BoardListItem | null)

  function startEditingCard(card: Card) {
    isEditingCard.value = true
    currentCard.value = card
  }

  function startEditingBoard(board: BoardListItem) {
    isEditingBoard.value = true
    currentBoard.value = board
  }

  function startEditingTags() {
    isEditingTags.value = true
  }

  function stopEditing() {
    isEditingCard.value = false
    isEditingBoard.value = false
    isEditingTags.value = false

    currentCard.value = null
    currentBoard.value = null
  }

  return {
    isEditingCard,
    isEditingBoard,
    isEditingTags,
    currentCard,
    currentBoard,
    startEditingCard,
    startEditingBoard,
    startEditingTags,
    stopEditing,
  }
})
