// import { useState, useEffect, useRef, useCallback } from 'react'
// import { toast } from 'react-toastify'
// import type { ShiftDto } from '@shared/dtos/master/master.dto'

// export interface ShiftOption {
//   value: string
//   label: string
// }

// // Convert "HH:mm:ss" to total seconds of the day
// function timeToSeconds(timeStr?: string): number {
//   if (!timeStr) return 0
//   const parts = timeStr.split(':').map(Number)
//   return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0)
// }

// // Get current system time in total seconds of the day
// function getCurrentSeconds(): number {
//   const now = new Date()
//   return now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()
// }

// // Check if current time falls within startTime and endTime (handles daytime and overnight shifts)
// function isTimeInShift(nowSec: number, startSec: number, endSec: number): boolean {
//   if (startSec < endSec) {
//     // Normal daytime shift (e.g., 08:00:00 to 13:00:00)
//     return nowSec >= startSec && nowSec < endSec
//   } else {
//     // Overnight shift (e.g., 22:00:00 to 06:00:00)
//     return nowSec >= startSec || nowSec < endSec
//   }
// }

// // Initial default shift based on system clock (after 1:00 PM / 13:00 -> Evening '2', else Morning '1')
// const getInitialShiftId = (): string => {
//   const hour = new Date().getHours()
//   return hour >= 13 ? '2' : '1'
// }

// export function useShift() {
//   const [shifts, setShifts] = useState<ShiftDto[]>([])
//   const [shiftOptions, setShiftOptions] = useState<ShiftOption[]>([])
//   const [currentShift, setCurrentShift] = useState<ShiftDto | null>(null)
//   const [currentShiftId, setCurrentShiftId] = useState<string>(getInitialShiftId)
//   const [loadingShifts, setLoadingShifts] = useState<boolean>(false)

//   // Track which shift end alerts have already been triggered today
//   const alertedShiftsRef = useRef<Record<string, boolean>>({})

//   // Find the active shift based on current time
//   const findActiveShift = useCallback((shiftList: ShiftDto[], nowSec: number): ShiftDto | null => {
//     if (!shiftList || shiftList.length === 0) return null

//     // 1. Check if nowSec is directly within a shift window
//     const active = shiftList.find((s) => {
//       const start = timeToSeconds(s.startTime)
//       const end = timeToSeconds(s.endTime)
//       return isTimeInShift(nowSec, start, end)
//     })

//     if (active) return active

//     // 2. If between shifts, find the upcoming shift or default to the first shift
//     const upcoming = shiftList.find((s) => timeToSeconds(s.startTime) > nowSec)
//     return upcoming || shiftList[0]
//   }, [])

//   // Check shifts and trigger 10-minute warning alert
//   const checkShiftAndTime = useCallback(
//     (shiftList: ShiftDto[]) => {
//       if (!shiftList || shiftList.length === 0) return

//       const nowSec = getCurrentSeconds()
//       const active = findActiveShift(shiftList, nowSec)

//       if (active) {
//         setCurrentShift(active)
//         setCurrentShiftId(String(active.id))

//         // Check if we are inside the active shift
//         const startSec = timeToSeconds(active.startTime)
//         const endSec = timeToSeconds(active.endTime)

//         if (isTimeInShift(nowSec, startSec, endSec)) {
//           // Calculate seconds remaining until this shift ends
//           let remainingSec = endSec - nowSec
//           if (remainingSec < 0) {
//             remainingSec += 86400 // 24-hour wrap for overnight shifts
//           }

//           // Trigger warning if within 10 minutes (<= 600 seconds)
//           if (remainingSec > 0 && remainingSec <= 600) {
//             const todayKey = `${active.id}-${new Date().toDateString()}`

//             if (!alertedShiftsRef.current[todayKey]) {
//               alertedShiftsRef.current[todayKey] = true

//               const remainingMinutes = Math.ceil(remainingSec / 60)
//               toast.warn(
//                 `⏰ Shift Ending Soon: "${active.shiftName}" shift will end in ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''} (at ${active.endTime}).`,
//                 {
//                   toastId: `shift-end-alert-${active.id}`,
//                   autoClose: 10000,
//                   pauseOnHover: true
//                 }
//               )
//             }
//           }
//         }
//       }
//     },
//     [findActiveShift]
//   )

