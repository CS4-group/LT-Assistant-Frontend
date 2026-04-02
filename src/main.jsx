import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// Redirect /confirm/:token paths to hash-based route so HashRouter can handle them
const { pathname } = window.location
const confirmMatch = pathname.match(/^\/confirm\/(.+)/)
if (confirmMatch) {
  window.location.replace(`${window.location.origin}/#/confirm/${confirmMatch[1]}`)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
