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

export const useGoatCounter = () => {
  const baseUrl = getBaseUrl()
  const countEndpoint = `${baseUrl}/count`
  
  // Centralized dev mode check
  const isDevMode = import.meta.dev
  const shouldTrack = import.meta.client && !isDevMode

  // Initialize GoatCounter tracking
  const initializeTracking = () => {
    if (!shouldTrack) return

    // Check if script already exists
    if (document.querySelector('[data-goatcounter]')) return

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

  // Get visit count for a specific path
  const getVisitCount = async (path: string): Promise<number> => {
    if (isDevMode) return 0
    
    try {
      const encodedPath = encodeURIComponent(path)
      // GoatCounter uses /counter/ endpoint for retrieving counts
      const response = await fetch(`${baseUrl}/counter/${encodedPath}.json`)
      
      if (!response.ok) {
        if (response.status === 404) return 0
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data: CountData = await response.json()
      return data.count || 0
    } catch (error) {
      console.warn('Failed to fetch visit count:', error)
      return 0
    }
  }

  // Get analytics data for a blog post
  const getBlogAnalytics = async (slug: string): Promise<Analytics> => {
    try {
      const [visits, likes, shares] = await Promise.all([
        getVisitCount(`/blogs/${slug}`),
        getVisitCount(`/blogs/${slug}-like`),
        getVisitCount(`/blogs/${slug}-share`)
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

  // Track unlike action
  const trackUnlike = (slug: string) => {
    trackEvent('unlike', `/blogs/${slug}`)
  }

  // Track share action
  const trackShare = (slug: string, platform?: string) => {
    const eventName = platform ? `share-${platform}` : 'share'
    trackEvent(eventName, `/blogs/${slug}`)
  }

  return {
    initializeTracking,
    trackVisit,
    trackEvent,
    trackLike,
    trackUnlike,
    trackShare,
    getVisitCount,
    getBlogAnalytics
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
    }
  }
}