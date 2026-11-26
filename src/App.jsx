import { useEffect, useState } from 'react'
import Board from './components/Board.jsx'
import CardModal from './components/CardModal.jsx'
import NoBoards from './components/NoBoards.jsx'
import Sidebar from './components/Sidebar.jsx'
import Toolbar from './components/Toolbar.jsx'
import { useBoardState } from './state/BoardContext.jsx'
import { EMPTY_FILTERS } from './utils/filters.js'

export default function App() {
  const state = useBoardState()
  // UI-only state lives here with useState — it doesn't need to be saved,
  // so it stays out of the reducer that holds the persisted board data.
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [openTaskId, setOpenTaskId] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const board = state.boards[state.activeBoardId]
  const tasks = board ? board.columnIds.flatMap((id) => state.columns[id].taskIds.map((t) => state.tasks[t])) : []

  // Switching boards clears the search/filters (they belong to one board's view).
  useEffect(() => {
    setFilters(EMPTY_FILTERS)
    setOpenTaskId(null)
  }, [state.activeBoardId])

  return (
    <div className="app">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="main">
        <Toolbar
          board={board}
          tasks={tasks}
          filters={filters}
          onFiltersChange={setFilters}
          onOpenSidebar={() => setSidebarOpen(true)}
        />
        {board ? (
          <Board key={board.id} board={board} filters={filters} onOpenTask={setOpenTaskId} />
        ) : (
          <NoBoards />
        )}
      </main>
      {openTaskId && board && <CardModal taskId={openTaskId} board={board} onClose={() => setOpenTaskId(null)} />}
    </div>
  )
}
