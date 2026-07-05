export function formatDate(value?: Date | string | null): string {
  if (!value) return ''

  const date = value instanceof Date ? value : new Date(value)

  return `${date.getUTCDate()}.${date.getUTCMonth() + 1}.${date.getUTCFullYear()}`
}

export function formatDateToInputValueString(value?: Date | string | null): string {
  if (!value) return ''

  const dateString = value instanceof Date ? value.toISOString().split('T')[0] : value.split('T')[0]

  return dateString != undefined ? dateString : ''
}
