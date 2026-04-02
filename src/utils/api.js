import API_BASE_URL from '../config'

let onUnauthorized = () => {}

export function setOnUnauthorized(callback) {
  onUnauthorized = callback
}

export async function apiFetch(url, options = {}) {
  const headers = { ...options.headers }
  if (options.body) headers['Content-Type'] = 'application/json'

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
    credentials: 'include',
  })

  if (response.status === 401) {
    onUnauthorized()
    throw new Error('Session expired')
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.message || `Request failed (${response.status})`)
  }

  if (response.status === 204) return null
  return response.json()
}

export const api = {
  get: (url) => apiFetch(url),
  post: (url, body) => apiFetch(url, { method: 'POST', body: JSON.stringify(body) }),
  del: (url, body) => apiFetch(url, { method: 'DELETE', body: body ? JSON.stringify(body) : undefined }),
}
