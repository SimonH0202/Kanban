export function generateUniqueId(): string {
  return `id-${new Date().getTime()}-${Math.floor(Math.random() * 1000)}`
}

export function formatDate(date: Date): string {
  return `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`
}
