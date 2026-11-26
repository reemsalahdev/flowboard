import { useEffect, useRef, useState } from 'react'

/**
 * Text that turns into an input when editing.
 * Enter or blur saves, Esc cancels. Empty values are ignored (keeps the old name).
 */
export default function InlineEdit({ value, onSave, editing, onEditingChange, className = '', ariaLabel }) {
  const [draft, setDraft] = useState(value)
  const inputRef = useRef(null)

  useEffect(() => {
    if (editing) {
      setDraft(value)
      // Wait for the input to mount, then select its text for quick replacing.
      requestAnimationFrame(() => inputRef.current?.select())
    }
  }, [editing, value])

  if (!editing) return <span className={className}>{value}</span>

  function commit() {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== value) onSave(trimmed)
    onEditingChange(false)
  }

  return (
    <input
      ref={inputRef}
      className={`inline-edit ${className}`}
      value={draft}
      aria-label={ariaLabel}
      maxLength={60}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit()
        if (e.key === 'Escape') {
          e.stopPropagation()
          onEditingChange(false)
        }
      }}
      // Stop pointer events so dnd-kit doesn't start a drag while typing.
      onPointerDown={(e) => e.stopPropagation()}
    />
  )
}
