// import { SerialSnapshot } from '@shared/dtos/connection/serial-com-port.dto'
// import { useEffect, useState } from 'react'

// export function useSerialSnapshot() {
//   const [snap, setSnap] = useState<SerialSnapshot>({ readings: {}, ports: [] })

//   useEffect(() => {
//     let active = true

//     window.api
//       .getSnapshot()
//       .then((s) => {
//         if (active) setSnap(s)
//       })
//       .catch(() => {})

//     const off = window.api.onSerialSnapshot((s) => {
//       if (active) setSnap(s)
//     })
//     return () => {
//       active = false
//       off()
//     }
//   }, [])

//   return snap
// }


import { SerialSnapshot } from '@shared/dtos/connection/serial-com-port.dto'
import { useEffect, useState } from 'react'

// Shared module-level state so Topbar, MachineConnection & ProcurementCollection always share the exact same snapshot
let globalSnapshot: SerialSnapshot = { readings: {}, ports: [] }
const listeners = new Set<(s: SerialSnapshot) => void>()

function updateGlobalSnapshot(newSnap: SerialSnapshot) {
  globalSnapshot = newSnap
  listeners.forEach((cb) => cb(newSnap))
}

// Function that any component can call to immediately refresh all components
export function refreshSerialSnapshot() {
  if (typeof window !== 'undefined' && window.api?.getSnapshot) {
    window.api
      .getSnapshot()
      .then((s) => {
        if (s) updateGlobalSnapshot(s)
      })
      .catch(() => {})
  }
}

export function useSerialSnapshot() {
  const [snap, setSnap] = useState<SerialSnapshot>(globalSnapshot)

  useEffect(() => {
    listeners.add(setSnap)

    // Initial fetch on mount
    refreshSerialSnapshot()

    // Listen to live IPC pushes from Electron main process
    const off = window.api.onSerialSnapshot((s) => {
      if (s) updateGlobalSnapshot(s)
    })

    // Refresh when user switches back to the app window
    window.addEventListener('focus', refreshSerialSnapshot)

    // 1.5s background sync to guarantee Topbar and all pages stay accurate
    const timer = setInterval(refreshSerialSnapshot, 1500)

    return () => {
      listeners.delete(setSnap)
      off()
      window.removeEventListener('focus', refreshSerialSnapshot)
      clearInterval(timer)
    }
  }, [])

  return snap
}