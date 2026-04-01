import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ToastProvider } from './contexts/ToastContext'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import ThemeToggle from './components/ui/ThemeToggle'
import ProtectedRoute from './components/ui/ProtectedRoute'

function AppRoutes() {
  const location = useLocation()
  const isLanding = location.pathname === '/landing'

  return (
    <>
      <ThemeToggle hidden={isLanding} />
      <Routes>
        <Route path="/landing" element={<div className="page-container">Landing</div>} />
        <Route path="/login" element={<div className="page-container">Login</div>} />
        <Route path="/onboarding" element={<div className="page-container">Onboarding</div>} />
        <Route path="/" element={<ProtectedRoute><div className="page-container">Home</div></ProtectedRoute>} />
        <Route path="/rating" element={<ProtectedRoute><div className="page-container">Rating</div></ProtectedRoute>} />
        <Route path="/planner" element={<ProtectedRoute><div className="page-container">Planner</div></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/landing" />} />
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
