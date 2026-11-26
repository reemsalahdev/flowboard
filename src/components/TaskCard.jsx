import { forwardRef } from 'react'
import { dueStatus, formatDue } from '../utils/dates.js'
import { AlignIcon, CalendarIcon, CheckSquareIcon } from './Icons.jsx'
import LabelChip from './LabelChip.jsx'
import PriorityBadge from './PriorityBadge.jsx'

/**
 * Purely visual card. It knows nothing about drag & drop, which lets us
 * reuse the exact same markup inside the <DragOverlay> while dragging.
 */
const TaskCard = forwardRef(function TaskCard({ task, isOverlay, isPlaceholder, className = '', ...props }, ref) {
  const done = task.checklist.filter((item) => item.done).length
  const total = task.checklist.length
  const progress = total ? Math.round((done / total) * 100) : 0
  const status = dueStatus(task.dueDate)

  const classes = [
    'card',
    isOverlay && 'card--overlay',
    isPlaceholder && 'card--placeholder',
    `card--${task.priority}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <article ref={ref} className={classes} {...props}>
      {task.labels.length > 0 && (
        <div className="card__labels">
          {task.labels.map((label) => (
            <LabelChip key={label} label={label} />
          ))}
        </div>
      )}

      <h3 className="card__title">{task.title}</h3>

      <div className="card__meta">
        <PriorityBadge priority={task.priority} />
        {task.dueDate && (
          <span className={`due due--${status}`} title={status === 'overdue' ? 'Overdue' : 'Due date'}>
            <CalendarIcon size={12} />
            {formatDue(task.dueDate)}
          </span>
        )}
        <span className="card__meta-spacer" />
        {task.description && (
          <span className="card__icon" title="Has description">
            <AlignIcon size={13} />
          </span>
        )}
        {total > 0 && (
          <span className={`card__checks ${done === total ? 'is-complete' : ''}`} title="Checklist">
            <CheckSquareIcon size={13} />
            {done}/{total}
          </span>
        )}
      </div>

      {total > 0 && (
        <div
          className="progress"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Checklist progress"
        >
          <div className={`progress__bar ${done === total ? 'is-complete' : ''}`} style={{ width: `${progress}%` }} />
        </div>
      )}
    </article>
  )
})

export default TaskCard
