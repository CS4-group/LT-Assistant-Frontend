import { useEffect } from 'react'
import { PlannerProvider, usePlanner } from '../../contexts/PlannerContext'
import PlannerHeader from './PlannerHeader'
import YearTabs from './YearTabs'
import YearContent from './YearContent'
import ChatbotSection from './ChatbotSection'
import titleBg from '../../assets/title-bg.jpg'

function PlannerPageInner() {
  const { loadFromBackend, fetchCourseNames } = usePlanner()

  useEffect(() => {
    loadFromBackend()
    fetchCourseNames()
  }, [loadFromBackend, fetchCourseNames])

  return (
    <div className="planner-page">
      <div className="page-bg" style={{ backgroundImage: `url(${titleBg})` }} />
      <PlannerHeader />
      <YearTabs />
      <div className="planner-content">
        <div className="planner-grid">
          <YearContent />
        </div>
        <ChatbotSection />
      </div>
    </div>
  )
}

export default function PlannerPage() {
  return (
    <PlannerProvider>
      <PlannerPageInner />
    </PlannerProvider>
  )
}
