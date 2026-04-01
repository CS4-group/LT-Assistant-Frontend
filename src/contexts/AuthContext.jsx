import { createContext, useContext, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import API_BASE_URL from '../config'
import { useToast } from './ToastContext'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem('isLoggedIn') === 'true'
  )
  const [user, setUser] = useState(() => {
    const name = localStorage.getItem('userName')
    if (!name) return null
    return {
      name,
      email: localStorage.getItem('userEmail') || '',
      picture: localStorage.getItem('userPicture') || '',
    }
  })
  const [token, setToken] = useState(() => localStorage.getItem('authToken'))
  const [onboardingComplete, setOnboardingComplete] = useState(
    () => localStorage.getItem('onboardingComplete') === 'true'
  )

  const handleGoogleSignIn = useCallback(async (googleResponse) => {
    try {
      const idToken = googleResponse.credential
      const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })
      if (!response.ok) throw new Error('Authentication failed')
      const data = await response.json()

      setIsAuthenticated(true)
      setToken(data.token)
      setUser({ name: data.user.name, email: data.user.email, picture: data.user.picture || '' })

      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('authToken', data.token)
      localStorage.setItem('userEmail', data.user.email)
      localStorage.setItem('userName', data.user.name)
      localStorage.setItem('userPicture', data.user.picture || '')

      const needsOnboarding = data.isNewUser || !localStorage.getItem('onboardingComplete')
      if (needsOnboarding) {
        navigate('/onboarding')
        showToast(`Welcome, ${data.user.name}! Let's set up your profile.`, 'success')
      } else {
        navigate('/')
        showToast(`Welcome back, ${data.user.name}!`, 'success')
      }
    } catch (error) {
      console.error('Login error:', error)
      showToast('Login failed. Please try again.', 'error')
    }
  }, [navigate, showToast])

  const bypassLogin = useCallback(() => {
    setIsAuthenticated(true)
    setUser({ name: 'Guest', email: '', picture: '' })
    localStorage.setItem('isLoggedIn', 'true')
    localStorage.setItem('userName', 'Guest')
    localStorage.setItem('userEmail', '')
    localStorage.setItem('userPicture', '')
    navigate('/')
    showToast('Signed in as Guest', 'success')
  }, [navigate, showToast])

  const logout = useCallback(() => {
    setIsAuthenticated(false)
    setUser(null)
    setToken(null)
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userName')
    localStorage.removeItem('userPicture')
    localStorage.removeItem('authToken')
    navigate('/login')
    showToast('Logged out successfully', 'success')
  }, [navigate, showToast])

  const completeOnboarding = useCallback(async (answers) => {
    try {
      const authToken = localStorage.getItem('authToken')
      if (authToken) {
        await fetch(`${API_BASE_URL}/api/user/goals`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify(answers),
        })
      }
    } catch (err) {
      console.warn('Could not save goals to backend:', err)
    }
    localStorage.setItem('onboardingComplete', 'true')
    localStorage.setItem('userGoals', JSON.stringify(answers))
    setOnboardingComplete(true)
    navigate('/')
    const name = localStorage.getItem('userName') || 'there'
    showToast(`All set, ${name}! Your profile is ready.`, 'success')
  }, [navigate, showToast])

  return (
    <AuthContext.Provider value={{
      isAuthenticated, user, token, onboardingComplete,
      handleGoogleSignIn, bypassLogin, logout, completeOnboarding,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
