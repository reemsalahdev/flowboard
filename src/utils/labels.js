// Labels are plain strings. Instead of storing a color for each label,
// we derive a stable color from the text itself (a tiny string hash),
// so "design" is always the same color everywhere in the app.
const LABEL_HUES = ['teal', 'blue', 'violet', 'pink', 'orange', 'green', 'cyan', 'yellow']

export function labelColor(label) {
  let hash = 0
  for (const char of label.toLowerCase()) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  }
  return LABEL_HUES[hash % LABEL_HUES.length]
}

export function normalizeLabel(text) {
  return text.trim().toLowerCase().replace(/\s+/g, '-').slice(0, 24)
}