//   // Fetch shifts from window.api.getShifts()
//   const fetchShifts = useCallback(async () => {
//     try {
//       setLoadingShifts(true)
//       if (typeof window !== 'undefined' && (window.api as any)?.getShifts) {
//         const response = await (window.api as any).getShifts()
//         const dataList: ShiftDto[] = Array.isArray(response)
//           ? response
//           : Array.isArray((response as any)?.data)
//             ? (response as any).data
//             : []

//         setShifts(dataList)

//         const options: ShiftOption[] = dataList.map((item) => ({
//           value: String(item.id),
//           label: String(item.shiftName ?? `Shift ${item.id}`)
//         }))
//         setShiftOptions(options)

//         // Run initial shift check
//         checkShiftAndTime(dataList)
//       }
//     } catch (error) {
//       console.error('Failed to load shifts in useShift hook:', error)
//     } finally {
//       setLoadingShifts(false)
//     }
//   }, [checkShiftAndTime])

//   // 1. Initial load on mount
//   useEffect(() => {
//     fetchShifts()
//   }, [fetchShifts])

//   // 2. Interval timer: checks every 30 seconds while the app is running
//   useEffect(() => {
//     if (shifts.length === 0) return

//     const interval = setInterval(() => {
//       checkShiftAndTime(shifts)
//     }, 30000)

//     return () => clearInterval(interval)
//   }, [shifts, checkShiftAndTime])

//   const getShiftLabel = useCallback(
//     (shiftVal: string | number): string => {
//       const match = shiftOptions.find((s) => String(s.value) === String(shiftVal))
//       if (match) return match.label
//       if (String(shiftVal) === '1') return 'Morning'
//       if (String(shiftVal) === '2') return 'Evening'
//       return `Shift ${shiftVal}`
//     },
//     [shiftOptions]
//   )

//   return {
//     shifts,
//     shiftOptions,
//     currentShift,
//     currentShiftId,
//     loadingShifts,
//     refreshShifts: fetchShifts,
//     getShiftLabel
//   }
// }

// export default useShift

import { useState, useEffect, useRef, useCallback } from 'react'
import { toast } from 'react-toastify'
import type { ShiftDto } from '@shared/dtos/master/master.dto'

export interface ShiftOption {
  value: string
  label: string
}

// Convert "HH:mm:ss" string to total seconds from midnight
function timeToSeconds(timeStr?: string): number {
  if (!timeStr) return 0
  const parts = timeStr.split(':').map(Number)
  return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0)
}

// Get current system time in total seconds from midnight
function getCurrentSeconds(): number {
  const now = new Date()
  return now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()
}

// Check if current time falls within startTime and endTime (handles day and overnight shifts)
function isTimeInShift(nowSec: number, startSec: number, endSec: number): boolean {
  if (startSec < endSec) {
    // Standard daytime shift (e.g. 08:00:00 to 13:00:00)
    return nowSec >= startSec && nowSec < endSec
  } else {
    // Overnight shift (e.g. 22:00:00 to 01:00:00)
    return nowSec >= startSec || nowSec < endSec
  }
}

