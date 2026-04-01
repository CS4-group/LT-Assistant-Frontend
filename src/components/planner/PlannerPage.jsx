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
      <div className="page-bg">
        <img src={titleBg} alt="" className="bg-image" />
        <div className="bg-overlay"></div>
      </div>
      <PlannerHeader />
      <div className="planner-content">
        <div className="planner-grid">
          <YearTabs />
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
