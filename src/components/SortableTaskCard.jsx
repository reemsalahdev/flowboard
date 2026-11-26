import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import TaskCard from './TaskCard.jsx'

/**
 * Connects a TaskCard to dnd-kit. `useSortable` gives us:
 *  - setNodeRef: the DOM node dnd-kit measures
 *  - listeners/attributes: pointer + keyboard handlers and ARIA props
 *  - transform/transition: how far to shift while other cards move around
 */
export default function SortableTaskCard({ task, columnId, onOpen }) {
  const { setNodeRef, listeners, attributes, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'task', columnId },
  })

  const style = { transform: CSS.Translate.toString(transform), transition }

  return (
    <TaskCard
      ref={setNodeRef}
      task={task}
      style={style}
      // The card being dragged stays in the list as a faded "slot",
      // while a floating copy follows the pointer in the DragOverlay.
      isPlaceholder={isDragging}
      {...attributes}
      {...listeners}
      aria-roledescription="Draggable card"
      aria-label={`${task.title}. Press Enter to open, Space to pick up.`}
      onClick={() => onOpen(task.id)}
      onKeyDown={(event) => {
        // Enter opens the card; Space is reserved for dnd-kit's keyboard dragging.
        if (event.key === 'Enter' && !isDragging) {
          event.preventDefault()
          onOpen(task.id)
          return
        }
        listeners?.onKeyDown?.(event)
      }}
    />
  )
}
