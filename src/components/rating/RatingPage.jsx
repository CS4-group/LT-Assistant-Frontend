import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi, getApiCacheSync, setApiCache } from '../../hooks/useApi'
import { useAuth } from '../../contexts/AuthContext'
import { prefetchFirstItem, DETAILS_PREFIX } from '../../utils/ratingPrefetch'
import TabBar from './TabBar'
import Sidebar from './Sidebar'
import ItemDetails from './ItemDetails'
import AddReviewModal from './AddReviewModal'
import titleBg from '../../assets/title-bg.jpg'

const URL_MAP = {
  courses: '/api/courses/names',
  clubs: '/api/clubs',
  teachers: '/api/teachers',
}

function mapItems(tab, data) {
  if (!Array.isArray(data)) return []
  switch (tab) {
    case 'courses':
      return data.map(c => ({ id: c.id, title: c.title || c.name }))
    case 'clubs':
      return data.map(c => ({
        id: c.id,
        title: c.name || c.title,
        description: c.description,
        meetingDay: c.meetingDay,
        rating: c.rating,
      }))
    case 'teachers':
      return data.map(t => ({
        id: t.id,
        title: t.name || t.title,
        description: t.department,
        courses: t.courses,
        rating: t.rating,
      }))
    default:
      return []
  }
}

export default function RatingPage() {
  const navigate = useNavigate()
  const { get, invalidateCache } = useApi()
  const { isAuthenticated } = useAuth()

  const [currentTab, setCurrentTab] = useState('courses')
  const [selectedItemId, setSelectedItemId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [reviewFilterRating, setReviewFilterRating] = useState('all')

  // Initialize synchronously from cache so items render on first paint if cached
  const [items, setItems] = useState(() => {
    const cached = getApiCacheSync(URL_MAP.courses)
    return cached ? mapItems('courses', cached) : []
  })
  const [isLoading, setIsLoading] = useState(() => !getApiCacheSync(URL_MAP.courses))

  const [showReviewModal, setShowReviewModal] = useState(false)

  // Always reflects the latest active tab — used to discard stale async setItems calls
  const activeTabRef = useRef(currentTab)

  const fetchItems = useCallback(async (tab) => {
    activeTabRef.current = tab
    const url = URL_MAP[tab]
    const cached = getApiCacheSync(url)

    if (cached) {
      // Instant render from cache, then background refresh
      setItems(mapItems(tab, cached))
      setIsLoading(false)
      prefetchFirstItem(tab, cached, get)
      get(url, { useCache: false }).then(fresh => {
        if (activeTabRef.current !== tab) return  // tab changed while refreshing
        setApiCache(url, fresh)
        setItems(mapItems(tab, fresh))
      }).catch(() => {})
      return
    }

    // No cache: fire ?limit=10 and the full list in parallel.
    // - quickPromise shows the first 10 items as soon as they arrive
    // - fullPromise attaches to the dashboard prefetch if it's already in flight,
    //   otherwise starts a new request; replaces items when complete
    setIsLoading(true)
    const quickPromise = get(`${url}?limit=10`)
    const fullPromise = get(url)  // deduplicates with any in-flight prefetch

    quickPromise.then(quick => {
      if (activeTabRef.current !== tab) return  // tab changed while fetching
      if (Array.isArray(quick) && quick.length) {
        setItems(mapItems(tab, quick))
        setIsLoading(false)
        prefetchFirstItem(tab, quick, get)
      }
    }).catch(() => {})

    try {
      const full = await fullPromise
      if (activeTabRef.current !== tab) return  // tab changed while fetching
      setApiCache(url, full)
      setItems(mapItems(tab, full))
    } catch (err) {
      console.error(`Failed to fetch ${tab}:`, err)
      if (activeTabRef.current === tab) setItems([])
    } finally {
      if (activeTabRef.current === tab) setIsLoading(false)
    }
  }, [get])

  useEffect(() => {
    setSelectedItemId(null)
    setSearchQuery('')
    setReviewFilterRating('all')
    fetchItems(currentTab)
  }, [currentTab, fetchItems])

  // Prefetch other tabs' first items when current tab finishes loading
  useEffect(() => {
    if (items.length === 0) return
    for (const otherTab of ['courses', 'clubs', 'teachers']) {
      if (otherTab === currentTab) continue
      const cachedList = getApiCacheSync(URL_MAP[otherTab])
      if (cachedList?.length) prefetchFirstItem(otherTab, cachedList, get)
    }
  }, [items, currentTab, get])

  const handleTabChange = (tab) => {
    setCurrentTab(tab)
  }

  const handleReviewSubmitted = () => {
    invalidateCache('/api/reviews')
    if (selectedItemId) {
      invalidateCache(`${DETAILS_PREFIX[currentTab]}${selectedItemId}`)
    }
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
            <button className="btn btn-outline" onClick={() => navigate('/dashboard')}>
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
          isLoading={isLoading}
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
