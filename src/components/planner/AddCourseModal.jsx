import { useState, useCallback, useEffect } from 'react'
import Modal from '../ui/Modal'
import SearchableDropdown from '../ui/SearchableDropdown'
import { usePlanner } from '../../contexts/PlannerContext'
import { useToast } from '../../contexts/ToastContext'
import { YEAR_GRADE_MAP, GRADE_YEAR_MAP } from '../../utils/constants'
import API_BASE_URL from '../../config'

export default function AddCourseModal({ year, defaultTerm = 'Fall', periodIdx = null, onClose, onAdd }) {
  const { courseNames, fetchCourseNames } = usePlanner()
  const { showToast } = useToast()
  const [term, setTerm] = useState(defaultTerm)
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [courseInfo, setCourseInfo] = useState(null)
  const [courseDescription, setCourseDescription] = useState('')
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)

  useEffect(() => {
    if (!courseNames || courseNames.length === 0) {
      fetchCourseNames()
    }
  }, [courseNames, fetchCourseNames])

  const courseItems = (courseNames || []).map(c => ({
    value: String(c.id),
    label: c.title,
  }))

  const handleCourseSelect = useCallback(async (value) => {
    setSelectedCourseId(value)
    if (!value) {
      setCourseInfo(null)
      setCourseDescription('')
      return
    }

    setIsLoadingDetails(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/courses/${value}`, { credentials: 'include' })
      if (!response.ok) throw new Error('Failed to fetch')
      const result = await response.json()
      const details = result.success ? result.data : result

      if (details) {
        const length = details.length || 'SM'
        const grade = details.grade || ''
        setCourseInfo({ length, grade })
        setCourseDescription(details.description || '')

        // Auto-select Full Year for YR courses
        if (length === 'YR') {
          setTerm('Full Year')
        } else if (length === 'SM' && term === 'Full Year') {
          setTerm('Fall')
        }
      }
    } catch {
      setCourseInfo(null)
      setCourseDescription('Failed to load description')
    } finally {
      setIsLoadingDetails(false)
    }
  }, [term])

  const handleAdd = useCallback(async () => {
    if (!selectedCourseId) {
      showToast('Please select a course', 'error')
      return
    }

    // Validate course length against selected term
    if (courseInfo) {
      if (courseInfo.length === 'YR' && (term === 'Fall' || term === 'Spring')) {
        showToast('This is a full year course and cannot be added to a single semester. Please select "Full Year".', 'error')
        return
      }
      if (courseInfo.length === 'SM' && term === 'Full Year') {
        showToast('This is a semester course and cannot be added as a full year course. Please select Fall or Spring.', 'error')
        return
      }

      // Validate grade level against year
      if (courseInfo.grade) {
        const gradeNums = courseInfo.grade.split(',').map(g => parseInt(g.trim())).filter(g => !isNaN(g))
        const expectedGrade = YEAR_GRADE_MAP[year]
        if (gradeNums.length > 0 && !gradeNums.includes(expectedGrade)) {
          const allowedYears = gradeNums.map(g => GRADE_YEAR_MAP[g] || `Grade ${g}`).join(' or ')
          showToast(`This course is for ${allowedYears}. Please add it to the correct year.`, 'error')
          return
        }
      }
    }

    const selectedCourse = courseNames.find(c => String(c.id) === String(selectedCourseId))
    if (!selectedCourse) {
      showToast('Course not found. Please try again.', 'error')
      return
    }

    const result = await onAdd(
      selectedCourse.title,
      year,
      term,
      courseInfo?.length || 'SM',
      courseInfo?.grade || '',
      periodIdx
    )
    if (result.success) {
      onClose()
    } else {
      showToast(result.message, 'error')
    }
  }, [selectedCourseId, courseInfo, term, year, periodIdx, courseNames, onAdd, onClose, showToast])

  const lengthText = courseInfo?.length === 'YR' ? 'Full Year' : courseInfo?.length === 'SM' ? 'Semester' : ''
  const gradeText = courseInfo?.grade ? `Grade: ${courseInfo.grade}` : ''

  return (
    <Modal onClose={onClose}>
      {(handleClose) => (
        <>
          <div className="modal-header">
            <h2>Add Course to {year} Year</h2>
            <button className="modal-close" onClick={handleClose}>&times;</button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Select Term</label>
              <select
                className="form-input"
                value={term}
                onChange={e => setTerm(e.target.value)}
              >
                <option value="Fall">Fall</option>
                <option value="Spring">Spring</option>
                <option value="Full Year">Full Year</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Select Course</label>
              <SearchableDropdown
                items={courseItems}
                placeholder="Search for a course..."
                value={selectedCourseId}
                onChange={handleCourseSelect}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Course Information</label>
              <div className="course-description-box">
                {isLoadingDetails ? (
                  <p className="text-muted">Loading...</p>
                ) : courseInfo ? (
                  <p>
                    <strong>{lengthText}</strong>
                    {gradeText && <>{' | '}<strong>{gradeText}</strong></>}
                  </p>
                ) : (
                  <p className="text-muted">Select a course to view its information</p>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Course Description</label>
              <div className="course-description-box">
                {isLoadingDetails ? (
                  <p className="text-muted">Loading...</p>
                ) : courseDescription ? (
                  <p>{courseDescription}</p>
                ) : (
                  <p className="text-muted">Select a course to view its description</p>
                )}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-outline" onClick={handleClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAdd}>Add Course</button>
          </div>
        </>
      )}
    </Modal>
  )
}
