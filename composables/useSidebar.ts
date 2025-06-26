export const useSidebar = () => {
  const isExpanded = useState('sidebar-expanded', () => true)
  const isMobile = useState('sidebar-mobile', () => false)

  const checkMobileSize = () => {
    if (import.meta.client) {
      isMobile.value = window.innerWidth < 768
      // Only auto-collapse on mobile, otherwise keep current state
      if (isMobile.value) {
        isExpanded.value = false
      } else if (!isExpanded.value) {
        // If we're going from mobile to desktop and sidebar was collapsed, expand it
        isExpanded.value = true
      }
    }
  }

  const toggleSidebar = () => {
    isExpanded.value = !isExpanded.value
  }

  return {
    isExpanded,
    isMobile,
    checkMobileSize,
    toggleSidebar
  }
}