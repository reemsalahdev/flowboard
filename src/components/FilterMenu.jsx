import { useCallback, useRef, useState } from 'react'
import { useClickOutside } from '../hooks/useClickOutside.js'
import { FilterIcon } from './Icons.jsx'
import LabelChip from './LabelChip.jsx'
import { PRIORITIES } from './PriorityBadge.jsx'

/** Popover with toggles for priority and label filters. */
export default function FilterMenu({ tasks, filters, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const close = useCallback(() => setOpen(false), [])
  useClickOutside(ref, close, open)

  // Only offer labels that actually exist on this board, sorted alphabetically.
  const allLabels = [...new Set(tasks.flatMap((t) => t.labels))].sort()
  const activeCount = filters.priorities.length + filters.labels.length

  // Adds the value if it's missing, removes it if it's there.
  function toggle(key, value) {
    const list = filters[key]
    onChange({ ...filters, [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] })
  }

  return (
    <div className="dropdown" ref={ref}>
      <button
        type="button"
        className={`btn btn--outline btn--sm ${activeCount ? 'is-active' : ''}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <FilterIcon size={13} /> Filter
        {activeCount > 0 && <span className="pill-count">{activeCount}</span>}
      </button>

      {open && (
        <div className="dropdown__menu dropdown__menu--right filter-menu" role="dialog" aria-label="Filters">
          <p className="filter-menu__heading">Priority</p>
          <div className="filter-menu__options">
            {PRIORITIES.map((p) => (
              <button
                key={p.value}
                type="button"
                className={`toggle-chip toggle-chip--${p.value} ${filters.priorities.includes(p.value) ? 'is-on' : ''}`}
                aria-pressed={filters.priorities.includes(p.value)}
                onClick={() => toggle('priorities', p.value)}
              >
                <span className="dot" /> {p.label}
              </button>
            ))}
          </div>

          <p className="filter-menu__heading">Labels</p>
          {allLabels.length === 0 ? (
            <p className="filter-menu__empty">No labels on this board yet.</p>
          ) : (
            <div className="filter-menu__options">
              {allLabels.map((label) => (
                <button
                  key={label}
                  type="button"
                  className={`label-toggle ${filters.labels.includes(label) ? 'is-on' : ''}`}
                  aria-pressed={filters.labels.includes(label)}
                  onClick={() => toggle('labels', label)}
                >
                  <LabelChip label={label} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
