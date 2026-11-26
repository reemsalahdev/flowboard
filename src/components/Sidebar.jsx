import { useState } from 'react'
import { useBoardDispatch, useBoardState } from '../state/BoardContext.jsx'
import { ACTIONS } from '../state/boardReducer.js'
import ConfirmDialog from './ConfirmDialog.jsx'
import Dropdown, { MenuItem } from './Dropdown.jsx'
import { MoreIcon, PencilIcon, PlusIcon, ResetIcon, TrashIcon, XIcon } from './Icons.jsx'
import InlineEdit from './InlineEdit.jsx'
import Logo from './Logo.jsx'

export default function Sidebar({ open, onClose }) {
  const state = useBoardState()
  const dispatch = useBoardDispatch()
  const [renamingId, setRenamingId] = useState(null)
  const [newBoardName, setNewBoardName] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  // Which confirmation is open: { type: 'delete', boardId } | { type: 'reset' } | null
  const [confirm, setConfirm] = useState(null)

  function countTasks(board) {
    return board.columnIds.reduce((sum, colId) => sum + state.columns[colId].taskIds.length, 0)
  }

  function handleAddBoard(event) {
    event.preventDefault()
    const name = newBoardName.trim()
    if (name) {
      dispatch({ type: ACTIONS.BOARD_ADD, name })
      onClose()
    }
    setNewBoardName('')
    setIsAdding(false)
  }

  function selectBoard(boardId) {
    dispatch({ type: ACTIONS.BOARD_SELECT, boardId })
    onClose()
  }

  return (
    <>
      <div className={`sidebar-scrim ${open ? 'is-open' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside className={`sidebar ${open ? 'is-open' : ''}`} aria-label="Boards">
        <div className="sidebar__top">
          <Logo />
          <button type="button" className="icon-btn sidebar__close" onClick={onClose} aria-label="Close sidebar">
            <XIcon />
          </button>
        </div>

        <div className="sidebar__section-head">
          <span>Boards</span>
          <button type="button" className="icon-btn icon-btn--sm" onClick={() => setIsAdding(true)} aria-label="Create board">
            <PlusIcon size={15} />
          </button>
        </div>

        <nav className="board-list">
          {state.boardOrder.map((boardId) => {
            const board = state.boards[boardId]
            const active = boardId === state.activeBoardId
            return (
              <div key={boardId} className={`board-item ${active ? 'is-active' : ''}`}>
                {renamingId === boardId ? (
                  // While renaming, swap the button for an input (an input inside a button is invalid HTML).
                  <div className="board-item__main">
                    <span className={`board-avatar board-avatar--${board.color ?? 'teal'}`}>
                      {board.name.charAt(0).toUpperCase()}
                    </span>
                    <InlineEdit
                      className="board-item__name"
                      value={board.name}
                      ariaLabel="Board name"
                      editing
                      onEditingChange={(on) => !on && setRenamingId(null)}
                      onSave={(name) => dispatch({ type: ACTIONS.BOARD_RENAME, boardId, name })}
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    className="board-item__main"
                    onClick={() => selectBoard(boardId)}
                    onDoubleClick={() => setRenamingId(boardId)}
                    aria-current={active ? 'page' : undefined}
                  >
                    <span className={`board-avatar board-avatar--${board.color ?? 'teal'}`}>
                      {board.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="board-item__name">{board.name}</span>
                    <span className="board-item__count">{countTasks(board)}</span>
                  </button>
                )}
                <Dropdown trigger={<MoreIcon size={15} />} label={`Options for ${board.name}`} className="board-item__menu">
                  {(close) => (
                    <>
                      <MenuItem icon={<PencilIcon size={14} />} onClick={() => { setRenamingId(boardId); close() }}>
                        Rename
                      </MenuItem>
                      <MenuItem icon={<TrashIcon size={14} />} danger onClick={() => { setConfirm({ type: 'delete', boardId }); close() }}>
                        Delete board
                      </MenuItem>
                    </>
                  )}
                </Dropdown>
              </div>
            )
          })}

          {isAdding ? (
            <form onSubmit={handleAddBoard} className="board-add-form">
              <input
                autoFocus
                className="input input--sm"
                placeholder="Board name…"
                value={newBoardName}
                maxLength={60}
                onChange={(e) => setNewBoardName(e.target.value)}
                onBlur={handleAddBoard}
                onKeyDown={(e) => e.key === 'Escape' && (setIsAdding(false), setNewBoardName(''))}
                aria-label="New board name"
              />
            </form>
          ) : (
            <button type="button" className="board-add" onClick={() => setIsAdding(true)}>
              <PlusIcon size={14} /> New board
            </button>
          )}
        </nav>

        <div className="sidebar__footer">
          <button type="button" className="sidebar__link" onClick={() => setConfirm({ type: 'reset' })}>
            <ResetIcon size={14} /> Reset demo data
          </button>
          <p className="sidebar__note">
            <span className="save-dot" /> Saved in this browser
          </p>
        </div>
      </aside>

      {confirm?.type === 'delete' && (
        <ConfirmDialog
          title={`Delete “${state.boards[confirm.boardId].name}”?`}
          message="This board, its columns and all of its cards will be permanently removed."
          confirmLabel="Delete board"
          onConfirm={() => dispatch({ type: ACTIONS.BOARD_DELETE, boardId: confirm.boardId })}
          onCancel={() => setConfirm(null)}
        />
      )}
      {confirm?.type === 'reset' && (
        <ConfirmDialog
          title="Reset to demo data?"
          message="All your boards will be replaced with the original demo workspace. This can’t be undone."
          confirmLabel="Reset demo"
          onConfirm={() => dispatch({ type: ACTIONS.RESET_DEMO })}
          onCancel={() => setConfirm(null)}
        />
      )}
    </>
  )
}
