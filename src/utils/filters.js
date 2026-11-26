// Pure helper used by columns to decide which cards to show.
// Keeping it pure (no React) makes it trivial to reason about and test.
export const EMPTY_FILTERS = { query: '', priorities: [], labels: [] }

export function hasActiveFilters(filters) {
  return Boolean(filters.query.trim() || filters.priorities.length || filters.labels.length)
}

export function taskMatches(task, filters) {
  const query = filters.query.trim().toLowerCase()
  if (query) {
    const haystack = [task.title, task.description, ...task.labels].join(' ').toLowerCase()
    if (!haystack.includes(query)) return false
  }
  if (filters.priorities.length && !filters.priorities.includes(task.priority)) return false
  if (filters.labels.length && !filters.labels.some((l) => task.labels.includes(l))) return false
  return true
}
