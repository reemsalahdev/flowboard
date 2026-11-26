import { createContext, useContext, useEffect, useReducer } from 'react'
import { boardReducer } from './boardReducer.js'
import { createDemoState } from './demoData.js'
import { loadState, saveState } from './storage.js'

// Two contexts instead of one: components that only *dispatch* (buttons, forms)
// don't re-render when the state changes, because `dispatch` never changes.
const StateContext = createContext(null)
const DispatchContext = createContext(null)

/** Runs once, on first render: use saved data if there is any, otherwise the demo. */
function init() {
  return loadState() ?? createDemoState()
}

export function BoardProvider({ children }) {
  const [state, dispatch] = useReducer(boardReducer, undefined, init)

  // Auto-save. A short delay batches rapid changes (e.g. many drag-over
  // events while a card is being dragged) into a single write.
  useEffect(() => {
    const timer = setTimeout(() => saveState(state), 250)
    return () => clearTimeout(timer)
  }, [state])

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>{children}</DispatchContext.Provider>
    </StateContext.Provider>
  )
}

export function useBoardState() {
  const state = useContext(StateContext)
  if (!state) throw new Error('useBoardState must be used inside <BoardProvider>')
  return state
}

export function useBoardDispatch() {
  const dispatch = useContext(DispatchContext)
  if (!dispatch) throw new Error('useBoardDispatch must be used inside <BoardProvider>')
  return dispatch
}
