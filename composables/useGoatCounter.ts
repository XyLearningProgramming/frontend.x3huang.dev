import { getBaseUrl } from '~/site.config'

interface CountData {
  count: number
  count_unique: number
}

interface Analytics {
  visits: number
  likes: number
  shares: number
}

// Request queue to prevent rate limiting
const requestQueue: Array<() => Promise<any>> = []
const pendingRequests = new Set<string>()
const failedRequests = new Set<string>()
let isProcessingQueue = false

// Cache with 5-minute TTL
interface CacheEntry {
  data: number
  timestamp: number
}

const cache = new Map<string, CacheEntry>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes in milliseconds

const getCachedData = (key: string): number | null => {
  const entry = cache.get(key)
  if (!entry) return null

  const now = Date.now()
  if (now - entry.timestamp > CACHE_TTL) {
    cache.delete(key)
    return null
  }

  return entry.data
}

const setCachedData = (key: string, data: number): void => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  })
}

const processQueue = async () => {
  if (isProcessingQueue || requestQueue.length === 0) return

  isProcessingQueue = true

  while (requestQueue.length > 0) {
    const request = requestQueue.shift()!
    try {
      await request()
    } catch (error) {
      // Silently handle errors - they're already handled in individual requests
    }
    // Add delay between requests to prevent rate limiting
    if (requestQueue.length > 0) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  isProcessingQueue = false
}

const queueRequest = <T>(key: string, requestFn: () => Promise<T>): Promise<T> => {
  return new Promise((resolve) => {
    // If we already failed to fetch this counter, return 0 immediately
    if (failedRequests.has(key)) {
      resolve(0 as T)
      return
    }

    // If request is already pending, return 0 to avoid duplicates
    if (pendingRequests.has(key)) {
      resolve(0 as T)
      return
    }

    pendingRequests.add(key)

    const wrappedRequest = async () => {
      try {
        const result = await requestFn()
        pendingRequests.delete(key)
        resolve(result)
      } catch (error) {
        pendingRequests.delete(key)
        // Mark as failed so we don't retry
        failedRequests.add(key)
        // Always resolve with 0 instead of rejecting
        resolve(0 as T)
      }
    }

    requestQueue.push(wrappedRequest)
    processQueue()
  })
}

export const useGoatCounter = () => {
  const baseUrl = getBaseUrl()
  const countEndpoint = `${baseUrl}/count`

  // Debug flag to enable tracking in dev mode for testing
  const DEBUG_GOATCOUNTER = false

  // Centralized dev mode check
  const isDevMode = import.meta.dev
  const shouldTrack = import.meta.client && (!isDevMode || DEBUG_GOATCOUNTER)

  // Initialize GoatCounter tracking
  const initializeTracking = () => {
    if (!shouldTrack) return

    // Check if script already exists
    if (document.querySelector('[data-goatcounter]')) return

    // Override GoatCounter settings to allow localhost when debugging
    if (DEBUG_GOATCOUNTER && isDevMode) {
      if (!window.goatcounter) {
        window.goatcounter = {} as any
      }
      // Force enable tracking on localhost for debugging
      window.goatcounter!.no_onload = false
      window.goatcounter!.allow_local = true
    }

    const script = document.createElement('script')
    script.setAttribute('data-goatcounter', countEndpoint)
    script.setAttribute('async', 'true')
    script.src = '//gc.zgo.at/count.js'

    document.head.appendChild(script)
  }

  // Track page visit
  const trackVisit = (path?: string) => {
    if (!shouldTrack) return

    const checkAndTrack = () => {
      if (window.goatcounter && window.goatcounter.count) {
        window.goatcounter.count({
          path: path || window.location.pathname,
          title: document.title,
          event: false
        })
      } else {
        setTimeout(checkAndTrack, 100)
      }
    }

    checkAndTrack()
  }

  // Track custom events (like likes, shares)
  const trackEvent = (eventName: string, path?: string) => {
    if (!shouldTrack) return

    const checkAndTrack = () => {
      if (window.goatcounter && window.goatcounter.count) {
        window.goatcounter.count({
          path: `${path || window.location.pathname}-${eventName}`,
          title: `${eventName}: ${document.title}`,
          event: true
        })
      } else {
        setTimeout(checkAndTrack, 100)
      }
    }

    checkAndTrack()
  }

  // Ensure GoatCounter script is loaded
  const ensureGoatCounterLoaded = (): Promise<void> => {
    if (!shouldTrack) return Promise.resolve()

    return new Promise((resolve) => {
      if (window.goatcounter?.count) {
        resolve()
        return
      }

      initializeTracking()

      // Use the official docs pattern: check every 100ms until loaded
      const checkInterval = setInterval(() => {
        if (window.goatcounter?.count) {
          clearInterval(checkInterval)
          resolve()
        }
      }, 100)

      // Safety timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval)
        console.warn('GoatCounter script took longer than expected to load')
        resolve()
      }, 10000)
    })
  }

  // Record a hit for the given path
  const recordHit = (path: string): Promise<void> => {
    if (!shouldTrack) return Promise.resolve()

    return new Promise((resolve) => {
      if (window.goatcounter?.count) {
        window.goatcounter.count({
          path,
          title: document.title,
          event: false
        })
        // Small delay to ensure the hit is processed
        setTimeout(resolve, 100)
      } else {
        resolve()
      }
    })
  }


  // Get visit count without recording a hit (for display purposes only)
  const getVisitCountOnly = async (path: string): Promise<number> => {
    if (isDevMode && !DEBUG_GOATCOUNTER) return 0

    // Check cache first
    const cacheKey = `count-${path}`
    const cachedData = getCachedData(cacheKey)
    if (cachedData !== null) {
      return cachedData
    }

    return queueRequest(cacheKey, async () => {
      const encodedPath = encodeURIComponent(path)
      const response = await fetch(`${baseUrl}/counter/${encodedPath}.json`)

      if (!response.ok) {
        // For any error (including 404), throw to mark as failed
        throw new Error(`HTTP ${response.status}`)
      }

      const data: CountData = await response.json()
      const count = Number(data.count) || 0

      // Cache the result
      setCachedData(cacheKey, count)

      return count
    })
  }

  // Get visit count for a specific path (records a hit first)
  const getVisitCount = async (path: string): Promise<number> => {
    if (isDevMode && !DEBUG_GOATCOUNTER) return 0

    // Ensure GoatCounter is loaded and record a hit first
    await ensureGoatCounterLoaded()
    await recordHit(path)

    try {
      // Use the same path normalization as GoatCounter for consistent matching
      let normalizedPath = path
      if (window.goatcounter?.get_data) {
        // Use GoatCounter's path normalization if available
        const gcData = window.goatcounter.get_data()
        if (gcData?.p && path === window.location.pathname) {
          normalizedPath = gcData.p
        }
      }

      const encodedPath = encodeURIComponent(normalizedPath)
      const response = await fetch(`${baseUrl}/counter/${encodedPath}.json`)

      if (!response.ok) {
        if (response.status === 404) {
          // Zero views so far - this is expected for new pages
          return 0
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: CountData = await response.json()
      return Number(data.count) || 0
    } catch (error) {
      console.warn('Failed to fetch visit count:', error)
      return 0
    }
  }

  // Get analytics data for a blog post (display only, no hit recording)
  const getBlogAnalytics = async (slug: string): Promise<Analytics> => {
    try {
      const [visits, likes, shares] = await Promise.all([
        getVisitCountOnly(`/blogs/${slug}`),
        getVisitCountOnly(`/blogs/${slug}-like`),
        getVisitCountOnly(`/blogs/${slug}-share`)
      ])

      return { visits, likes, shares }
    } catch (error) {
      console.warn('Failed to fetch blog analytics:', error)
      return { visits: 0, likes: 0, shares: 0 }
    }
  }

  // Track like action
  const trackLike = (slug: string) => {
    trackEvent('like', `/blogs/${slug}`)
  }


  // Track share action
  const trackShare = (slug: string, platform?: string) => {
    const eventName = platform ? `share-${platform}` : 'share'
    trackEvent(eventName, `/blogs/${slug}`)
  }

  // Clear request queue and failed requests (useful on page navigation)
  const clearRequestCache = () => {
    requestQueue.length = 0
    pendingRequests.clear()
    failedRequests.clear()
    // Don't clear the data cache - let it expire naturally
  }

  // Clear all caches (including data cache)
  const clearAllCaches = () => {
    clearRequestCache()
    cache.clear()
  }

  return {
    initializeTracking,
    trackVisit,
    trackEvent,
    trackLike,
    trackShare,
    getVisitCount,
    getVisitCountOnly,
    getBlogAnalytics,
    clearRequestCache,
    clearAllCaches
  }
}

// Extend window interface for TypeScript
declare global {
  interface Window {
    goatcounter?: {
      count: (params: {
        path: string
        title?: string
        event?: boolean
      }) => void
      visit_count: (params?: any) => void
      get_data: () => { p?: string } | null
      no_onload?: boolean
      allow_local?: boolean
    }
  }
}