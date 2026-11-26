export const PRIORITIES = [
  { value: 'high', label: 'High' },
  { value: 'med', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

/** Colored pill with a little "signal bars" glyph — 3 bars = high, 1 = low. */
export default function PriorityBadge({ priority }) {
  const level = { low: 1, med: 2, high: 3 }[priority] ?? 2
  const label = PRIORITIES.find((p) => p.value === priority)?.label ?? 'Medium'
  return (
    <span className={`priority priority--${priority}`} title={`${label} priority`}>
      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <rect key={i} x={1 + i * 4} y={8 - i * 3} width="2.4" height={3 + i * 3} rx="1" opacity={i < level ? 1 : 0.25} />
        ))}
      </svg>
      {label}
    </span>
  )
}
