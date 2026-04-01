import { useCallback } from 'react'

export default function EmptySlot({ year, term, periodIdx, onAdd }) {
  const handleClick = useCallback(() => {
    onAdd(year, term, periodIdx)
  }, [year, term, periodIdx, onAdd])

  return (
    <div
      className="empty-slot"
      data-term={term}
      data-period-idx={periodIdx}
      onClick={handleClick}
    >
      <button className="add-period-btn" tabIndex={-1}>+</button>
    </div>
  )
}
