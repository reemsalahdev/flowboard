import { useEffect, useRef } from 'react'
import { useTheme } from '../hooks/useTheme.js'
import { dueStatus } from '../utils/dates.js'
import { EMPTY_FILTERS, hasActiveFilters } from '../utils/filters.js'
import FilterMenu from './FilterMenu.jsx'
import { MenuIcon, MoonIcon, SearchIcon, SunIcon, XIcon } from './Icons.jsx'

/** Top bar: board title + quick stats, search, filters and the theme toggle. */
export default function Toolbar({ board, tasks, filters, onFiltersChange, onOpenSidebar }) {
  const { theme, toggleTheme } = useTheme()
  const searchRef = useRef(null)

  // Press "/" anywhere (outside inputs) to jump to search — a common power-user shortcut.
  useEffect(() => {
    function handleKey(event) {
      const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)
      if (event.key === '/' && !typing && !document.querySelector('[role="dialog"]')) {
        event.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const overdue = tasks.filter((t) => dueStatus(t.dueDate) === 'overdue').length
  const doneChecks = tasks.reduce((n, t) => n + t.checklist.filter((c) => c.done).length, 0)
  const allChecks = tasks.reduce((n, t) => n + t.checklist.length, 0)

  return (
    <header className="toolbar">
      <div className="toolbar__title-row">
        <button type="button" className="icon-btn toolbar__menu" onClick={onOpenSidebar} aria-label="Open boards">
          <MenuIcon />
        </button>
        <div className="toolbar__heading">
          <h1 className="toolbar__title">{board?.name ?? 'No board'}</h1>
          {board && (
            <p className="toolbar__stats">
              <span>{tasks.length} cards</span>
              {overdue > 0 && <span className="toolbar__stat--overdue">{overdue} overdue</span>}
              {allChecks > 0 && <span>{Math.round((doneChecks / allChecks) * 100)}% subtasks done</span>}
            </p>
          )}
        </div>
        <button
          type="button"
          className="icon-btn theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          title="Toggle theme"
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>

      {board && (
        <div className="toolbar__controls">
          <label className="search">
            <SearchIcon size={15} />
            <input
              ref={searchRef}
              type="search"
              placeholder="Search cards…"
              value={filters.query}
              onChange={(e) => onFiltersChange({ ...filters, query: e.target.value })}
              onKeyDown={(e) => e.key === 'Escape' && onFiltersChange({ ...filters, query: '' })}
              aria-label="Search cards"
            />
            <kbd className="search__kbd">/</kbd>
          </label>
          <FilterMenu tasks={tasks} filters={filters} onChange={onFiltersChange} />
          {hasActiveFilters(filters) && (
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => onFiltersChange(EMPTY_FILTERS)}>
              <XIcon size={13} /> Clear
            </button>
          )}
        </div>
      )}
    </header>
  )
}
