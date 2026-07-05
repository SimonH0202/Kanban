import type { Board } from '@/types/Board'
import type { Card } from '@/types/Card'
import type { Column } from '@/types/Column'

const API_URL = 'http://localhost:3000'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${url}`, options)

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

export function getBoards(): Promise<Board[]> {
  return request<Board[]>('')
}

export function getBoard(boardId: string): Promise<Board> {
  return request<Board>(`/boards/${boardId}`)
}

export function updateBoard(boardId: string, board: { title?: string }): Promise<Board> {
  return request<Board>(`/columns/${boardId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(board),
  })
}

export function deleteBoard(boardId: string): Promise<void> {
  return request<void>(`/boards/${boardId}`, {
    method: 'DELETE',
  })
}

export function createBoard(title: string): Promise<Board> {
  return request<Board>('/boards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  })
}

export function createColumn(boardId: string, title: string): Promise<Column> {
  return request<Column>(`/boards/${boardId}/columns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  })
}

export function updateColumn(columnId: string, column: { title?: string }): Promise<Column> {
  return request<Column>(`/columns/${columnId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(column),
  })
}

export function deleteColumn(columnId: string): Promise<void> {
  return request<void>(`/columns/${columnId}`, {
    method: 'DELETE',
  })
}

export function createCard(
  columnId: string,
  card: { title: string; description?: string },
): Promise<Card> {
  return request<Card>(`/columns/${columnId}/cards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(card),
  })
}

export function updateCard(
  cardId: string,
  card: { title?: string; description?: string; dueDate?: Date | string | null },
): Promise<Card> {
  return request<Card>(`/cards/${cardId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(card),
  })
}

export function moveCard(cardId: string, columnId: string, position: number): Promise<Card> {
  return request<Card>(`/cards/${cardId}/move`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ columnId, position }),
  })
}

export function deleteCard(cardId: string): Promise<void> {
  return request<void>(`/cards/${cardId}`, {
    method: 'DELETE',
  })
}
