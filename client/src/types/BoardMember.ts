import type { User } from './User'

export type BoardMember = {
  boardId: string
  userId: string
  joinedAt: string
  user: User
}
