import { useState, useEffect, useCallback } from 'react'

/**
 * Checks real internet reachability via the Electron main process
 * so Chromium DevTools does not log net::ERR_NAME_NOT_RESOLVED when offline.
 */
export async function checkRealInternet(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return false
  }

  try {
    return await window.api.checkInternet()
  } catch {
    return false
  }
}

export function useNetwork() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )
  const [isChecking, setIsChecking] = useState<boolean>(false)

  const verifyConnection = useCallback(async (): Promise<boolean> => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setIsOnline(false)
      return false
    }

    setIsChecking(true)
    const hasInternet = await checkRealInternet()
    setIsOnline(hasInternet)
    setIsChecking(false)
    return hasInternet
  }, [])

  useEffect(() => {
    const handleOnline = () => {
      verifyConnection()
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Initial check on mount
    verifyConnection()

    // Periodically verify connection every 5 seconds
    const interval = setInterval(verifyConnection, 5000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [verifyConnection])

  return {
    isOnline,
    isChecking,
    verifyConnection
  }
}