import type { Board } from '@/types/Board'
import type { BoardMember } from '@/types/BoardMember'
import type { Card } from '@/types/Card'
import type { Column } from '@/types/Column'
import type { ColumnCardOrder } from '@/types/ColumnCardOrder'
import type { Tag } from '@/types/Tag'
import type { User } from '@/types/User'

const API_URL = 'http://localhost:3000'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    credentials: 'include',
  })

  if (!response.ok) {
    let message = response.statusText

    try {
      const data = await response.json()

      if (typeof data.message === 'string') {
        message = data.message
      }
    } catch {
      // Ignore JSON parse errors
    }

    throw new Error(message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

export function getCurrentUser(): Promise<User> {
  return request<User>('/auth/me')
}

export function login(email: string, password: string): Promise<User> {
  return request<User>('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
}

export function logout(): Promise<void> {
  return request<void>('/auth/logout', {
    method: 'POST',
  })
}

export function register(email: string, password: string): Promise<User> {
  return request<User>('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
}

export function getBoards(): Promise<Board[]> {
  return request<Board[]>('/boards')
}

export function getBoard(boardId: string): Promise<Board> {
  return request<Board>(`/boards/${boardId}`)
}

export function updateBoard(boardId: string, board: { title?: string }): Promise<Board> {
  return request<Board>(`/boards/${boardId}`, {
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

export function getAllMembers(boardId: string): Promise<BoardMember[]> {
  return request<BoardMember[]>(`/boards/${boardId}/members`)
}

export function addMemberToBoard(boardId: string, email: string): Promise<void> {
  return request<void>(`/boards/${boardId}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
}

export function removeMemberFromBoard(boardId: string, memberId: string): Promise<void> {
  return request<void>(`/boards/${boardId}/members/${memberId}`, {
    method: 'DELETE',
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
  card: { title: string; description?: string; dueDate?: Date | string | null; tags: Tag[] },
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

export function saveCardOrder(boardId: string, columns: ColumnCardOrder[]): Promise<void> {
  return request<void>(`/boards/${boardId}/card-order`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ columns }),
  })
}

export function deleteCard(cardId: string): Promise<void> {
  return request<void>(`/cards/${cardId}`, {
    method: 'DELETE',
  })
}

export function createTag(boardId: string, name: string, color: string): Promise<Tag> {
  return request<Tag>(`/boards/${boardId}/tags`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, color }),
  })
}

export function updateTag(
  boardId: string,
  tagId: string,
  tag: { name?: string; color?: string },
): Promise<Tag> {
  return request<Tag>(`/boards/${boardId}/tags/${tagId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tag),
  })
}

export function deleteTag(boardId: string, tagId: string): Promise<void> {
  return request<void>(`/boards/${boardId}/tags/${tagId}`, {
    method: 'DELETE',
  })
}
