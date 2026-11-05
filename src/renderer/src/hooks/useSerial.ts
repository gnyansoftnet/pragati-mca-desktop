import { SerialSnapshot } from '@shared/dtos/connection/serial-com-port.dto'
import { useEffect, useState } from 'react'

export function useSerialSnapshot() {
  const [snap, setSnap] = useState<SerialSnapshot>({ readings: {}, ports: [] })

  // useEffect(() => {
  //   let active = true
  //   window.api.getSnapshot.then((s) => active && setSnap(s))
  //     .catch(() => {})
  //   const off = window.api.onSnapshot(setSnap)
  //   return () => {
  //     active = false
  //     off()
  //   }
  // }, [])

  useEffect(() => {
    let active = true

    window.api
      .getSnapshot()
      .then((s) => {
        if (active) setSnap(s)
      })
      .catch(() => {})

    const off = window.api.onSerialSnapshot((s) => {
      if (active) setSnap(s)
    })
    return () => {
      active = false
      off()
    }
  }, [])

  return snap
}
