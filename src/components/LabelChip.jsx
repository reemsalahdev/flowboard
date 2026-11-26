import { labelColor } from '../utils/labels.js'
import { XIcon } from './Icons.jsx'

export default function LabelChip({ label, onRemove }) {
  return (
    <span className={`label label--${labelColor(label)}`}>
      {label}
      {onRemove && (
        <button type="button" className="label__remove" onClick={onRemove} aria-label={`Remove label ${label}`}>
          <XIcon size={11} />
        </button>
      )}
    </span>
  )
}
