import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ToastProvider } from './contexts/ToastContext'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import ThemeToggle from './components/ui/ThemeToggle'
import ProtectedRoute from './components/ui/ProtectedRoute'
import LandingPage from './components/landing/LandingPage'
import LoginPage from './components/login/LoginPage'
import SignupPage from './components/login/SignupPage'
import ConfirmPage from './components/login/ConfirmPage'
import HomePage from './components/home/HomePage'
import OnboardingPage from './components/onboarding/OnboardingPage'
import RatingPage from './components/rating/RatingPage'
import PlannerPage from './components/planner/PlannerPage'

function AppRoutes() {
  const location = useLocation()
  const isLanding = location.pathname === '/'

  return (
    <>
      <ThemeToggle hidden={isLanding} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/confirm/:token" element={<ConfirmPage />} />
        <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/rating" element={<ProtectedRoute><RatingPage /></ProtectedRoute>} />
        <Route path="/planner" element={<ProtectedRoute><PlannerPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <HashRouter>
      <ToastProvider>
        <AuthProvider>
          <ThemeProvider>
            <AppRoutes />
          </ThemeProvider>
        </AuthProvider>
      </ToastProvider>
    </HashRouter>
  )
}
