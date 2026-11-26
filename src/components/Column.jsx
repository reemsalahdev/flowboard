import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState } from 'react'
import { useBoardDispatch, useBoardState } from '../state/BoardContext.jsx'
import { ACTIONS } from '../state/boardReducer.js'
import AddCardForm from './AddCardForm.jsx'
import ConfirmDialog from './ConfirmDialog.jsx'
import Dropdown, { MenuItem } from './Dropdown.jsx'
import EmptyColumn from './EmptyColumn.jsx'
import { ArrowLeftIcon, ArrowRightIcon, GripIcon, MoreIcon, PencilIcon, TrashIcon } from './Icons.jsx'
import InlineEdit from './InlineEdit.jsx'
import SortableTaskCard from './SortableTaskCard.jsx'
import TaskCard from './TaskCard.jsx'

/**
 * One column of the board. It's sortable itself (so columns can be reordered
 * by dragging the grip) and it also hosts a SortableContext for its cards.
 */
export default function Column({ column, boardId, index, columnCount, visibleTaskIds, isFiltering, onOpenTask }) {
  const state = useBoardState()
  const dispatch = useBoardDispatch()
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const { setNodeRef, setActivatorNodeRef, listeners, attributes, transform, transition, isDragging } = useSortable({
    id: column.id,
    data: { type: 'column' },
  })

  const style = { transform: CSS.Translate.toString(transform), transition }
  const total = column.taskIds.length

  function move(offset) {
    dispatch({ type: ACTIONS.COLUMN_MOVE, boardId, columnId: column.id, toIndex: index + offset })
  }

  function handleDelete() {
    // Only ask for confirmation when there's actually something to lose.
    if (total > 0) setConfirmDelete(true)
    else dispatch({ type: ACTIONS.COLUMN_DELETE, boardId, columnId: column.id })
  }

  return (
    <section
      ref={setNodeRef}
      style={style}
      className={`column ${isDragging ? 'column--placeholder' : ''}`}
      aria-label={`${column.title} column`}
    >
      <header className="column__header">
        <button
          type="button"
          ref={setActivatorNodeRef}
          className="column__grip"
          aria-label={`Reorder ${column.title} column`}
          {...attributes}
          {...listeners}
        >
          <GripIcon size={14} />
        </button>
        <h2 className="column__title" onDoubleClick={() => setEditing(true)}>
          <InlineEdit
            value={column.title}
            editing={editing}
            onEditingChange={setEditing}
            ariaLabel="Column name"
            onSave={(title) => dispatch({ type: ACTIONS.COLUMN_RENAME, columnId: column.id, title })}
          />
        </h2>
        <span className="column__count">
          {isFiltering ? `${visibleTaskIds.length}/${total}` : total}
        </span>
        <Dropdown trigger={<MoreIcon size={15} />} label={`Options for ${column.title}`}>
          {(close) => (
            <>
              <MenuItem icon={<PencilIcon size={14} />} onClick={() => { setEditing(true); close() }}>
                Rename
              </MenuItem>
              <MenuItem icon={<ArrowLeftIcon size={14} />} disabled={index === 0} onClick={() => { move(-1); close() }}>
                Move left
              </MenuItem>
              <MenuItem
                icon={<ArrowRightIcon size={14} />}
                disabled={index === columnCount - 1}
                onClick={() => { move(1); close() }}
              >
                Move right
              </MenuItem>
              <div className="menu-sep" />
              <MenuItem icon={<TrashIcon size={14} />} danger onClick={() => { handleDelete(); close() }}>
                Delete column
              </MenuItem>
            </>
          )}
        </Dropdown>
      </header>

      <div className="column__body">
        <SortableContext items={visibleTaskIds} strategy={verticalListSortingStrategy}>
          <div className="column__cards">
            {visibleTaskIds.map((taskId) => (
              <SortableTaskCard key={taskId} task={state.tasks[taskId]} columnId={column.id} onOpen={onOpenTask} />
            ))}
            {visibleTaskIds.length === 0 && <EmptyColumn filtered={isFiltering && total > 0} />}
          </div>
        </SortableContext>
      </div>

      <footer className="column__footer">
        <AddCardForm onAdd={(title) => dispatch({ type: ACTIONS.TASK_ADD, columnId: column.id, title })} />
      </footer>

      {confirmDelete && (
        <ConfirmDialog
          title={`Delete “${column.title}”?`}
          message={`This column and its ${total} card${total === 1 ? '' : 's'} will be permanently removed.`}
          confirmLabel="Delete column"
          onConfirm={() => dispatch({ type: ACTIONS.COLUMN_DELETE, boardId, columnId: column.id })}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </section>
  )
}

/** Lightweight, non-interactive copy of a column shown in the DragOverlay. */
export function ColumnPreview({ column, tasks }) {
  return (
    <section className="column column--overlay">
      <header className="column__header">
        <span className="column__grip"><GripIcon size={14} /></span>
        <h2 className="column__title">{column.title}</h2>
        <span className="column__count">{tasks.length}</span>
      </header>
      <div className="column__body">
        <div className="column__cards">
          {tasks.slice(0, 4).map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </div>
    </section>
  )
}
