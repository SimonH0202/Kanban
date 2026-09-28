import type { Tag } from './Tag'

export type Card = {
  id: string
  columnId: string
  position: number
  title: string
  description?: string
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
  dueDate?: Date | string | null
  tags?: Tag[]
}
