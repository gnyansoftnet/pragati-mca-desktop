import React, { useState } from 'react'
import { Building2 } from 'lucide-react'
import { useAuth } from '@renderer/context/AuthContext'

interface TopbarOrgNameProps {
  name?: string,
}

export const TopbarOrgName: React.FC<TopbarOrgNameProps> = ({
  name = 'Pragati Milk Products Pvt. Ltd.'
}) => {
  const { user } = useAuth()
  const [pnantName, setPnantName] = useState<string>(user?.plantName)
  const [pnantId, setPnantId] = useState<string>(user?.plant)


  return (
    <div className="flex items-center gap-3 py-1">
      <div className="hidden sm:flex w-8 h-8 rounded-xl bg-teal-50 border border-teal-100 items-center justify-center text-primary shrink-0">
        <Building2 className="w-4 h-4 strokeWidth={2}" />
      </div>
      <div className="overflow-hidden">
        <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-snug truncate">
          {name}
        </h1>
        <p className="text-[11px] text-slate-400 font-medium tracking-wide truncate">
          Chilling Center: {pnantId}{", "}{pnantName}

        </p>
      </div>
    </div>
  )
}

export default TopbarOrgName
