export default function Logo() {
  return (
    <div className="logo">
      <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="8" className="logo__bg" />
        <rect x="7" y="8" width="5" height="16" rx="2" fill="#fff" />
        <rect x="13.5" y="8" width="5" height="11" rx="2" fill="#fff" opacity=".8" />
        <rect x="20" y="8" width="5" height="7" rx="2" fill="#fff" opacity=".6" />
      </svg>
      <span className="logo__text">Flowboard</span>
    </div>
  )
}
