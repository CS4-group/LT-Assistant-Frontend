import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useApi } from '../../hooks/useApi'
import { prefetchFirstItem } from '../../utils/ratingPrefetch'
import titleBg from '../../assets/title-bg.jpg'
import logo from '../../assets/sift.png'

export default function HomePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { get } = useApi()

  // Prefetch rating data + first item details so the rating page loads instantly
  useEffect(() => {
    get('/api/courses/names').then(data => prefetchFirstItem('courses', data, get)).catch(() => {})
    get('/api/clubs').then(data => prefetchFirstItem('clubs', data, get)).catch(() => {})
    get('/api/teachers').then(data => prefetchFirstItem('teachers', data, get)).catch(() => {})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const userName = user?.name || 'User'
  const userEmail = user?.email || ''
  const initials = userName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="page-container home-page">
      <div className="home-top-right">
        <button className="btn btn-outline" onClick={() => navigate('/')}>← Back</button>
      </div>
      <div className="home-bg">
        <img src={titleBg} alt="" className="bg-image" />
        <div className="bg-overlay" />
      </div>
      <div className="user-profile-section">
        <div className="user-profile">
          <div className="user-avatar-initials">{initials}</div>
          <div className="user-info">
            <span className="user-name">{userName}</span>
            <span className="user-email">{userEmail}</span>
          </div>
        </div>
      </div>
      <div className="home-header">
        <img src={logo} alt="LT" className="logo" />
        <h1 className="app-title-large">LT Assistant</h1>
        <p className="tagline">Plan your path and rate experiences</p>
      </div>
      <div className="home-content">
        <div className="feature-grid">
          <button className="feature-card planner-card" onClick={() => navigate('/planner')}>
            <span className="feature-title">Course Planner & AI</span>
          </button>
          <button className="feature-card rating-card" onClick={() => navigate('/rating')}>
            <span className="feature-title">Rating System</span>
          </button>
        </div>
      </div>
      <div className="home-footer">
        <button className="btn btn-outline logout-btn" onClick={logout}>
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}
