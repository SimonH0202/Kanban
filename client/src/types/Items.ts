export type ContextMenuItem = {
  label: string
  action: () => void | Promise<void>
  danger?: boolean
}

export type BoardListItem = {
  id: string
  title: string
}
