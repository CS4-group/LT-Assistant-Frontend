import { useState, useEffect, useCallback } from 'react'
import { useApi } from '../../hooks/useApi'
import RatingDisplay from './RatingDisplay'
import ReviewFilterSelect from './ReviewFilterSelect'
import ReviewCard from './ReviewCard'

export default function ItemDetails({
  currentTab,
  selectedItemId,
  reviewFilterRating,
  onFilterChange,
}) {
  const { get } = useApi()
  const [details, setDetails] = useState(null)
  const [reviews, setReviews] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const entityType = currentTab === 'courses' ? 'course'
    : currentTab === 'clubs' ? 'club'
    : 'teacher'

  const fetchDetails = useCallback(async () => {
    if (!selectedItemId) return
    setIsLoading(true)
    try {
      let itemData
      switch (currentTab) {
        case 'courses':
          itemData = await get(`/api/courses/${selectedItemId}`, { useCache: false })
          break
        case 'clubs': {
          const raw = await get(`/api/clubs/${selectedItemId}`, { useCache: false })
          itemData = {
            id: raw.id,
            title: raw.name || raw.title,
            description: raw.description,
            meetingDay: raw.meetingDay,
          }
          break
        }
        case 'teachers': {
          const raw = await get(`/api/teachers/${selectedItemId}`, { useCache: false })
          itemData = {
            id: raw.id,
            title: raw.name || raw.title,
            description: raw.department,
            courses: raw.courses,
          }
          break
        }
        default:
          break
      }
      setDetails(itemData)

      const reviewsData = await get(
        `/api/reviews?entityType=${entityType}&entityId=${selectedItemId}`,
        { useCache: false }
      )
      setReviews(Array.isArray(reviewsData) ? reviewsData : [])
    } catch (err) {
      console.error('Failed to fetch details:', err)
      setDetails(null)
      setReviews([])
    } finally {
      setIsLoading(false)
    }
  }, [selectedItemId, currentTab, entityType, get])

  useEffect(() => {
    fetchDetails()
  }, [fetchDetails])

  if (!selectedItemId) {
    return (
      <div className="item-details">
        <p>Select an item to view details</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="item-details">
        <p>Loading...</p>
      </div>
    )
  }

  if (!details) {
    return (
      <div className="item-details">
        <p>Could not load details</p>
      </div>
    )
  }

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
    : 0

  const filteredReviews = reviewFilterRating === 'all'
    ? reviews
    : reviews.filter(r => r.rating === Number(reviewFilterRating))

  return (
    <div className="item-details" key={selectedItemId} style={{ animation: 'detailsPopIn 0.5s var(--ease-bouncy)' }}>
      <h2>{details.title || details.name || ''}</h2>

      <RatingDisplay rating={avgRating} totalReviews={reviews.length} />

      {details.description && (
        <>
          <h3>Description</h3>
          <p>{details.description}</p>
        </>
      )}

      {currentTab === 'clubs' && details.meetingDay && (
        <>
          <h3>Meeting Day</h3>
          <p>{details.meetingDay}</p>
        </>
      )}

      {currentTab === 'teachers' && details.courses && details.courses.length > 0 && (
        <>
          <h3>Courses</h3>
          <p>{Array.isArray(details.courses) ? details.courses.join(', ') : details.courses}</p>
        </>
      )}

      <div className="reviews-section">
        <div className="reviews-header">
          <h3>Reviews ({filteredReviews.length})</h3>
          <ReviewFilterSelect value={reviewFilterRating} onChange={onFilterChange} />
        </div>

        {filteredReviews.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
            {reviews.length === 0 ? 'No reviews yet. Be the first!' : 'No reviews match this filter.'}
          </p>
        ) : (
          filteredReviews.map((review, index) => (
            <ReviewCard
              key={review.id || index}
              review={review}
              style={{ animationDelay: `${Math.min(index * 0.08, 0.8)}s` }}
            />
          ))
        )}
      </div>
    </div>
  )
}
