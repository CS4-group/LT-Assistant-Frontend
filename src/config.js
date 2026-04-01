const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  || (window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://api.ltassistant.com')

export default API_BASE_URL
