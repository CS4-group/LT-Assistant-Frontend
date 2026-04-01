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
      <div className="header-left">
        <div>
          <h1>Course Planner</h1>
          <p>Plan your 4-year high school journey</p>
        </div>
      </div>
      <div className="header-right">
        <button className="btn btn-outline" onClick={() => navigate('/')}>Back</button>
        <button className="btn btn-outline" onClick={handleReset}>Reset Plan</button>
      </div>
    </div>
  )
}
