import { useRef, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import API_BASE_URL from '../config'

export function useApi() {
  const cache = useRef({})
  const { clearAuth } = useAuth()

  const request = useCallback(async (url, options = {}) => {
    const headers = { ...options.headers }
    if (options.body) headers['Content-Type'] = 'application/json'

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
      credentials: 'include',
      body: options.body ? JSON.stringify(options.body) : undefined,
    })

    if (response.status === 401) {
      clearAuth()
      throw new Error('Session expired')
    }

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || `HTTP error! status: ${response.status}`)
    }

    if (response.status === 204) return null
    const json = await response.json()
    return json.success !== undefined ? (json.data ?? json) : json
  }, [clearAuth])

  const get = useCallback(async (url, { useCache = true } = {}) => {
    if (useCache && cache.current[url]) return cache.current[url]
    const data = await request(url)
    if (useCache) cache.current[url] = data
    return data
  }, [request])

  const post = useCallback((url, body) => request(url, { method: 'POST', body }), [request])
  const del = useCallback((url, body) => request(url, { method: 'DELETE', body }), [request])
  const invalidateCache = useCallback((pattern) => {
    if (pattern) {
      Object.keys(cache.current).forEach(key => {
        if (key.includes(pattern)) delete cache.current[key]
      })
    } else {
      cache.current = {}
    }
  }, [])

  return { get, post, del, invalidateCache }
}
