/** Friendly placeholder for a column with no (visible) cards. Also acts as a big drop target. */
export default function EmptyColumn({ filtered }) {
  return (
    <div className="empty-column">
      <svg width="44" height="36" viewBox="0 0 44 36" aria-hidden="true" className="empty-column__art">
        <rect x="6" y="4" width="32" height="10" rx="3" className="ec-a" />
        <rect x="2" y="13" width="40" height="12" rx="3.5" className="ec-b" />
        <rect x="8" y="17.5" width="16" height="3" rx="1.5" className="ec-c" />
        <rect x="6" y="28" width="32" height="5" rx="2.5" className="ec-a" />
      </svg>
      <p className="empty-column__title">{filtered ? 'No matching cards' : 'No cards yet'}</p>
      <p className="empty-column__hint">{filtered ? 'Try a different search or filter.' : 'Drop a card here or add a new one.'}</p>
    </div>
  )
}
