export type ContextMenuItem = {
  label: string
  action: () => void | Promise<void>
  danger?: boolean
}

export type BoardListItem = {
  id: string
  title: string
  ownerId: string
  owner: {
    id: string
    email: string
  }
}
