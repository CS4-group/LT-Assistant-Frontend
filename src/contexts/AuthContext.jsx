import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from './ToastContext'
import { apiFetch, setOnUnauthorized } from '../utils/api'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [onboardingComplete, setOnboardingComplete] = useState(
    () => localStorage.getItem('onboardingComplete') === 'true'
  )

  const clearAuth = useCallback(() => {
    setIsAuthenticated(false)
    setUser(null)
  }, [])

  useEffect(() => {
    setOnUnauthorized(clearAuth)
  }, [clearAuth])

  useEffect(() => {
    apiFetch('/api/auth/me')
      .then(data => {
        setUser(data.user)
        setIsAuthenticated(true)
        setOnboardingComplete(
          data.user.onboardingComplete ?? localStorage.getItem('onboardingComplete') === 'true'
        )
      })
      .catch(() => {
        setIsAuthenticated(false)
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const loginWithEmail = useCallback(async (email, password) => {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    setIsAuthenticated(true)
    setUser(data.user)
    const needsOnboarding = data.isNewUser || !data.user.onboardingComplete
    if (needsOnboarding) {
      navigate('/onboarding')
      showToast(`Welcome, ${data.user.name}! Let's set up your profile.`, 'success')
    } else {
      navigate('/dashboard')
      showToast(`Welcome back, ${data.user.name}!`, 'success')
    }
  }, [navigate, showToast])

  const signupWithEmail = useCallback(async (email, password, name) => {
    const data = await apiFetch('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    })
    return data
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // Clear local state even if backend call fails
    }
    setIsAuthenticated(false)
    setUser(null)
    setOnboardingComplete(false)
    localStorage.removeItem('onboardingComplete')
    localStorage.removeItem('userGoals')
    navigate('/login')
    showToast('Logged out successfully', 'success')
  }, [navigate, showToast])

  const completeOnboarding = useCallback(async (answers) => {
    try {
      await apiFetch('/api/user/goals', {
        method: 'POST',
        body: JSON.stringify(answers),
      })
    } catch (err) {
      console.warn('Could not save goals to backend:', err)
    }
    localStorage.setItem('onboardingComplete', 'true')
    localStorage.setItem('userGoals', JSON.stringify(answers))
    setOnboardingComplete(true)
    navigate('/dashboard')
    const name = user?.name || 'there'
    showToast(`All set, ${name}! Your profile is ready.`, 'success')
  }, [navigate, showToast, user])

  return (
    <AuthContext.Provider value={{
      isAuthenticated, user, loading, onboardingComplete,
      loginWithEmail, signupWithEmail, logout, completeOnboarding, clearAuth,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
