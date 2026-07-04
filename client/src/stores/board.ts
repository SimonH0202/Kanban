import type { Board } from '@/types/Board'
import { generateUniqueId } from '@/util/util'
import { defineStore } from 'pinia'
import { reactive } from 'vue'

export const useBoardStore = defineStore('board', () => {
  const board = reactive<Board>({
    id: 'board-1',
    title: 'My Board',
    columns: [],
  })

  function addCard(columnId: string, card: { title: string; description?: string }) {
    const column = board.columns.find((col) => col.id === columnId)
    if (column) {
      const newCard = {
        id: `card-${generateUniqueId()}`,
        columnId: columnId,
        ...card,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      column.cards.push(newCard)
    }
  }

  function updateCard(
    columnId: string,
    cardId: string,
    updatedCard: { title?: string; description?: string; dueDate?: Date },
  ) {
    const column = board.columns.find((col) => col.id === columnId)
    if (column) {
      const card = column.cards.find((c) => c.id === cardId)
      if (card) {
        if (updatedCard.title !== undefined) {
          card.title = updatedCard.title
        }
        if (updatedCard.description !== undefined) {
          card.description = updatedCard.description
        }
        if (updatedCard.dueDate !== undefined) {
          card.dueDate = updatedCard.dueDate
        }
        card.updatedAt = new Date()
      }
    }
  }

  function addColumn(column: { title: string }) {
    const newColumn = {
      id: `column-${generateUniqueId()}`,
      title: column.title,
      boardId: board.id,
      cards: [],
    }
    board.columns.push(newColumn)
  }
  return { board, addCard, updateCard, addColumn }
})
