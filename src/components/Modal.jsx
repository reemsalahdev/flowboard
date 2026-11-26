import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

/**
 * Accessible modal shell used by the card editor and confirm dialogs.
 * - Rendered in a portal so it sits above everything (no z-index fights).
 * - Esc and clicking the backdrop close it.
 * - Focus moves into the dialog, Tab stays inside it, and focus returns
 *   to whatever was focused before (usually the card) when it closes.
 */
export default function Modal({ onClose, labelledBy, className = '', children, initialFocusRef }) {
  const dialogRef = useRef(null)
  // Keep the latest onClose in a ref so the effect below runs only once.
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    const previouslyFocused = document.activeElement
    const dialog = dialogRef.current
    const first = initialFocusRef?.current ?? dialog.querySelector(FOCUSABLE)
    first?.focus()

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onCloseRef.current()
      }
      if (event.key === 'Tab') {
        // Simple focus trap: wrap from last to first element and back.
        const items = [...dialog.querySelectorAll(FOCUSABLE)].filter((el) => !el.disabled)
        if (!items.length) return
        const firstItem = items[0]
        const lastItem = items[items.length - 1]
        if (event.shiftKey && document.activeElement === firstItem) {
          event.preventDefault()
          lastItem.focus()
        } else if (!event.shiftKey && document.activeElement === lastItem) {
          event.preventDefault()
          firstItem.focus()
        }
      }
    }

    dialog.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      dialog.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
      previouslyFocused?.focus?.()
    }
  }, [initialFocusRef])

  return createPortal(
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={dialogRef} className={`modal ${className}`} role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
        {children}
      </div>
    </div>,
    document.body,
  )
}
