import { createId } from '../utils/id.js'
import { createDemoState } from './demoData.js'

/*
 * ─────────────────────────────────────────────────────────────
 *  Flowboard state
 * ─────────────────────────────────────────────────────────────
 * The state is *normalized*: boards, columns and tasks each live in their
 * own lookup object keyed by id, and parents only store ordered id arrays.
 *
 *   {
 *     boards:  { [boardId]:  { id, name, color, columnIds: [] } },
 *     columns: { [columnId]: { id, title, taskIds: [] } },
 *     tasks:   { [taskId]:   { id, title, description, priority,
 *                              dueDate, labels: [], checklist: [] } },
 *     boardOrder: [boardId, ...],   // order in the sidebar
 *     activeBoardId: boardId,
 *   }
 *
 * Why normalized? Moving a card is just "remove an id from one array and
 * insert it into another" — the task object itself is never copied or
 * nested, and updating a task never touches its column or board.
 *
 * The reducer is a *pure function*: (state, action) => newState.
 * It never mutates `state`; every case returns new objects for whatever
 * changed (React relies on new references to know what to re-render).
 */

export const ACTIONS = {
  BOARD_ADD: 'board/add',
  BOARD_RENAME: 'board/rename',
  BOARD_DELETE: 'board/delete',
  BOARD_SELECT: 'board/select',
  COLUMN_ADD: 'column/add',
  COLUMN_RENAME: 'column/rename',
  COLUMN_DELETE: 'column/delete',
  COLUMN_MOVE: 'column/move',
  TASK_ADD: 'task/add',
  TASK_UPDATE: 'task/update',
  TASK_DELETE: 'task/delete',
  TASK_MOVE: 'task/move',
  RESET_DEMO: 'app/resetDemo',
}

const BOARD_COLORS = ['teal', 'violet', 'blue', 'orange', 'pink', 'green']

/** Returns a copy of `list` with the item at `from` moved to index `to`. */
function moveItem(list, from, to) {
  const copy = [...list]
  const [item] = copy.splice(from, 1)
  copy.splice(to, 0, item)
  return copy
}

/** Returns a copy of `obj` without the given keys. */
function omit(obj, keys) {
  const copy = { ...obj }
  keys.forEach((key) => delete copy[key])
  return copy
}

/** Finds which column currently holds a task (a task lives in exactly one column). */
export function findColumnIdOfTask(state, taskId) {
  return Object.keys(state.columns).find((id) => state.columns[id].taskIds.includes(taskId))
}

