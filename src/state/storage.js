// Thin wrapper around localStorage. All reads/writes are wrapped in try/catch
// because localStorage can throw (private mode, storage full, disabled cookies)
// and the app should keep working in memory instead of crashing.
const STORAGE_KEY = 'flowboard:state:v1'

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    // Very small sanity check so corrupted data doesn't break the UI.
    if (!parsed || !parsed.boards || !parsed.columns || !parsed.tasks || !Array.isArray(parsed.boardOrder)) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}
