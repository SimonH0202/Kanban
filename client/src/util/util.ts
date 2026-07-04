export function generateUniqueId(): string {
  return `id-${new Date().getTime()}-${Math.floor(Math.random() * 1000)}`
}

export function formatDate(value?: Date | string | null) {
  if (!value) return ''

  const date = value instanceof Date ? value : new Date(value)

  return `${date.getUTCDate()}.${date.getUTCMonth() + 1}.${date.getUTCFullYear()}`
}
