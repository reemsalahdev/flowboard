// Small unique id helper. crypto.randomUUID exists in all modern browsers,
// the fallback keeps things working in older ones (and in plain HTTP on some).
export function createId(prefix = 'id') {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID().slice(0, 8)}`
  }
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}
