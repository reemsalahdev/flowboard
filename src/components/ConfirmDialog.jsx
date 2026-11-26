import { useId } from 'react'
import Modal from './Modal.jsx'

/** A small "Are you sure?" dialog — nicer (and themeable) compared to window.confirm. */
export default function ConfirmDialog({ title, message, confirmLabel = 'Delete', tone = 'danger', onConfirm, onCancel }) {
  const titleId = useId()
  return (
    <Modal onClose={onCancel} labelledBy={titleId} className="modal--confirm">
      <h2 id={titleId} className="confirm__title">{title}</h2>
      <p className="confirm__message">{message}</p>
      <div className="confirm__actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className={`btn ${tone === 'danger' ? 'btn--danger' : 'btn--primary'}`}
          onClick={() => {
            onConfirm()
            onCancel()
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
