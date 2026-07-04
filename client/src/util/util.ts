export function generateUniqueId(): string {
  return `id-${new Date().getTime()}-${Math.floor(Math.random() * 1000)}`
}
