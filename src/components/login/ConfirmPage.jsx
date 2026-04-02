import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { apiFetch } from '../../utils/api'
import LoadingSpinner from '../ui/LoadingSpinner'
import titleBg from '../../assets/title-bg.jpg'
import logo from '../../assets/sift.png'

export default function ConfirmPage() {
  const { token } = useParams()
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [resendStatus, setResendStatus] = useState('')
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    apiFetch(`/api/auth/confirm/${token}`)
      .then(data => {
        setStatus('success')
        setMessage(data.message || 'Your email has been confirmed!')
      })
      .catch(err => {
        setStatus('error')
        setMessage(err.message || 'Invalid or expired confirmation link.')
      })
  }, [token])

  const handleResend = async (e) => {
    e.preventDefault()
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setResendStatus('Please enter a valid email address.')
      return
    }
    setIsResending(true)
    setResendStatus('')
    try {
      const data = await apiFetch('/api/auth/resend-confirmation', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
      setResendStatus(data.message || 'A new confirmation email has been sent.')
    } catch (err) {
      setResendStatus(err.message || 'Could not resend. Please try again.')
    } finally {
      setIsResending(false)
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
          <p className="subtitle">Email Confirmation</p>
        </div>
        <div className="login-wrapper">
          <div className="card">
            <div className="card-content confirm-page">
              {status === 'loading' && (
                <div className="confirm-loading">
                  <LoadingSpinner />
                  <p>Confirming your email...</p>
                </div>
              )}
              {status === 'success' && (
                <div className="confirm-result">
                  <div className="success-message">{message}</div>
                  <Link to="/login" className="btn btn-primary btn-full">
                    Go to Login
                  </Link>
                </div>
              )}
              {status === 'error' && (
                <div className="confirm-result">
                  <div className="server-error">{message}</div>
                  <form onSubmit={handleResend} className="resend-form">
                    <p className="resend-label">Enter your email to get a new link:</p>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="btn btn-primary btn-full"
                      disabled={isResending}
                    >
                      {isResending ? 'Sending...' : 'Resend Confirmation Email'}
                    </button>
                    {resendStatus && (
                      <div className={resendStatus.includes('sent') ? 'success-message' : 'server-error'}>
                        {resendStatus}
                      </div>
                    )}
                  </form>
                  <Link to="/login" className="auth-link" style={{ display: 'block' }}>
                    Back to Login
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
