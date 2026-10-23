const pad = (n: number) => String(n).padStart(2, '0')

export function formatDateTime(value: string | Date | null | undefined) {
  if (!value) return 'Sin fecha'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return 'Sin fecha'
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function fileStamp(date = new Date()) {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}`
}
