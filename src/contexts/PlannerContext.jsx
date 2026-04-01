import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'
import API_BASE_URL from '../config'
import { YEAR_ORDER, VALID_TERMS, YEAR_GRADE_MAP, GRADE_YEAR_MAP, MAX_PERIODS } from '../utils/constants'

const PlannerContext = createContext()

export function usePlanner() {
  return useContext(PlannerContext)
}

function createEmptyPlanner() {
  return {
    Freshman: { Fall: new Array(MAX_PERIODS).fill(null), Spring: new Array(MAX_PERIODS).fill(null) },
    Sophomore: { Fall: new Array(MAX_PERIODS).fill(null), Spring: new Array(MAX_PERIODS).fill(null) },
    Junior: { Fall: new Array(MAX_PERIODS).fill(null), Spring: new Array(MAX_PERIODS).fill(null) },
    Senior: { Fall: new Array(MAX_PERIODS).fill(null), Spring: new Array(MAX_PERIODS).fill(null) },
  }
}

function toSparseArray(denseArr) {
  const sparse = new Array(MAX_PERIODS).fill(null)
  denseArr.forEach((item, i) => {
    if (i < MAX_PERIODS) sparse[i] = item || null
  })
  return sparse
}

function countSlots(arr) {
  return arr.filter(Boolean).length
}