export function boardReducer(state, action) {
  switch (action.type) {
    // ── Boards ────────────────────────────────────────────────
    case ACTIONS.BOARD_ADD: {
      const id = createId('board')
      // A new board starts with three sensible columns so it's usable immediately.
      const starterColumns = ['To do', 'In progress', 'Done'].map((title) => ({
        id: createId('col'),
        title,
        taskIds: [],
      }))
      const color = BOARD_COLORS[state.boardOrder.length % BOARD_COLORS.length]
      return {
        ...state,
        boards: {
          ...state.boards,
          [id]: { id, name: action.name || 'Untitled board', color, columnIds: starterColumns.map((c) => c.id) },
        },
        columns: { ...state.columns, ...Object.fromEntries(starterColumns.map((c) => [c.id, c])) },
        boardOrder: [...state.boardOrder, id],
        activeBoardId: id,
      }
    }

    case ACTIONS.BOARD_RENAME: {
      const board = state.boards[action.boardId]
      return { ...state, boards: { ...state.boards, [board.id]: { ...board, name: action.name } } }
    }

    case ACTIONS.BOARD_DELETE: {
      const board = state.boards[action.boardId]
      // Deleting a board must also delete its columns and their tasks,
      // otherwise they'd stay in storage forever as orphans.
      const taskIds = board.columnIds.flatMap((colId) => state.columns[colId].taskIds)
      const boardOrder = state.boardOrder.filter((id) => id !== board.id)
      return {
        ...state,
        boards: omit(state.boards, [board.id]),
        columns: omit(state.columns, board.columnIds),
        tasks: omit(state.tasks, taskIds),
        boardOrder,
        // If we deleted the open board, fall back to the first remaining one (or none).
        activeBoardId: state.activeBoardId === board.id ? boardOrder[0] ?? null : state.activeBoardId,
      }
    }

    case ACTIONS.BOARD_SELECT:
      return { ...state, activeBoardId: action.boardId }

    // ── Columns ───────────────────────────────────────────────
    case ACTIONS.COLUMN_ADD: {
      const board = state.boards[action.boardId]
      const column = { id: createId('col'), title: action.title || 'New column', taskIds: [] }
      return {
        ...state,
        columns: { ...state.columns, [column.id]: column },
        boards: { ...state.boards, [board.id]: { ...board, columnIds: [...board.columnIds, column.id] } },
      }
    }

    case ACTIONS.COLUMN_RENAME: {
      const column = state.columns[action.columnId]
      return { ...state, columns: { ...state.columns, [column.id]: { ...column, title: action.title } } }
    }

    case ACTIONS.COLUMN_DELETE: {
      const column = state.columns[action.columnId]
      const board = state.boards[action.boardId]
      return {
        ...state,
        columns: omit(state.columns, [column.id]),
        tasks: omit(state.tasks, column.taskIds), // its cards go with it
        boards: {
          ...state.boards,
          [board.id]: { ...board, columnIds: board.columnIds.filter((id) => id !== column.id) },
        },
      }
    }

    case ACTIONS.COLUMN_MOVE: {
      // Reorder columns inside a board (used by drag & drop and the column menu).
      const board = state.boards[action.boardId]
      const from = board.columnIds.indexOf(action.columnId)
      const to = Math.max(0, Math.min(action.toIndex, board.columnIds.length - 1))
      if (from === -1 || from === to) return state
      return {
        ...state,
        boards: { ...state.boards, [board.id]: { ...board, columnIds: moveItem(board.columnIds, from, to) } },
      }
    }

    // ── Tasks ─────────────────────────────────────────────────
    case ACTIONS.TASK_ADD: {
      const column = state.columns[action.columnId]
      const task = {
        id: createId('task'),
        title: action.title,
        description: '',
        priority: 'med',
        dueDate: null,
        labels: [],
        checklist: [],
        createdAt: Date.now(),
      }
      return {
        ...state,
        tasks: { ...state.tasks, [task.id]: task },
        columns: { ...state.columns, [column.id]: { ...column, taskIds: [...column.taskIds, task.id] } },
      }
    }

    case ACTIONS.TASK_UPDATE: {
      // `changes` is a partial task, e.g. { priority: 'high' } — merged over the old values.
      const task = state.tasks[action.taskId]
      if (!task) return state
      return { ...state, tasks: { ...state.tasks, [task.id]: { ...task, ...action.changes } } }
    }

    case ACTIONS.TASK_DELETE: {
      const columnId = findColumnIdOfTask(state, action.taskId)
      const column = state.columns[columnId]
      return {
        ...state,
        tasks: omit(state.tasks, [action.taskId]),
        columns: {
          ...state.columns,
          [columnId]: { ...column, taskIds: column.taskIds.filter((id) => id !== action.taskId) },
        },
      }
    }

    case ACTIONS.TASK_MOVE: {
      /*
       * Moves a task to `toColumnId` at position `toIndex`
       * (index in the *target* column; omitted = append to the end).
       * Works for both "reorder inside a column" and "move to another column":
       * we remove the id from its source array, then insert it into the target.
       */
      const { taskId, toColumnId } = action
      const fromColumnId = findColumnIdOfTask(state, taskId)
      if (!fromColumnId || !state.columns[toColumnId]) return state

      const fromIds = state.columns[fromColumnId].taskIds.filter((id) => id !== taskId)
      const toIds = fromColumnId === toColumnId ? fromIds : [...state.columns[toColumnId].taskIds]
      const toIndex = action.toIndex ?? toIds.length
      toIds.splice(Math.max(0, Math.min(toIndex, toIds.length)), 0, taskId)

      return {
        ...state,
        columns: {
          ...state.columns,
          [fromColumnId]: { ...state.columns[fromColumnId], taskIds: fromIds },
          [toColumnId]: { ...state.columns[toColumnId], taskIds: toIds },
        },
      }
    }

    // ── App ───────────────────────────────────────────────────
    case ACTIONS.RESET_DEMO:
      return createDemoState()

    default:
      // Throwing on unknown actions catches typos in action names early.
      throw new Error(`Unknown action: ${action.type}`)
  }
}
