import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MeasuringStrategy,
  MouseSensor,
  TouchSensor,
  closestCenter,
  closestCorners,
  defaultDropAnimationSideEffects,
  pointerWithin,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useRef, useState } from 'react'
import { useBoardDispatch, useBoardState } from '../state/BoardContext.jsx'
import { ACTIONS, findColumnIdOfTask } from '../state/boardReducer.js'
import { hasActiveFilters, taskMatches } from '../utils/filters.js'
import AddColumn from './AddColumn.jsx'
import Column, { ColumnPreview } from './Column.jsx'
import TaskCard from './TaskCard.jsx'

/*
 * Collision detection decides *what* the dragged item is "over".
 * - Dragging a column: only other columns count.
 * - Dragging a card: prefer the card under the pointer; if the pointer is in
 *   a column's empty space, use the nearest card in that column (or the
 *   column itself when it's empty). Fall back to closestCorners for keyboard.
 */
function kanbanCollision(args) {
  const isColumn = (container) => container.data.current?.type === 'column'
  const isTask = (container) => container.data.current?.type === 'task'

  if (args.active.data.current?.type === 'column') {
    return closestCenter({ ...args, droppableContainers: args.droppableContainers.filter(isColumn) })
  }

  const hits = pointerWithin(args)
  const taskHit = hits.find((hit) => isTask(hit.data.droppableContainer))
  if (taskHit) return [taskHit]

  const columnHit = hits.find((hit) => isColumn(hit.data.droppableContainer))
  if (columnHit) {
    const cardsInColumn = args.droppableContainers.filter(
      (c) => isTask(c) && c.data.current.columnId === columnHit.id,
    )
    return cardsInColumn.length ? closestCenter({ ...args, droppableContainers: cardsInColumn }) : [columnHit]
  }

  return closestCorners(args)
}

// The overlay "settles" into place when dropped, while the placeholder fades back in.
const dropAnimation = {
  duration: 220,
  easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
  sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } }),
}

export default function Board({ board, filters, onOpenTask }) {
  const state = useBoardState()
  const dispatch = useBoardDispatch()
  const [activeItem, setActiveItem] = useState(null) // { id, type } while dragging
  const dragOrigin = useRef(null) // where a card started, to restore it if the drag is cancelled

  const sensors = useSensors(
    // Require a small movement before dragging, so normal clicks still open the card.
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    // On touch, a short press-and-hold starts a drag; a quick swipe still scrolls.
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    // Space picks up / drops, arrows move, Esc cancels. Enter is left free to open cards.
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      keyboardCodes: { start: ['Space'], cancel: ['Escape'], end: ['Space', 'Enter'] },
    }),
  )

  const filtering = hasActiveFilters(filters)

  /** Resolves a droppable id (a card id or a column id) to the column it belongs to. */
  function columnIdOf(id) {
    return board.columnIds.includes(id) ? id : findColumnIdOfTask(state, id)
  }

  function handleDragStart({ active }) {
    const type = active.data.current?.type
    setActiveItem({ id: active.id, type })
    if (type === 'task') {
      const columnId = findColumnIdOfTask(state, active.id)
      dragOrigin.current = { columnId, index: state.columns[columnId].taskIds.indexOf(active.id) }
    }
  }

  // Fires continuously while dragging. We only handle cards crossing into
  // *another* column here, so the card visibly jumps there under the pointer.
  function handleDragOver({ active, over }) {
    if (!over || active.data.current?.type !== 'task') return
    const fromColumnId = findColumnIdOfTask(state, active.id)
    const toColumnId = columnIdOf(over.id)
    if (!toColumnId || fromColumnId === toColumnId) return

    const targetIds = state.columns[toColumnId].taskIds
    let toIndex = targetIds.length // hovering the column itself → append
    if (over.id !== toColumnId) {
      // Hovering a card: go above or below it depending on the pointer position.
      const translated = active.rect.current.translated
      const isBelow = translated && translated.top > over.rect.top + over.rect.height / 2
      toIndex = targetIds.indexOf(over.id) + (isBelow ? 1 : 0)
    }
    dispatch({ type: ACTIONS.TASK_MOVE, taskId: active.id, toColumnId, toIndex })
  }

  // Fires once on drop: handles reordering inside a column and column reordering.
  function handleDragEnd({ active, over }) {
    setActiveItem(null)
    dragOrigin.current = null
    if (!over || active.id === over.id) return

    if (active.data.current?.type === 'column') {
      const toIndex = board.columnIds.indexOf(columnIdOf(over.id))
      dispatch({ type: ACTIONS.COLUMN_MOVE, boardId: board.id, columnId: active.id, toIndex })
      return
    }

    const columnId = findColumnIdOfTask(state, active.id)
    if (columnId === columnIdOf(over.id) && over.id !== columnId) {
      const toIndex = state.columns[columnId].taskIds.indexOf(over.id)
      dispatch({ type: ACTIONS.TASK_MOVE, taskId: active.id, toColumnId: columnId, toIndex })
    }
  }

  // Esc during a drag: put the card back exactly where it started.
  function handleDragCancel() {
    if (activeItem?.type === 'task' && dragOrigin.current) {
      const { columnId, index } = dragOrigin.current
      dispatch({ type: ACTIONS.TASK_MOVE, taskId: activeItem.id, toColumnId: columnId, toIndex: index })
    }
    setActiveItem(null)
    dragOrigin.current = null
  }

  function visibleTaskIds(column) {
    if (!filtering) return column.taskIds
    // The card being dragged always stays visible so it can't vanish mid-drag.
    return column.taskIds.filter((id) => id === activeItem?.id || taskMatches(state.tasks[id], filters))
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={kanbanCollision}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="board">
        <SortableContext items={board.columnIds} strategy={horizontalListSortingStrategy}>
          {board.columnIds.map((columnId, index) => (
            <Column
              key={columnId}
              column={state.columns[columnId]}
              boardId={board.id}
              index={index}
              columnCount={board.columnIds.length}
              visibleTaskIds={visibleTaskIds(state.columns[columnId])}
              isFiltering={filtering}
              onOpenTask={onOpenTask}
            />
          ))}
        </SortableContext>
        <AddColumn onAdd={(title) => dispatch({ type: ACTIONS.COLUMN_ADD, boardId: board.id, title })} />
      </div>

      <DragOverlay dropAnimation={dropAnimation}>
        {activeItem?.type === 'task' && state.tasks[activeItem.id] && (
          <TaskCard task={state.tasks[activeItem.id]} isOverlay />
        )}
        {activeItem?.type === 'column' && state.columns[activeItem.id] && (
          <ColumnPreview
            column={state.columns[activeItem.id]}
            tasks={state.columns[activeItem.id].taskIds.map((id) => state.tasks[id])}
          />
        )}
      </DragOverlay>
    </DndContext>
  )
}
