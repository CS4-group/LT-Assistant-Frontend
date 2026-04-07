import { useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import API_BASE_URL from '../config'

// Module-level cache — survives component unmounts and navigations
const apiCache = {}
// In-flight request deduplication — prevents duplicate parallel fetches for the same URL
const inflight = {}

export function getApiCacheSync(url) {
  if (apiCache[url] !== undefined) return apiCache[url]
  try {
    const stored = sessionStorage.getItem(`api_cache:${url}`)
    if (stored) {
      const parsed = JSON.parse(stored)
      apiCache[url] = parsed
      return parsed
    }
  } catch {}
  return null
}

export function setApiCache(url, data) {
  apiCache[url] = data
  try { sessionStorage.setItem(`api_cache:${url}`, JSON.stringify(data)) } catch {}
}

export function useApi() {
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
    // 1. Memory cache hit
    if (useCache && apiCache[url] !== undefined) return apiCache[url]

    // 2. sessionStorage hit
    if (useCache) {
      const stored = sessionStorage.getItem(`api_cache:${url}`)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          apiCache[url] = parsed
          return parsed
        } catch {}
      }
    }

    // 3. Attach to an in-flight request for this URL if one exists
    if (useCache && inflight[url]) return inflight[url]

    // 4. Network fetch — store promise so concurrent callers share it
    const promise = request(url).then(data => {
      if (useCache) {
        setApiCache(url, data)
        delete inflight[url]
      }
      return data
    }).catch(err => {
      if (useCache) delete inflight[url]
      throw err
    })

    if (useCache) inflight[url] = promise
    return promise
  }, [request])

  const post = useCallback((url, body) => request(url, { method: 'POST', body }), [request])
  const del = useCallback((url, body) => request(url, { method: 'DELETE', body }), [request])

  const invalidateCache = useCallback((pattern) => {
    if (pattern) {
      Object.keys(apiCache).forEach(key => {
        if (key.includes(pattern)) {
          delete apiCache[key]
          try { sessionStorage.removeItem(`api_cache:${key}`) } catch {}
        }
      })
    } else {
      Object.keys(apiCache).forEach(key => delete apiCache[key])
      try {
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith('api_cache:')) sessionStorage.removeItem(key)
        })
      } catch {}
    }
  }, [])

  return { get, post, del, invalidateCache }
}
