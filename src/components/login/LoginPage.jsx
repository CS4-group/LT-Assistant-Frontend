import { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../ui/LoadingSpinner'
import titleBg from '../../assets/title-bg.jpg'
import logo from '../../assets/sift.png'

export default function LoginPage() {
  const { isAuthenticated, loading, loginWithEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (loading) return <LoadingSpinner />
  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const validate = () => {
    const errs = {}
    if (!email.trim()) {
      errs.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Enter a valid email address'
    }
    if (!password) {
      errs.password = 'Password is required'
    } else if (password.length < 8) {
      errs.password = 'Password must be at least 8 characters'
    }
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    const validationErrors = validate()
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors)
      return
    }
    setErrors({})
    setIsSubmitting(true)
    try {
      await loginWithEmail(email, password)
    } catch (err) {
      setServerError(err.message || 'Login failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

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
              <h2 className="card-title">Welcome back</h2>
              <p className="card-description">Enter your credentials to continue</p>
            </div>
            <div className="card-content">
              <form onSubmit={handleSubmit} noValidate>
                {serverError && (
                  <div className="server-error">{serverError}</div>
                )}
                <div className="form-group">
                  <label className="form-label" htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    className={`form-input${errors.email ? ' input-error' : ''}`}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                  {errors.email && <p className="field-error">{errors.email}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="password">Password</label>
                  <div className="password-wrapper">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      className={`form-input${errors.password ? ' input-error' : ''}`}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {errors.password && <p className="field-error">{errors.password}</p>}
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
              <p className="auth-link">
                Don't have an account? <Link to="/signup">Sign up</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
