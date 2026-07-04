export type Card = {
  id: string
  columnId: string
  title: string
  description?: string
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
  dueDate?: Date | string | null
}
