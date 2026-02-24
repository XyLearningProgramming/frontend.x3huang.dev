export const useSidebar = () => {
  const isOpen = useState('sidebar-open', () => false)
  const isMobile = useState('sidebar-mobile', () => false)

  const checkMobileSize = () => {
    if (import.meta.client) {
      isMobile.value = window.innerWidth < 768
      if (!isMobile.value) {
        isOpen.value = false
      }
    }
  }

  const toggleSidebar = () => {
    isOpen.value = !isOpen.value
  }

  const closeSidebar = () => {
    isOpen.value = false
  }

  return {
    isOpen,
    isMobile,
    checkMobileSize,
    toggleSidebar,
    closeSidebar,
  }
}
