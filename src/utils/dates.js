// Due dates are stored as plain "YYYY-MM-DD" strings (what <input type="date"> uses).
// Working with strings avoids time-zone surprises from `new Date('2025-01-01')`,
// which is parsed as UTC midnight and can show up as the previous day.

export function todayISO() {
  return toISODate(new Date())
}

export function toISODate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Returns a "YYYY-MM-DD" string `days` away from today (negative = past). */
export function daysFromToday(days) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return toISODate(date)
}

/** Parses "YYYY-MM-DD" as a *local* date. */
function parseLocal(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** -1 = overdue, 0 = due today, 1 = upcoming. String comparison works for ISO dates. */
export function dueStatus(iso) {
  if (!iso) return null
  const today = todayISO()
  if (iso < today) return 'overdue'
  if (iso === today) return 'today'
  return 'upcoming'
}

export function formatDue(iso) {
  if (!iso) return ''
  const status = dueStatus(iso)
  if (status === 'today') return 'Today'
  if (iso === daysFromToday(1)) return 'Tomorrow'
  if (iso === daysFromToday(-1)) return 'Yesterday'
  return parseLocal(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
