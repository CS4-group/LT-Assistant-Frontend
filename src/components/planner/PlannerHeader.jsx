import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlanner } from '../../contexts/PlannerContext'

export default function PlannerHeader() {
  const navigate = useNavigate()
  const { clearPlanner } = usePlanner()

  const handleReset = useCallback(() => {
    if (window.confirm('Are you sure you want to clear your entire course plan?')) {
      clearPlanner()
    }
  }, [clearPlanner])

  return (
    <div className="planner-header">
      <div className="planner-header-top">
        <button className="btn btn-outline planner-back-btn" onClick={() => navigate('/')}>
          &larr; Back
        </button>
        <div className="planner-header-text">
          <h1>Course Planner</h1>
          <p>Plan your 4-year high school schedule</p>
        </div>
        <button className="btn btn-outline planner-reset-btn" onClick={handleReset}>
          Reset
        </button>
      </div>
    </div>
  )
}
