import { useCallback, useRef } from 'react'
import { usePlanner } from '../../contexts/PlannerContext'
import { YEAR_ORDER, YEAR_GRADE_MAP } from '../../utils/constants'

export default function YearTabs() {
  const { activeYear, setActiveYear } = usePlanner()
  const isAnimatingRef = useRef(false)

  const handleTabClick = useCallback((newYear) => {
    if (isAnimatingRef.current || newYear === activeYear) return

    const oldIndex = YEAR_ORDER.indexOf(activeYear)
    const newIndex = YEAR_ORDER.indexOf(newYear)
    const direction = newIndex > oldIndex ? 'right' : 'left'

    // Dispatch a custom event so YearContent can animate
    window.dispatchEvent(new CustomEvent('planner-tab-change', {
      detail: { direction, newYear }
    }))

    isAnimatingRef.current = true
    setTimeout(() => {
      setActiveYear(newYear)
      isAnimatingRef.current = false
    }, 200)
  }, [activeYear, setActiveYear])

  return (
    <div className="planner-tabs">
      {YEAR_ORDER.map(year => (
        <button
          key={year}
          className={`planner-tab ${activeYear === year ? 'active' : ''}`}
          data-year={year}
          onClick={() => handleTabClick(year)}
        >
          {YEAR_GRADE_MAP[year]}th
        </button>
      ))}
    </div>
  )
}
