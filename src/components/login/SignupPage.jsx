import { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../ui/LoadingSpinner'
import titleBg from '../../assets/title-bg.jpg'
import logo from '../../assets/sift.png'

export default function SignupPage() {
  const { isAuthenticated, loading, signupWithEmail } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (loading) return <LoadingSpinner />
  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const validate = () => {
    const errs = {}
    if (!name.trim()) {
      errs.name = 'Name is required'
    }
    if (!email.trim()) {
      errs.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Enter a valid email address'
    }
    if (!password) {
      errs.password = 'Password is required'
    } else if (password.length < 8) {
      errs.password = 'Password must be at least 8 characters'
    } else if (!/[a-zA-Z]/.test(password)) {
      errs.password = 'Password must contain at least one letter'
    } else if (!/[0-9]/.test(password)) {
      errs.password = 'Password must contain at least one number'
    }
    if (!confirmPassword) {
      errs.confirmPassword = 'Please confirm your password'
    } else if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match'
    }
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    setSuccessMessage('')
    const validationErrors = validate()
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors)
      return
    }
    setErrors({})
    setIsSubmitting(true)
    try {
      const data = await signupWithEmail(email, password, name)
      setSuccessMessage(data.message || 'Check your email to confirm your account.')
    } catch (err) {
      setServerError(err.message || 'Signup failed. Please try again.')
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
          <p className="subtitle">Create your account</p>
        </div>
        <div className="login-wrapper">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Get started</h2>
              <p className="card-description">Sign up to plan your courses</p>
            </div>
            <div className="card-content">
              {successMessage ? (
                <div className="success-message">{successMessage}</div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  {serverError && (
                    <div className="server-error">{serverError}</div>
                  )}
                  <div className="form-group">
                    <label className="form-label" htmlFor="name">Name</label>
                    <input
                      id="name"
                      type="text"
                      className={`form-input${errors.name ? ' input-error' : ''}`}
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                    />
                    {errors.name && <p className="field-error">{errors.name}</p>}
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="signup-email">Email</label>
                    <input
                      id="signup-email"
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
                    <label className="form-label" htmlFor="signup-password">Password</label>
                    <div className="password-wrapper">
                      <input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        className={`form-input${errors.password ? ' input-error' : ''}`}
                        placeholder="8+ chars, letter & number"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
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
                  <div className="form-group">
                    <label className="form-label" htmlFor="confirm-password">Confirm Password</label>
                    <input
                      id="confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      className={`form-input${errors.confirmPassword ? ' input-error' : ''}`}
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                    {errors.confirmPassword && <p className="field-error">{errors.confirmPassword}</p>}
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary btn-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating account...' : 'Create Account'}
                  </button>
                </form>
              )}
              <p className="auth-link">
                Already have an account? <Link to="/login">Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
