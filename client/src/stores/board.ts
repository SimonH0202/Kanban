import type { Board } from '@/types/Board'
import { defineStore } from 'pinia'
import { reactive } from 'vue'

const API_URL = 'http://localhost:3000'

export const useBoardStore = defineStore('board', () => {
  const board = reactive<Board>({
    id: '',
    title: '',
    columns: [],
  })

  async function loadBoard(boardId: string) {
    const response = await fetch(`http://localhost:3000/boards/${boardId}`)

    if (!response.ok) {
      throw new Error('Failed to load board')
    }

    const data = await response.json()

    board.id = data.id
    board.title = data.title
    board.columns = data.columns
  }

  async function addCard(columnId: string, card: { title: string; description?: string }) {
    const response = await fetch(`${API_URL}/columns/${columnId}/cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(card),
    })

    if (!response.ok) {
      throw new Error('Failed to create card')
    }

    const createdCard = await response.json()

    const column = board.columns.find((col) => col.id === columnId)
    if (column) {
      column.cards.push(createdCard)
    }
  }

  async function updateCard(
    columnId: string,
    cardId: string,
    updatedCard: {
      title?: string
      description?: string
      dueDate?: Date | string | null
    },
  ) {
    const response = await fetch(`${API_URL}/cards/${cardId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedCard),
    })

    if (!response.ok) {
      throw new Error('Failed to update card')
    }

    const savedCard = await response.json()

    const column = board.columns.find((col) => col.id === columnId)

    if (!column) return

    const card = column.cards.find((c) => c.id === cardId)

    if (!card) return

    Object.assign(card, savedCard)
  }

  async function moveCard(cardId: string, columnId: string, position: number) {
    const response = await fetch(`${API_URL}/cards/${cardId}/move`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        columnId,
        position,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to move card')
    }

    const updatedCard = await response.json()

    const column = board.columns.find((col) => col.id === columnId)
    const card = column?.cards.find((c) => c.id === cardId)

    if (card) {
      Object.assign(card, updatedCard)
    }
  }

  async function deleteCard(columnId: string, cardId: string) {
    const response = await fetch(`${API_URL}/cards/${cardId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('Failed to delete card')
    }

    const column = board.columns.find((col) => col.id === columnId)

    if (!column) return

    column.cards = column.cards.filter((card) => card.id !== cardId)
  }

  async function addColumn(column: { title: string }) {
    const response = await fetch(`${API_URL}/boards/${board.id}/columns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(column),
    })

    if (!response.ok) {
      throw new Error('Failed to create column')
    }

    const createdColumn = await response.json()

    board.columns.push(createdColumn)
  }

  async function updateColumn(
    columnId: string,
    updatedColumn: {
      title: string
    },
  ) {
    const response = await fetch(`${API_URL}/columns/${columnId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedColumn),
    })

    if (!response.ok) {
      throw new Error('Failed to update column')
    }

    const savedColumn = await response.json()

    const column = board.columns.find((col) => col.id === columnId)

    if (!column) return

    Object.assign(column, savedColumn)
  }

  return { board, loadBoard, addCard, updateCard, moveCard, deleteCard, addColumn, updateColumn }
})