export function PlannerProvider({ children }) {
  const { token } = useAuth()
  const { showToast } = useToast()
  const [coursePlanner, setCoursePlanner] = useState(createEmptyPlanner)
  const [activeYear, setActiveYear] = useState('Freshman')
  const [isLoading, setIsLoading] = useState(false)
  const [courseNames, setCourseNames] = useState([])
  const courseNamesRef = useRef([])

  const plannerRequest = useCallback(async (method, endpoint, body = null) => {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
    if (body) options.body = JSON.stringify(body)
    const response = await fetch(`${API_BASE_URL}/api/planner${endpoint}`, options)
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || `Planner request failed (${response.status})`)
    }
    return response.status === 204 ? null : response.json()
  }, [token])

  const fetchCourseNames = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/courses/names`)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const result = await response.json()
      if (result.success) {
        setCourseNames(result.data)
        courseNamesRef.current = result.data
        return result.data
      }
      throw new Error(result.message || 'Failed to fetch course names')
    } catch (error) {
      console.error('Error fetching course names:', error)
      return []
    }
  }, [])

  const savePlannerData = useCallback((planner) => {
    localStorage.setItem('coursePlanner', JSON.stringify(planner))
  }, [])

  const loadFromBackend = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await plannerRequest('GET', '')
      const data = (result && result.success !== undefined) ? result.data : result
      const yearMap = { freshman: 'Freshman', sophomore: 'Sophomore', junior: 'Junior', senior: 'Senior' }
      const termMap = { fall: 'Fall', spring: 'Spring' }

      const newPlanner = createEmptyPlanner()

      for (const [yearKey, yearData] of Object.entries(data)) {
        const year = yearMap[yearKey]
        if (!year) continue
        for (const [termKey, courses] of Object.entries(yearData)) {
          const term = termMap[termKey]
          if (!term) continue
          const dense = (courses || []).map(c => ({
            id: `course-${c.id}`,
            courseId: c.id,
            name: c.title || c.name,
            description: c.description || '',
            length: c.length || 'SM',
            grade: c.grade || '',
            isFullYear: false
          }))
          newPlanner[year][term] = toSparseArray(dense)
        }

        // Detect full-year courses: same courseId in both Fall and Spring
        const fallIds = new Set(newPlanner[year].Fall.filter(Boolean).map(c => c.courseId))
        const springIds = new Set(newPlanner[year].Spring.filter(Boolean).map(c => c.courseId))
        const fullYearIds = new Set([...fallIds].filter(id => springIds.has(id)))

        if (fullYearIds.size > 0) {
          newPlanner[year].Fall = newPlanner[year].Fall.map(c =>
            c && fullYearIds.has(c.courseId) ? { ...c, isFullYear: true } : c
          )
          newPlanner[year].Spring = newPlanner[year].Spring.map(c =>
            c && fullYearIds.has(c.courseId) ? null : c
          )
        }
      }

      setCoursePlanner(newPlanner)
      savePlannerData(newPlanner)
    } catch (err) {
      console.warn('Could not load planner from backend, using local cache:', err)
      const saved = localStorage.getItem('coursePlanner')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          // Normalize any legacy dense arrays to sparse length-8
          for (const yearData of Object.values(parsed)) {
            for (const termKey of ['Fall', 'Spring']) {
              if (yearData[termKey] && yearData[termKey].length !== MAX_PERIODS) {
                yearData[termKey] = toSparseArray(yearData[termKey].filter(Boolean))
              }
            }
          }
          setCoursePlanner(parsed)
        } catch {
          // corrupted localStorage, ignore
        }
      }
    } finally {
      setIsLoading(false)
    }
  }, [plannerRequest, savePlannerData])

  const addCourse = useCallback(async (courseName, year, term, length = 'SM', grade = '', periodIdx = null) => {
    if (!YEAR_ORDER.includes(year)) {
      return { success: false, message: `"${year}" is not a valid year. Please use Freshman, Sophomore, Junior, or Senior.` }
    }
    if (!VALID_TERMS.includes(term)) {
      return { success: false, message: `"${term}" is not a valid term. Please use Fall, Spring, or Full Year.` }
    }

    // Check for duplicates across all years/terms
    const exists = Object.values(coursePlanner).some(yearData =>
      Object.values(yearData).some(termCourses =>
        termCourses.some(c => c && c.name.toLowerCase() === courseName.toLowerCase())
      )
    )
    if (exists) {
      return { success: false, message: `"${courseName}" already exists in your course plan.` }
    }

    // Check capacity
    if (term !== 'Full Year' && countSlots(coursePlanner[year][term]) >= MAX_PERIODS) {
      return { success: false, message: `Your ${year} ${term} term is already full (${MAX_PERIODS} courses maximum).` }
    }
    if (term === 'Full Year') {
      if (countSlots(coursePlanner[year]['Fall']) >= MAX_PERIODS)
        return { success: false, message: `Your ${year} Fall term is already full (${MAX_PERIODS} courses maximum).` }
      if (countSlots(coursePlanner[year]['Spring']) >= MAX_PERIODS)
        return { success: false, message: `Your ${year} Spring term is already full (${MAX_PERIODS} courses maximum).` }
    }

    // Check grade compatibility
    if (grade) {
      const gradeNums = grade.split(',').map(g => parseInt(g.trim())).filter(g => !isNaN(g))
      const expectedGrade = YEAR_GRADE_MAP[year]
      if (gradeNums.length > 0 && !gradeNums.includes(expectedGrade)) {
        const allowedYears = gradeNums.map(g => GRADE_YEAR_MAP[g] || `Grade ${g}`).join(' or ')
        return { success: false, message: `This course is for ${allowedYears}. Please add it to the correct year.` }
      }
    }

    // Look up backend courseId by name
    const names = courseNamesRef.current.length > 0 ? courseNamesRef.current : courseNames
    const courseData = names.find(c => c.title.toLowerCase() === courseName.toLowerCase())
    const courseId = courseData?.id ?? null
    const yearLower = year.toLowerCase()

    try {
      if (courseId !== null) {
        if (term === 'Full Year') {
          await plannerRequest('POST', '/add', { courseId, year: yearLower, semester: 'fall' })
          await plannerRequest('POST', '/add', { courseId, year: yearLower, semester: 'spring' })
        } else {
          await plannerRequest('POST', '/add', { courseId, year: yearLower, semester: term.toLowerCase() })
        }
        await loadFromBackend()
      } else {
        // Fallback: local-only add when course not in backend catalogue
        const ts = Date.now()
        const placeInSparse = (arr, course, targetIdx = null) => {
          while (arr.length < MAX_PERIODS) arr.push(null)
          if (targetIdx !== null && !arr[targetIdx]) {
            arr[targetIdx] = course
          } else {
            const slot = arr.findIndex(s => !s)
            if (slot !== -1) arr[slot] = course
          }
        }

        setCoursePlanner(prev => {
          const next = JSON.parse(JSON.stringify(prev))
          if (term === 'Full Year') {
            placeInSparse(next[year]['Fall'], { id: `course-${ts}-fall`, name: courseName, description: '', length, grade, isFullYear: true }, periodIdx)
            placeInSparse(next[year]['Spring'], { id: `course-${ts}-spring`, name: courseName, description: '', length, grade, isFullYear: true }, periodIdx)
          } else {
            placeInSparse(next[year][term], { id: `course-${ts}`, name: courseName, description: '', length, grade, isFullYear: false }, periodIdx)
          }
          savePlannerData(next)
          return next
        })
      }

      const termLabel = term === 'Full Year' ? `${year} Fall and Spring` : `${year} ${term}`
      showToast(`Added ${courseName} to ${termLabel}`, 'success')
      return { success: true }
    } catch (err) {
      return { success: false, message: err.message || 'Failed to add course.' }
    }
  }, [coursePlanner, courseNames, plannerRequest, loadFromBackend, savePlannerData, showToast])

  const removeCourse = useCallback(async (courseId, year, term) => {
    const course = coursePlanner[year][term].find(c => c && c.id === courseId)
    if (!course) return

    const yearLower = year.toLowerCase()

    try {
      if (course.courseId != null) {
        if (course.isFullYear) {
          await plannerRequest('DELETE', '/remove', { courseId: course.courseId, year: yearLower, semester: 'fall' })
          await plannerRequest('DELETE', '/remove', { courseId: course.courseId, year: yearLower, semester: 'spring' })
        } else {
          await plannerRequest('DELETE', '/remove', { courseId: course.courseId, year: yearLower, semester: term.toLowerCase() })
        }
        await loadFromBackend()
      } else {
        // Local-only fallback - null the slot to preserve sparse positions
        setCoursePlanner(prev => {
          const next = JSON.parse(JSON.stringify(prev))
          if (course.isFullYear) {
            const name = course.name
            ;['Fall', 'Spring'].forEach(t => {
              const idx = next[year][t].findIndex(c => c && c.name === name)
              if (idx !== -1) next[year][t][idx] = null
            })
          } else {
            const idx = next[year][term].findIndex(c => c && c.id === courseId)
            if (idx !== -1) next[year][term][idx] = null
          }
          savePlannerData(next)
          return next
        })
      }
      showToast(course.isFullYear ? `Removed full year course: ${course.name}` : 'Course removed', 'success')
    } catch (err) {
      showToast(err.message || 'Failed to remove course.', 'error')
    }
  }, [coursePlanner, plannerRequest, loadFromBackend, savePlannerData, showToast])

  const swapPeriodSlots = useCallback((year, fromTerm, fromIdx, toTerm, toIdx) => {
    setCoursePlanner(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      const fromArr = next[year][fromTerm]
      while (fromArr.length < MAX_PERIODS) fromArr.push(null)

      const fromCourse = fromArr[fromIdx] || null
      if (!fromCourse) return prev

      // Full-year courses live in Fall; if dropped on a Spring slot redirect to Fall
      const effectiveTgtTerm = fromCourse.isFullYear ? 'Fall' : toTerm
      const toArr = next[year][effectiveTgtTerm]
      while (toArr.length < MAX_PERIODS) toArr.push(null)

      if (fromTerm === effectiveTgtTerm && fromIdx === toIdx) return prev

      const toCourse = toArr[toIdx] || null
      fromArr[fromIdx] = toCourse
      toArr[toIdx] = fromCourse

      savePlannerData(next)
      return next
    })
  }, [savePlannerData])

  const clearPlanner = useCallback(async () => {
    const empty = createEmptyPlanner()
    setCoursePlanner(empty)
    savePlannerData(empty)
    showToast('Course plan cleared', 'success')

    try {
      await plannerRequest('DELETE', '/reset')
    } catch (err) {
      console.warn('Failed to reset planner on backend:', err)
    }
  }, [plannerRequest, savePlannerData, showToast])

  return (
    <PlannerContext.Provider value={{
      coursePlanner,
      activeYear,
      isLoading,
      courseNames,
      setActiveYear,
      addCourse,
      removeCourse,
      swapPeriodSlots,
      clearPlanner,
      loadFromBackend,
      savePlannerData,
      plannerRequest,
      fetchCourseNames,
    }}>
      {children}
    </PlannerContext.Provider>
  )
}
