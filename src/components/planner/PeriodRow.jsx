import CourseCard from './CourseCard'
import EmptySlot from './EmptySlot'

export default function PeriodRow({ period, fallCourse, springCourse, year, periodIndex, onAddCourse, onRemoveCourse }) {
  const isFullYear = fallCourse && fallCourse.isFullYear

  // Full-year course - one wide card
  if (isFullYear) {
    return (
      <div className="period-row">
        <span className="period-number">{period}</span>
        <div className="period-courses">
          <CourseCard
            course={fallCourse}
            year={year}
            term="Fall"
            periodIdx={periodIndex}
            onRemove={onRemoveCourse}
            className="full-year"
          />
        </div>
      </div>
    )
  }

  // Both semester courses present - split 50/50
  if (fallCourse && springCourse) {
    return (
      <div className="period-row">
        <span className="period-number">{period}</span>
        <div className="period-courses">
          <CourseCard
            course={fallCourse}
            year={year}
            term="Fall"
            periodIdx={periodIndex}
            onRemove={onRemoveCourse}
            className="semester fall-card"
          />
          <CourseCard
            course={springCourse}
            year={year}
            term="Spring"
            periodIdx={periodIndex}
            onRemove={onRemoveCourse}
            className="semester spring-card"
          />
        </div>
      </div>
    )
  }

  // Only one semester course - show full width
  if (fallCourse || springCourse) {
    const course = fallCourse || springCourse
    const term = fallCourse ? 'Fall' : 'Spring'
    const cls = fallCourse ? 'fall-card' : 'spring-card'

    return (
      <div className="period-row">
        <span className="period-number">{period}</span>
        <div className="period-courses">
          <CourseCard
            course={course}
            year={year}
            term={term}
            periodIdx={periodIndex}
            onRemove={onRemoveCourse}
            className={cls}
          />
        </div>
      </div>
    )
  }

  // Empty period - single full-width slot with + button
  return (
    <div className="period-row">
      <span className="period-number">{period}</span>
      <div className="period-courses">
        <EmptySlot
          year={year}
          term="Fall"
          periodIdx={periodIndex}
          onAdd={onAddCourse}
        />
      </div>
    </div>
  )
}
