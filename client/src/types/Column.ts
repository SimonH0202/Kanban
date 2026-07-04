import type { Card } from './Card'

export type Column = {
  id: string
  title: string
  boardId: string
  cards: Card[]
}
