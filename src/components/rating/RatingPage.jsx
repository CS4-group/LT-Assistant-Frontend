import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { useAuth } from '../../contexts/AuthContext'
import TabBar from './TabBar'
import Sidebar from './Sidebar'
import ItemDetails from './ItemDetails'
import AddReviewModal from './AddReviewModal'
import titleBg from '../../assets/title-bg.jpg'

export default function RatingPage() {
  const navigate = useNavigate()
  const { get, invalidateCache } = useApi()
  const { isAuthenticated } = useAuth()

  const [currentTab, setCurrentTab] = useState('courses')
  const [selectedItemId, setSelectedItemId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [reviewFilterRating, setReviewFilterRating] = useState('all')
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)

  const fetchItems = useCallback(async (tab) => {
    setIsLoading(true)
    try {
      switch (tab) {
        case 'courses': {
          const data = await get('/api/courses/names')
          const mapped = Array.isArray(data)
            ? data.map(c => ({ id: c.id, title: c.title || c.name }))
            : []
          setItems(mapped)
          break
        }
        case 'clubs': {
          const data = await get('/api/clubs')
          const mapped = Array.isArray(data)
            ? data.map(c => ({
                id: c.id,
                title: c.name || c.title,
                description: c.description,
                meetingDay: c.meetingDay,
                rating: c.rating,
              }))
            : []
          setItems(mapped)
          break
        }
        case 'teachers': {
          const data = await get('/api/teachers')
          const mapped = Array.isArray(data)
            ? data.map(t => ({
                id: t.id,
                title: t.name || t.title,
                description: t.department,
                courses: t.courses,
                rating: t.rating,
              }))
            : []
          setItems(mapped)
          break
        }
        default:
          setItems([])
      }
    } catch (err) {
      console.error(`Failed to fetch ${tab}:`, err)
      setItems([])
    } finally {
      setIsLoading(false)
    }
  }, [get])

  useEffect(() => {
    setSelectedItemId(null)
    setSearchQuery('')
    setReviewFilterRating('all')
    fetchItems(currentTab)
  }, [currentTab, fetchItems])

  const handleTabChange = (tab) => {
    setCurrentTab(tab)
  }

  const handleReviewSubmitted = () => {
    invalidateCache('/api/reviews')
    // Re-fetch to refresh item details and reviews
    fetchItems(currentTab)
  }

  return (
    <div className="rating-page">
      <div className="page-bg">
        <img className="bg-image" src={titleBg} alt="" />
        <div className="bg-overlay" />
      </div>

      <div className="rating-top-bar">
        <div className="rating-top-row">
          <div className="header-left">
            <h1>Ratings & Reviews</h1>
          </div>
          <div className="header-right">
            <button className="btn btn-outline" onClick={() => navigate('/')}>
              Back
            </button>
          </div>
        </div>
        <div className="rating-controls-row">
          <TabBar currentTab={currentTab} onTabChange={handleTabChange} />
          <div className="search-container">
            <input
              className="form-input"
              type="text"
              placeholder={`Search ${currentTab}...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="rating-content">
        <Sidebar
          currentTab={currentTab}
          items={items}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedItemId={selectedItemId}
          onSelectItem={setSelectedItemId}
        />
        <div className="main-content">
          <ItemDetails
            currentTab={currentTab}
            selectedItemId={selectedItemId}
            reviewFilterRating={reviewFilterRating}
            onFilterChange={setReviewFilterRating}
          />
        </div>
      </div>

      {isAuthenticated && (
        <button
          className="floating-add-review-btn"
          onClick={() => setShowReviewModal(true)}
          disabled={!selectedItemId}
        >
          + Add Review
        </button>
      )}

      {showReviewModal && (
        <AddReviewModal
          currentTab={currentTab}
          items={items}
          selectedItemId={selectedItemId}
          onClose={() => setShowReviewModal(false)}
          onSubmitted={handleReviewSubmitted}
        />
      )}
    </div>
  )
}