export function useShift(plant?: string) {
  const [shifts, setShifts] = useState<ShiftDto[]>([])
  const [shiftOptions, setShiftOptions] = useState<ShiftOption[]>([])
  const [currentShift, setCurrentShift] = useState<ShiftDto | null>(null)
  const [currentShiftId, setCurrentShiftId] = useState<string>('')
  const [loadingShifts, setLoadingShifts] = useState<boolean>(false)

  // Track which shift end alerts have already been triggered today
  const alertedShiftsRef = useRef<Record<string, boolean>>({})

  // Find the active shift dynamically from the plant's shift list
  const findActiveShift = useCallback((shiftList: ShiftDto[], nowSec: number): ShiftDto | null => {
    if (!shiftList || shiftList.length === 0) return null

    // 1. Check if current time falls inside any shift's startTime and endTime
    const active = shiftList.find((s) => {
      const start = timeToSeconds(s.startTime)
      const end = timeToSeconds(s.endTime)
      return isTimeInShift(nowSec, start, end)
    })

    if (active) return active

    // 2. If currently between shifts, find the next upcoming shift
    const upcoming = shiftList.find((s) => timeToSeconds(s.startTime) > nowSec)
    return upcoming || shiftList[0]
  }, [])

  // Check shifts and trigger 10-minute warning alert
  const checkShiftAndTime = useCallback(
    (shiftList: ShiftDto[]) => {
      if (!shiftList || shiftList.length === 0) return

      const nowSec = getCurrentSeconds()
      const active = findActiveShift(shiftList, nowSec)

      if (active) {
        setCurrentShift(active)
        setCurrentShiftId(String(active.id))

        const startSec = timeToSeconds(active.startTime)
        const endSec = timeToSeconds(active.endTime)

        // Check if inside shift window to calculate 10-minute alert
        if (isTimeInShift(nowSec, startSec, endSec)) {
          let remainingSec = endSec - nowSec
          if (remainingSec < 0) {
            remainingSec += 86400 // Wrap around 24 hours for overnight shifts
          }

          // Trigger warning when 10 minutes or less remain (<= 600 seconds)
          if (remainingSec > 0 && remainingSec <= 600) {
            const todayKey = `${active.id}-${new Date().toDateString()}`

            if (!alertedShiftsRef.current[todayKey]) {
              alertedShiftsRef.current[todayKey] = true
              const remainingMinutes = Math.ceil(remainingSec / 60)
              toast.warn(
                `Shift Ending Soon: "${active.shiftName}" shift will end in ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''} (at ${active.endTime}).`,
                {
                  toastId: `shift-end-alert-${active.id}`,
                  autoClose: 10000,
                  pauseOnHover: true
                }
              )
            }
          }
        }
      }
    },
    [findActiveShift]
  )

  // Fetch shifts from API
  const fetchShifts = useCallback(async () => {
    try {
      setLoadingShifts(true)
      if (typeof window !== 'undefined' && (window.api as any)?.getShifts) {
        // Pass plant if your API accepts it, otherwise calls standard getShifts()
        const response = await (window.api as any).getShifts(plant)
        const dataList: ShiftDto[] = Array.isArray(response)
          ? response
          : Array.isArray((response as any)?.data)
            ? (response as any).data
            : []

        setShifts(dataList)

        // Dynamically build dropdown options using this plant's shift names
        const options: ShiftOption[] = dataList.map((item) => ({
          value: String(item.id),
          label: String(item.shiftName ?? `Shift ${item.id}`)
        }))
        setShiftOptions(options)

        // Immediately evaluate current shift based on this plant's timings
        checkShiftAndTime(dataList)
      }
    } catch (error) {
      console.error('Failed to load shifts in useShift hook:', error)
    } finally {
      setLoadingShifts(false)
    }
  }, [plant, checkShiftAndTime])

  // 1. Initial load on mount or plant change
  useEffect(() => {
    fetchShifts()
  }, [fetchShifts])

  // 2. Interval timer: checks shift status every 30 seconds
  useEffect(() => {
    if (shifts.length === 0) {
      return () => {}
    }

    const interval = setInterval(() => {
      checkShiftAndTime(shifts)
    }, 30000)

    return () => clearInterval(interval)
  }, [shifts, checkShiftAndTime])

  // Dynamic Shift Label lookup (returns the exact shiftName from database)
  const getShiftLabel = useCallback(
    (shiftVal: string | number): string => {
      const match = shiftOptions.find((s) => String(s.value) === String(shiftVal))
      if (match) return match.label
      return String(shiftVal || '-')
    },
    [shiftOptions]
  )

  return {
    shifts,
    shiftOptions,
    currentShift,
    currentShiftId,
    loadingShifts,
    refreshShifts: fetchShifts,
    getShiftLabel
  }
}

export default useShift