import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/landing" element={<div>Landing Page</div>} />
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/" element={<div>Home Page</div>} />
        <Route path="*" element={<Navigate to="/landing" />} />
      </Routes>
    </HashRouter>
  )
}
