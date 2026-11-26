import { useState } from 'react'
import { PlusIcon } from './Icons.jsx'

/** "+ Add card" button that expands into a small textarea. Enter adds, Esc closes. */
export default function AddCardForm({ onAdd }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')

  function submit(event) {
    event?.preventDefault()
    const trimmed = title.trim()
    if (trimmed) onAdd(trimmed)
    setTitle('') // stay open so several cards can be added in a row
  }

  if (!open) {
    return (
      <button type="button" className="add-card" onClick={() => setOpen(true)}>
        <PlusIcon size={14} /> Add card
      </button>
    )
  }

  return (
    <form className="add-card-form" onSubmit={submit}>
      <textarea
        autoFocus
        className="input add-card-form__input"
        placeholder="What needs to be done?"
        value={title}
        rows={2}
        maxLength={140}
        aria-label="New card title"
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          // Enter submits (Shift+Enter would add a newline, but titles are single-line).
          if (e.key === 'Enter') {
            e.preventDefault()
            submit()
          }
          if (e.key === 'Escape') setOpen(false)
        }}
        onBlur={() => !title.trim() && setOpen(false)}
      />
      <div className="add-card-form__actions">
        <button type="submit" className="btn btn--primary btn--sm">Add card</button>
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => { setOpen(false); setTitle('') }}>
          Cancel
        </button>
      </div>
    </form>
  )
}
