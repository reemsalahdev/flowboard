import { useState } from 'react'
import { PlusIcon } from './Icons.jsx'

/** Ghost column at the end of the board for adding a new column. */
export default function AddColumn({ onAdd }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')

  function submit(event) {
    event.preventDefault()
    const trimmed = title.trim()
    if (trimmed) onAdd(trimmed)
    setTitle('')
    setOpen(false)
  }

  if (!open) {
    return (
      <button type="button" className="add-column" onClick={() => setOpen(true)}>
        <PlusIcon size={15} /> Add column
      </button>
    )
  }

  return (
    <form className="add-column add-column--form" onSubmit={submit}>
      <input
        autoFocus
        className="input"
        placeholder="Column name…"
        value={title}
        maxLength={40}
        aria-label="New column name"
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
        onBlur={() => !title.trim() && setOpen(false)}
      />
      <div className="add-card-form__actions">
        <button type="submit" className="btn btn--primary btn--sm">Add column</button>
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </form>
  )
}
