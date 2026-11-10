import React from 'react'
import { Wifi, WifiOff } from 'lucide-react'
import { useNetwork } from '@renderer/hooks/useNetwork'

export const TopbarInternetBadge: React.FC = () => {
  const { isOnline } = useNetwork()

  return isOnline ? (
    <div
      title="Internet Connection: Connected"
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 select-none shadow-2xs"
    >
      <Wifi className="w-3.5 h-3.5 text-emerald-600" />
      <span className="hidden sm:inline">Internet: </span>ON
      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
    </div>
  ) : (
    <div
      title="Internet Connection: Disconnected"
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 select-none"
    >
      <WifiOff className="w-3.5 h-3.5 text-rose-500" />
      <span className="hidden sm:inline">Internet: </span>OFF
      <span className="h-2 w-2 rounded-full bg-rose-500" />
    </div>
  )
}

export default TopbarInternetBadge