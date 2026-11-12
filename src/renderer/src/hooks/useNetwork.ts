import { useState, useEffect, useCallback } from 'react'

const PROBE_URL = 'https://clients3.google.com/generate_204'

async function probeUrl(url: string, timeoutMs: number): Promise<boolean> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    await fetch(`${url}?_=${Date.now()}`, {
      method: 'GET',
      mode: 'no-cors',
      cache: 'no-store',
      signal: controller.signal
    })
    return true
  } catch {
    return false
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Checks real internet reachability. Returns false whenever probes fail.
 */
export async function checkRealInternet(timeoutMs = 2500): Promise<boolean> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return false
  }
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    await fetch(`${PROBE_URL}?_=${Date.now()}`, {
      method: 'GET',
      mode: 'no-cors',
      cache: 'no-store',
      signal: controller.signal
    })
    return true
  } catch {
    return false
  } finally {
    clearTimeout(timer)
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
    window.addEventListener('focus', verifyConnection)

    // Initial check on mount
    verifyConnection()

    // Check every 5 seconds so Wi-Fi disconnects show OFF quickly even if OS misses 'offline'
    const interval = setInterval(verifyConnection, 5000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('focus', verifyConnection)
      clearInterval(interval)
    }
  }, [verifyConnection])

  return {
    isOnline,
    isChecking,
    verifyConnection
  }
}
