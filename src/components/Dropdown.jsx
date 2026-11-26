import { useCallback, useRef, useState } from 'react'
import { useClickOutside } from '../hooks/useClickOutside.js'

/**
 * Minimal dropdown menu. `trigger` is rendered as the button content and
 * `children` is a function receiving `close` so menu items can close the menu.
 */
export default function Dropdown({ trigger, label, children, align = 'right', className = '' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const close = useCallback(() => setOpen(false), [])
  useClickOutside(ref, close, open)

  return (
    <div className={`dropdown ${className}`} ref={ref}>
      <button
        type="button"
        className="icon-btn"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {trigger}
      </button>
      {open && (
        <div className={`dropdown__menu dropdown__menu--${align}`} role="menu" onPointerDown={(e) => e.stopPropagation()}>
          {children(close)}
        </div>
      )}
    </div>
  )
}

export function MenuItem({ icon, children, onClick, danger, disabled }) {
  return (
    <button
      type="button"
      role="menuitem"
      className={`menu-item ${danger ? 'menu-item--danger' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon}
      <span>{children}</span>
    </button>
  )
}
