import { useRef, useEffect, useState, useCallback } from 'react'
import { usePlanner } from '../../contexts/PlannerContext'
import { useDragAndDrop } from '../../hooks/useDragAndDrop'
import { MAX_PERIODS } from '../../utils/constants'
import PeriodRow from './PeriodRow'
import AddCourseModal from './AddCourseModal'

export default function YearContent() {
  const { coursePlanner, activeYear, swapPeriodSlots, addCourse, removeCourse } = usePlanner()
  const containerRef = useRef(null)
  const [animation, setAnimation] = useState(null)
  const [modalData, setModalData] = useState(null)

  const handleSwap = useCallback((srcTerm, srcIdx, tgtTerm, tgtIdx) => {
    swapPeriodSlots(activeYear, srcTerm, srcIdx, tgtTerm, tgtIdx)
  }, [activeYear, swapPeriodSlots])

  useDragAndDrop(containerRef, handleSwap)

  useEffect(() => {
    const handleTabChange = (e) => {
      const { direction } = e.detail
      const container = containerRef.current
      if (!container) return

      // Lock height during transition
      const currentHeight = container.offsetHeight
      container.style.height = `${currentHeight}px`
      container.style.overflow = 'hidden'

      // Slide out
      const outAnim = direction === 'right'
        ? 'scheduleSlideOutLeft 0.2s cubic-bezier(0.32, 0, 0.67, 0) both'
        : 'scheduleSlideOutRight 0.2s cubic-bezier(0.32, 0, 0.67, 0) both'

      container.style.animation = 'none'
      // eslint-disable-next-line no-unused-expressions
      container.offsetHeight // force reflow
      container.style.animation = outAnim

      // After slide out, trigger slide in
      setTimeout(() => {
        container.style.height = ''
        container.style.overflow = ''
        setAnimation(direction)
      }, 200)
    }

    window.addEventListener('planner-tab-change', handleTabChange)
    return () => window.removeEventListener('planner-tab-change', handleTabChange)
  }, [])

  useEffect(() => {
    if (!animation) return
    const container = containerRef.current
    if (!container) return

    const inAnim = animation === 'right'
      ? 'scheduleSlideInRight 0.25s cubic-bezier(0.33, 1, 0.68, 1) both'
      : 'scheduleSlideInLeft 0.25s cubic-bezier(0.33, 1, 0.68, 1) both'

    container.style.animation = 'none'
    // eslint-disable-next-line no-unused-expressions
    container.offsetHeight // force reflow
    container.style.animation = inAnim
    setAnimation(null)
  }, [animation, activeYear])

  const handleAddCourse = useCallback((year, term, periodIdx) => {
    setModalData({ year, term, periodIdx })
  }, [])

  const handleRemoveCourse = useCallback((courseId, year, term) => {
    removeCourse(courseId, year, term)
  }, [removeCourse])

  const yearData = coursePlanner[activeYear] || { Fall: [], Spring: [] }
  const fallCourses = yearData.Fall || []
  const springCourses = yearData.Spring || []

  return (
    <>
      <div ref={containerRef} id="planner-year-content" className="planner-year-content">
        {Array.from({ length: MAX_PERIODS }, (_, i) => (
          <PeriodRow
            key={i}
            period={i + 1}
            fallCourse={fallCourses[i] || null}
            springCourse={springCourses[i] || null}
            year={activeYear}
            periodIndex={i}
            onAddCourse={handleAddCourse}
            onRemoveCourse={handleRemoveCourse}
          />
        ))}
      </div>
      {modalData && (
        <AddCourseModal
          year={modalData.year}
          defaultTerm={modalData.term}
          periodIdx={modalData.periodIdx}
          onClose={() => setModalData(null)}
          onAdd={addCourse}
        />
      )}
    </>
  )
}
