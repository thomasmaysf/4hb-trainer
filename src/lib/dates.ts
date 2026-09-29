export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function localISO(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseISO(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(iso: string, days: number) {
  const date = parseISO(iso)
  date.setDate(date.getDate() + days)
  return localISO(date)
}

export function weekdayIndex(iso: string) {
  return parseISO(iso).getDay()
}

export function startOfWeek(iso: string) {
  const day = weekdayIndex(iso)
  const delta = day === 0 ? -6 : 1 - day
  return addDays(iso, delta)
}

export function formatDay(iso: string, options?: Intl.DateTimeFormatOptions) {
  return parseISO(iso).toLocaleDateString('en-GB', options ?? { weekday: 'long', day: 'numeric', month: 'short' })
}
