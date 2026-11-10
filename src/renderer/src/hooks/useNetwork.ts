import { useState, useEffect, useCallback } from 'react'

/**
 * Checks real internet reachability using Chromium's 204 endpoint with fallback to system status
 */
export async function checkRealInternet(timeoutMs = 3500): Promise<boolean> {
  // 1. If the OS reports no network interface, definitely offline
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return false
  }

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    // Must be GET (generate_204 rejects HEAD requests)
    await fetch(`https://clients3.google.com/generate_204?_=${Date.now()}`, {
      method: 'GET',
      mode: 'no-cors',
      cache: 'no-store',
      signal: controller.signal
    })

    clearTimeout(timer)
    return true
  } catch {
    // If the ping is blocked by a local firewall/proxy, fallback to system navigator.onLine
    // so it doesn't falsely report offline
    return typeof navigator !== 'undefined' ? navigator.onLine : true
  }
}

export function useNetwork() {
  // Initialize directly from system network status
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )
  const [isChecking, setIsChecking] = useState<boolean>(false)

  const verifyConnection = useCallback(async (): Promise<boolean> => {
    // If system is offline, set false immediately
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
      // Immediately show online, then verify
      setIsOnline(true)
      verifyConnection()
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Initial check on mount
    verifyConnection()

    // Periodically verify connection every 30 seconds
    const interval = setInterval(verifyConnection, 30000)

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