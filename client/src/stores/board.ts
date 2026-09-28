import * as api from '@/api/api'
import type { Board } from '@/types/Board'
import type { Tag } from '@/types/Tag'
import { defineStore } from 'pinia'
import { reactive } from 'vue'

const API_URL = 'http://localhost:3000'

export const useBoardStore = defineStore('board', () => {
  const board = reactive<Board>({
    id: '',
    title: '',
    columns: [],
    tags: [],
  })

  async function loadBoard(boardId: string) {
    const data = await api.getBoard(boardId)

    board.id = data.id
    board.title = data.title
    board.columns = data.columns
    board.tags = data.tags

    board.columns.forEach((column) => {
      column.cards.sort((a, b) => a.position - b.position)
    })

    console.log('API BOARD:', data)
    console.log('BOARD TAGS:', data.tags)
    console.log('FIRST CARD TAGS:', data.columns[0]?.cards[0]?.tags, data.columns[0]?.cards[0]?.id)
  }

  async function updateBoard(newTitle: string) {
    const updatedBoard = await api.updateBoard(board.id, { title: newTitle })
    board.title = updatedBoard.title
  }

  async function addCard(columnId: string, card: { title: string; description?: string }) {
    const createdCard = await api.createCard(columnId, card)

    const column = board.columns.find((col) => col.id === columnId)
    if (column) {
      column.cards.push(createdCard)
      column.cards.sort((a, b) => a.position - b.position)
    }
  }

  async function updateCard(
    columnId: string,
    cardId: string,
    updatedCard: {
      title?: string
      description?: string
      dueDate?: Date | string | null
      tags?: Tag[]
    },
  ) {
    const savedCard = await api.updateCard(cardId, updatedCard)

    const column = board.columns.find((col) => col.id === columnId)

    if (!column) return

    const card = column.cards.find((c) => c.id === cardId)

    if (!card) return

    Object.assign(card, savedCard)
  }

  async function moveCard(cardId: string, columnId: string, position: number) {
    const updatedCard = await api.moveCard(cardId, columnId, position)

    const column = board.columns.find((col) => col.id === columnId)
    const card = column?.cards.find((c) => c.id === cardId)

    if (card) {
      Object.assign(card, updatedCard)
    }
  }

  async function deleteCard(columnId: string, cardId: string) {
    await api.deleteCard(cardId)

    const column = board.columns.find((col) => col.id === columnId)

    if (!column) return

    column.cards = column.cards.filter((card) => card.id !== cardId)
  }

  async function addTag(name: string, color: string) {
    const createdTag = await api.createTag(board.id, name, color)

    board.tags.push(createdTag)
  }

  async function addColumn(column: { title: string }) {
    const createdColumn = await api.createColumn(board.id, column.title)

    board.columns.push(createdColumn)
  }

  async function updateColumn(
    columnId: string,
    updatedColumn: {
      title: string
    },
  ) {
    const savedColumn = await api.updateColumn(columnId, updatedColumn)

    const column = board.columns.find((col) => col.id === columnId)

    if (!column) return

    Object.assign(column, savedColumn)
  }

  async function deleteColumn(columnId: string) {
    await api.deleteColumn(columnId)

    board.columns = board.columns.filter((column) => column.id !== columnId)
  }

  function resetBoard() {
    board.id = ''
    board.title = ''
    board.columns = []
  }

  return {
    board,
    loadBoard,
    updateBoard,
    addCard,
    updateCard,
    moveCard,
    addTag,
    deleteCard,
    addColumn,
    updateColumn,
    deleteColumn,
    resetBoard,
  }
})
