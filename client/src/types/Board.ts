import type { Column } from './Column'
import type { Tag } from './Tag'

export type Board = {
  id: string
  title: string
  columns: Column[]
  tags: Tag[]
  ownerId: string
  owner: {
    id: string
    email: string
  }
}
