import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import GoogleSignInButton from './GoogleSignInButton'
import titleBg from '../../assets/title-bg.jpg'
import logo from '../../assets/sift.png'

export default function LoginPage() {
  const { isAuthenticated, bypassLogin } = useAuth()

  if (isAuthenticated) return <Navigate to="/" replace />

  return (
    <div className="page-container login-page">
      <div className="login-bg">
        <img src={titleBg} alt="" className="bg-image" />
        <div className="bg-overlay" />
      </div>
      <div className="login-wrapper">
        <div className="login-header">
          <img src={logo} alt="LT" className="logo" />
          <h1 className="app-title">LT Assistant</h1>
          <p className="subtitle">Sign in to your account</p>
        </div>
        <div className="login-wrapper">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Login</h2>
              <p className="card-description">Sign in with your Google account</p>
            </div>
            <div className="card-content">
              <div className="google-signin-container">
                <GoogleSignInButton />
              </div>
              <div className="bypass-divider"><span>or</span></div>
              <button className="bypass-btn" onClick={bypassLogin}>
                Continue without signing in
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
