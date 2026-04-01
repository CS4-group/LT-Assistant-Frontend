import { useCallback } from 'react'

export default function CourseCard({ course, year, term, periodIdx, onRemove, className = '' }) {
  const handleRemove = useCallback((e) => {
    e.stopPropagation()
    onRemove(course.id, year, term)
  }, [course.id, year, term, onRemove])

  return (
    <div
      className={`course-card ${className}`}
      draggable="true"
      data-course-id={course.id}
      data-year={year}
      data-term={term}
      data-period-idx={periodIdx}
    >
      <span className="course-card-name">{course.name}</span>
      <button className="remove-course" onClick={handleRemove}>&times;</button>
    </div>
  )
}
