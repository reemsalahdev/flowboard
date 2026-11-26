import { useId, useRef, useState } from 'react'
import { useBoardDispatch, useBoardState } from '../state/BoardContext.jsx'
import { ACTIONS, findColumnIdOfTask } from '../state/boardReducer.js'
import { dueStatus } from '../utils/dates.js'
import { createId } from '../utils/id.js'
import { normalizeLabel } from '../utils/labels.js'
import { AlignIcon, CalendarIcon, CheckSquareIcon, FlagIcon, LayoutIcon, TagIcon, TrashIcon, XIcon } from './Icons.jsx'
import LabelChip from './LabelChip.jsx'
import Modal from './Modal.jsx'
import { PRIORITIES } from './PriorityBadge.jsx'

/**
 * Card editor. Every change is dispatched straight away, so there's no
 * "Save" button — the reducer updates and BoardContext auto-saves to localStorage.
 */
export default function CardModal({ taskId, board, onClose }) {
  const state = useBoardState()
  const dispatch = useBoardDispatch()
  const task = state.tasks[taskId]
  const titleId = useId()
  const titleRef = useRef(null)
  const [titleDraft, setTitleDraft] = useState(task?.title ?? '')
  const [labelDraft, setLabelDraft] = useState('')
  const [checkDraft, setCheckDraft] = useState('')

  if (!task) return null // e.g. the task was deleted

  const update = (changes) => dispatch({ type: ACTIONS.TASK_UPDATE, taskId, changes })
  const columnId = findColumnIdOfTask(state, taskId)
  const done = task.checklist.filter((c) => c.done).length
  const progress = task.checklist.length ? Math.round((done / task.checklist.length) * 100) : 0

  // Suggest labels already used anywhere on this board.
  const boardLabels = [
    ...new Set(board.columnIds.flatMap((colId) => state.columns[colId].taskIds.flatMap((id) => state.tasks[id].labels))),
  ].filter((l) => !task.labels.includes(l))

  // Save the title as you type (so closing with Esc never loses it),
  // but never save an empty title — on blur an empty draft reverts.
  function changeTitle(value) {
    setTitleDraft(value)
    if (value.trim()) update({ title: value.trim() })
  }

  function addLabel(event) {
    event.preventDefault()
    const label = normalizeLabel(labelDraft)
    if (label && !task.labels.includes(label)) update({ labels: [...task.labels, label] })
    setLabelDraft('')
  }

  function addCheckItem(event) {
    event.preventDefault()
    const text = checkDraft.trim()
    if (text) update({ checklist: [...task.checklist, { id: createId('check'), text, done: false }] })
    setCheckDraft('')
  }

  function updateCheckItem(itemId, changes) {
    update({ checklist: task.checklist.map((c) => (c.id === itemId ? { ...c, ...changes } : c)) })
  }

  function deleteTask() {
    dispatch({ type: ACTIONS.TASK_DELETE, taskId })
    onClose()
  }

  return (
    <Modal onClose={onClose} labelledBy={titleId} className="modal--card" initialFocusRef={titleRef}>
      <div className="card-modal__head">
        <span className="card-modal__crumb">
          {board.name} <span aria-hidden="true">/</span> {state.columns[columnId]?.title}
        </span>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close (Esc)">
          <XIcon />
        </button>
      </div>

      <h2 id={titleId} className="sr-only">Edit card</h2>
      <textarea
        ref={titleRef}
        className="card-modal__title"
        value={titleDraft}
        rows={1}
        maxLength={140}
        aria-label="Card title"
        onChange={(e) => changeTitle(e.target.value)}
        onBlur={() => !titleDraft.trim() && setTitleDraft(task.title)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            e.currentTarget.blur()
          }
        }}
      />

      <div className="card-modal__grid">
        {/* ── Properties ── */}
        <div className="prop">
          <span className="prop__label"><LayoutIcon size={14} /> Status</span>
          <select
            className="input input--sm"
            value={columnId}
            aria-label="Column"
            onChange={(e) => dispatch({ type: ACTIONS.TASK_MOVE, taskId, toColumnId: e.target.value })}
          >
            {board.columnIds.map((id) => (
              <option key={id} value={id}>{state.columns[id].title}</option>
            ))}
          </select>
        </div>

        <div className="prop">
          <span className="prop__label"><FlagIcon size={14} /> Priority</span>
          <div className="segmented" role="radiogroup" aria-label="Priority">
            {PRIORITIES.map((p) => (
              <button
                key={p.value}
                type="button"
                role="radio"
                aria-checked={task.priority === p.value}
                className={`segmented__item segmented__item--${p.value} ${task.priority === p.value ? 'is-on' : ''}`}
                onClick={() => update({ priority: p.value })}
              >
                <span className="dot" /> {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="prop">
          <span className="prop__label"><CalendarIcon size={14} /> Due date</span>
          <div className="prop__row">
            <input
              type="date"
              className={`input input--sm ${dueStatus(task.dueDate) === 'overdue' ? 'input--overdue' : ''}`}
              value={task.dueDate ?? ''}
              aria-label="Due date"
              onChange={(e) => update({ dueDate: e.target.value || null })}
            />
            {dueStatus(task.dueDate) === 'overdue' && <span className="due due--overdue">Overdue</span>}
            {task.dueDate && (
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => update({ dueDate: null })}>
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="prop">
          <span className="prop__label"><TagIcon size={14} /> Labels</span>
          <div className="prop__labels">
            {task.labels.map((label) => (
              <LabelChip
                key={label}
                label={label}
                onRemove={() => update({ labels: task.labels.filter((l) => l !== label) })}
              />
            ))}
            <form onSubmit={addLabel} className="label-form">
              <input
                className="input input--sm input--bare"
                placeholder="+ Add label"
                value={labelDraft}
                list="label-suggestions"
                aria-label="Add label"
                onChange={(e) => setLabelDraft(e.target.value)}
              />
              <datalist id="label-suggestions">
                {boardLabels.map((l) => <option key={l} value={l} />)}
              </datalist>
            </form>
          </div>
        </div>
      </div>

      {/* ── Description ── */}
      <section className="card-modal__section">
        <h3 className="section-title"><AlignIcon size={14} /> Description</h3>
        <textarea
          className="input card-modal__desc"
          placeholder="Add more detail…"
          value={task.description}
          rows={4}
          aria-label="Description"
          onChange={(e) => update({ description: e.target.value })}
        />
      </section>

      {/* ── Checklist ── */}
      <section className="card-modal__section">
        <h3 className="section-title">
          <CheckSquareIcon size={14} /> Checklist
          {task.checklist.length > 0 && <span className="section-title__meta">{done}/{task.checklist.length} · {progress}%</span>}
        </h3>
        {task.checklist.length > 0 && (
          <div className="progress progress--lg" aria-hidden="true">
            <div className={`progress__bar ${progress === 100 ? 'is-complete' : ''}`} style={{ width: `${progress}%` }} />
          </div>
        )}
        <ul className="checklist">
          {task.checklist.map((item) => (
            <li key={item.id} className={`checklist__item ${item.done ? 'is-done' : ''}`}>
              <input
                type="checkbox"
                className="checkbox"
                checked={item.done}
                aria-label={`Mark “${item.text}” as ${item.done ? 'not done' : 'done'}`}
                onChange={(e) => updateCheckItem(item.id, { done: e.target.checked })}
              />
              <input
                className="checklist__text"
                value={item.text}
                aria-label="Subtask"
                onChange={(e) => updateCheckItem(item.id, { text: e.target.value })}
              />
              <button
                type="button"
                className="icon-btn icon-btn--sm checklist__remove"
                aria-label={`Remove “${item.text}”`}
                onClick={() => update({ checklist: task.checklist.filter((c) => c.id !== item.id) })}
              >
                <XIcon size={13} />
              </button>
            </li>
          ))}
        </ul>
        <form onSubmit={addCheckItem} className="checklist__add">
          <input
            className="input input--sm"
            placeholder="Add a subtask and press Enter"
            value={checkDraft}
            aria-label="New subtask"
            onChange={(e) => setCheckDraft(e.target.value)}
          />
        </form>
      </section>

      <footer className="card-modal__footer">
        <span className="card-modal__hint"><kbd>Esc</kbd> to close · changes save automatically</span>
        <button type="button" className="btn btn--danger-ghost btn--sm" onClick={deleteTask}>
          <TrashIcon size={14} /> Delete card
        </button>
      </footer>
    </Modal>
  )
}
