
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Use null as initial state to indicate "not determined yet"
  const [isMobile, setIsMobile] = React.useState<boolean | null>(null)
  
  React.useEffect(() => {
    // Only run this code on the client
    if (typeof window === 'undefined') return;
    
    // Set initial value based on current window width
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Initial check
    checkIfMobile()
    
    // Add event listener
    const handleResize = () => checkIfMobile()
    window.addEventListener('resize', handleResize)
    
    // Cleanup event listener
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Return current state (null during SSR, boolean on client)
  return isMobile
}
