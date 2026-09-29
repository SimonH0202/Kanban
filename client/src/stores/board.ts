import * as api from '@/api/api'
import type { Board } from '@/types/Board'
import type { BoardMember } from '@/types/BoardMember'
import type { Tag } from '@/types/Tag'
import { defineStore } from 'pinia'
import { reactive } from 'vue'

export const useBoardStore = defineStore('board', () => {
  const board = reactive<Board>({
    id: '',
    title: '',
    columns: [],
    tags: [],
    ownerId: '',
    owner: { id: '', email: '' },
  })

  async function loadBoard(boardId: string) {
    const data = await api.getBoard(boardId)

    board.id = data.id
    board.title = data.title
    board.columns = data.columns
    board.tags = data.tags
    board.ownerId = data.ownerId
    board.owner = data.owner

    board.columns.forEach((column) => {
      column.cards.sort((a, b) => a.position - b.position)
    })
  }

  async function updateBoard(boardId: string, newTitle: string) {
    const updatedBoard = await api.updateBoard(boardId, { title: newTitle })
    board.title = updatedBoard.title
  }

  async function deleteBoard(boardId: string) {
    await api.deleteBoard(boardId)
  }

  async function getAllMembers(boardId: string): Promise<BoardMember[]> {
    const members = await api.getAllMembers(boardId)
    return members
  }

  async function addMemberToBoard(boardId: string, email: string) {
    await api.addMemberToBoard(boardId, email)
  }

  async function removeMemberFromBoard(boardId: string, memberId: string) {
    await api.removeMemberFromBoard(boardId, memberId)
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
      title: string
      description?: string
      dueDate?: Date | string | null
      tags: Tag[]
    },
  ) {
    const savedCard = await api.updateCard(cardId, updatedCard)

    if (!savedCard) return

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

  async function saveCardOrder() {
    const boardId = board.id

    const columns = board.columns.map((column) => ({
      columnId: column.id,
      cardIds: column.cards.map((card) => card.id),
    }))

    try {
      await api.saveCardOrder(boardId, columns)

      board.columns.forEach((column) => {
        column.cards.forEach((card, position) => {
          card.columnId = column.id
          card.position = position
        })
      })
    } catch (error) {
      await loadBoard(boardId)
      throw error
    }
  }

  async function deleteTag(tagId: string) {
    await api.deleteTag(board.id, tagId)

    board.tags = board.tags.filter((tag) => tag.id !== tagId)

    // Remove the tag from all cards in all columns
    board.columns.forEach((column) => {
      column.cards.forEach((card) => {
        card.tags = card.tags.filter((tag) => tag.id !== tagId)
      })
    })
  }

  async function updateTag(tagId: string, updatedTag: { name: string; color: string }) {
    const savedTag = await api.updateTag(board.id, tagId, updatedTag)
    const tag = board.tags.find((t) => t.id === tagId)
    if (tag) {
      Object.assign(tag, savedTag)
    }

    // Update the tag in all cards in all columns
    board.columns.forEach((column) => {
      column.cards.forEach((card) => {
        const cardTag = card.tags.find((t) => t.id === tagId)
        if (cardTag) {
          Object.assign(cardTag, savedTag)
        }
      })
    })
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
    board.ownerId = ''
    board.owner = { id: '', email: '' }
    board.tags = []
  }

  return {
    board,
    loadBoard,
    updateBoard,
    resetBoard,
    deleteBoard,
    getAllMembers,
    addMemberToBoard,
    removeMemberFromBoard,
    addCard,
    updateCard,
    moveCard,
    saveCardOrder,
    addTag,
    deleteTag,
    updateTag,
    deleteCard,
    addColumn,
    updateColumn,
    deleteColumn,
  }
})
