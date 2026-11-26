import { useBoardDispatch } from '../state/BoardContext.jsx'
import { ACTIONS } from '../state/boardReducer.js'
import { InboxIcon, PlusIcon, ResetIcon } from './Icons.jsx'

/** Shown when every board has been deleted. */
export default function NoBoards() {
  const dispatch = useBoardDispatch()
  return (
    <div className="no-boards">
      <div className="no-boards__icon"><InboxIcon size={28} /></div>
      <h2>No boards yet</h2>
      <p>Create a board to start organizing your work, or bring back the demo.</p>
      <div className="no-boards__actions">
        <button type="button" className="btn btn--primary" onClick={() => dispatch({ type: ACTIONS.BOARD_ADD, name: 'My first board' })}>
          <PlusIcon size={15} /> New board
        </button>
        <button type="button" className="btn btn--outline" onClick={() => dispatch({ type: ACTIONS.RESET_DEMO })}>
          <ResetIcon size={14} /> Load demo
        </button>
      </div>
    </div>
  )
}
