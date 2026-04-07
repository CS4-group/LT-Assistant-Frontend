import { useState, useEffect, useCallback, useRef } from 'react'
import { useApi, getApiCacheSync } from '../../hooks/useApi'
import { buildDetailsUrl, buildReviewsUrl } from '../../utils/ratingPrefetch'
import RatingDisplay from './RatingDisplay'
import ReviewFilterSelect from './ReviewFilterSelect'
import ReviewCard from './ReviewCard'

function transformDetail(tab, raw) {
  if (tab === 'clubs') {
    return { id: raw.id, title: raw.name || raw.title, description: raw.description, meetingDay: raw.meetingDay }
  }
  if (tab === 'teachers') {
    return { id: raw.id, title: raw.name || raw.title, description: raw.department, courses: raw.courses }
  }
  return raw
}

export default function ItemDetails({
  currentTab,
  selectedItemId,
  reviewFilterRating,
  onFilterChange,
}) {
  const { get } = useApi()
  const [details, setDetails] = useState(null)
  const [reviews, setReviews] = useState([])
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [isLoadingReviews, setIsLoadingReviews] = useState(false)

  // Track the active item to discard stale responses from previous selections
  const activeItemRef = useRef(selectedItemId)

  const fetchDetails = useCallback(async () => {
    if (!selectedItemId) return

    activeItemRef.current = selectedItemId
    const itemId = selectedItemId

    const detailsUrl = buildDetailsUrl(currentTab, itemId)
    const reviewsUrl = buildReviewsUrl(currentTab, itemId)

    // Check synchronous cache before setting loading states
    const cachedDetails = getApiCacheSync(detailsUrl)
    const cachedReviews = getApiCacheSync(reviewsUrl)

    if (cachedDetails) {
      setDetails(transformDetail(currentTab, cachedDetails))
      setIsLoadingDetails(false)
    } else {
      setIsLoadingDetails(true)
    }

    if (cachedReviews) {
      setReviews(Array.isArray(cachedReviews) ? cachedReviews : [])
      setIsLoadingReviews(false)
    } else {
      setIsLoadingReviews(true)
    }

    // Background refresh if cached, initial fetch if not
    // useCache: false when cached (force network refresh), true when not (enables dedup with prefetch)
    get(detailsUrl, { useCache: !cachedDetails }).then(raw => {
      if (activeItemRef.current !== itemId) return
      setDetails(transformDetail(currentTab, raw))
      setIsLoadingDetails(false)
    }).catch(err => {
      if (activeItemRef.current !== itemId) return
      console.error('Failed to fetch details:', err)
      if (!cachedDetails) {
        setDetails(null)
        setIsLoadingDetails(false)
      }
    })

    get(reviewsUrl, { useCache: !cachedReviews }).then(data => {
      if (activeItemRef.current !== itemId) return
      setReviews(Array.isArray(data) ? data : [])
      setIsLoadingReviews(false)
    }).catch(err => {
      if (activeItemRef.current !== itemId) return
      console.error('Failed to fetch reviews:', err)
      if (!cachedReviews) {
        setReviews([])
        setIsLoadingReviews(false)
      }
    })
  }, [selectedItemId, currentTab, get])

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

  if (isLoadingDetails) {
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

        {isLoadingReviews ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>Loading reviews...</p>
        ) : filteredReviews.length === 0 ? (
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
