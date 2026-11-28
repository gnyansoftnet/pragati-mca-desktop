import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import { useShift } from './useShift'
import type { ShiftDto } from '@shared/dtos/master/master.dto'

// Convert "HH:mm:ss" to total seconds from midnight
function timeToSeconds(timeStr?: string): number {
  if (!timeStr) return 0
  const parts = timeStr.split(':').map(Number)
  return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0)
}

// Current time in seconds from midnight
function getCurrentSeconds(): number {
  const now = new Date()
  return now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()
}

// Check if current time falls within start & end
function isTimeInShift(nowSec: number, startSec: number, endSec: number): boolean {
  if (startSec < endSec) {
    return nowSec >= startSec && nowSec < endSec
  } else {
    // Overnight shifts (e.g. 22:00 to 02:00)
    return nowSec >= startSec || nowSec < endSec
  }
}

export function useShiftAutoLogout() {
  const { user, menus, logout } = useAuth()
  const { shifts, loadingShifts } = useShift(user?.plant)
  const navigate = useNavigate()
  const location = useLocation()

  // Track the initial active shift ID when operator is working
  const initialShiftIdRef = useRef<number | string | null>(null)
  const isLoggedOutRef = useRef(false)

  useEffect(() => {
    // 1. Guard: Skip if not logged in, shifts still loading, or already logged out
    if (!user || loadingShifts || shifts.length === 0 || isLoggedOutRef.current) {
      return () => {}
    }

    // 2. Target check: "pageId" is 1 ("Procurement Collection")
    const hasProcurementAccess = menus.some(
      (m) => String(m.pageId) === '1' || m.title?.trim().toLowerCase().includes('procurement')
    )

    // Check if user is a dedicated Procurement operator (does not have Master/Reports dropdowns)
    // or is currently working inside the /admin/procurement-collection page
    const isProcurementTarget =
      hasProcurementAccess &&
      (!menus.some((m) => m.id === 'parent-master' || m.id === 'parent-reports') ||
        location.pathname.includes('/procurement-collection'))

    if (!isProcurementTarget) {
      return () => {}
    }

    // 3. Shift Verification Logic
    const verifyShiftStatus = () => {
      const nowSec = getCurrentSeconds()

      // Find if current time is inside any configured shift
      const activeShift: ShiftDto | undefined = shifts.find((s) => {
        const startSec = timeToSeconds(s.startTime)
        const endSec = timeToSeconds(s.endTime)
        return isTimeInShift(nowSec, startSec, endSec)
      })

      // Set the initial active shift when first detected
      if (initialShiftIdRef.current === null && activeShift) {
        initialShiftIdRef.current = activeShift.id
      }

      // Check if the shift is over:
      // Condition A: Currently outside all shifts (break period or shift ended)
      // Condition B: The active shift has changed (Morning ended, Evening started)
      const isShiftOver =
        !activeShift ||
        (initialShiftIdRef.current !== null && activeShift.id !== initialShiftIdRef.current)

      if (isShiftOver && !isLoggedOutRef.current) {
        isLoggedOutRef.current = true

        toast.warn('Shift has ended! You have been logged out automatically.', {
          toastId: 'shift-ended-auto-logout',
          autoClose: 6000
        })

        logout()
        navigate('/')
      }
    }

    // Run verification immediately
    verifyShiftStatus()

    // Check every 5 seconds
    const timer = setInterval(verifyShiftStatus, 5000)

    return () => clearInterval(timer)
  }, [user, menus, shifts, loadingShifts, location.pathname, logout, navigate])
}

export default useShiftAutoLogout