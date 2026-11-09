// import React from 'react'
// import { TopbarToggle } from './components/TopbarToggle'
// import { TopbarOrgName } from './components/TopbarOrgName'
// import { TopbarClock } from './components/TopbarClock'
// import { TopbarUserProfile } from './components/TopbarUserProfile'

// export interface TopbarProps {
//   isSidebarCollapsed: boolean
//   onToggleSidebar: () => void
//   onOpenMobileSidebar: () => void
// }

// export const Topbar: React.FC<TopbarProps> = ({
//   isSidebarCollapsed,
//   onToggleSidebar,
//   onOpenMobileSidebar
// }) => {
//   return (
//     <header className="h-20 backdrop-blur-lg backdrop-saturate-150 bg-white/80 border-b border-slate-100/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none shadow-[0_4px_10px_rgba(15,23,42,0.10)]">
//       {/* Left: Sidebar Toggle & Organisation Name */}
//       <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 pr-4">
//         <TopbarToggle
//           isSidebarCollapsed={isSidebarCollapsed}
//           onToggleSidebar={onToggleSidebar}
//           onOpenMobileSidebar={onOpenMobileSidebar}
//         />

//         <TopbarOrgName />
//       </div>

//       {/* Right: Live Desktop Clock & User Profile with Dropdown */}
//       <div className="flex items-center gap-3 sm:gap-4 shrink-0">
//         <TopbarClock />

//         <div className="h-6 w-px bg-slate-200/80" />

//         <TopbarUserProfile />
//       </div>
//     </header>
//   )
// }

// export default Topbar

import React from 'react'
import { TopbarToggle } from './components/TopbarToggle'
import { TopbarOrgName } from './components/TopbarOrgName'
import { TopbarClock } from './components/TopbarClock'
import { TopbarUserProfile } from './components/TopbarUserProfile'
import { useSerialSnapshot } from '@renderer/hooks/useSerial'
import { Scale, Activity } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export interface TopbarProps {
  isSidebarCollapsed: boolean
  onToggleSidebar: () => void
  onOpenMobileSidebar: () => void
}

export const Topbar: React.FC<TopbarProps> = ({
  isSidebarCollapsed,
  onToggleSidebar,
  onOpenMobileSidebar
}) => {
  const navigate = useNavigate()
  const snap = useSerialSnapshot()

  // Find all weight scales and milk analyzers
  const scalePorts = snap.ports.filter((p) => p.parserType === 'weight')
  const analyzerPorts = snap.ports.filter((p) => p.parserType === 'milkAnalyzer')

  // Check if at least one scale is connected
  const hasConnectedScale = scalePorts.some((p) => p.status === 'connected')
  const hasConnectedAnalyzer = analyzerPorts.some((p) => p.status === 'connected')

  return (
    <header className="h-20 backdrop-blur-lg backdrop-saturate-150 bg-white/80 border-b border-slate-100/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none shadow-[0_4px_10px_rgba(15,23,42,0.10)]">
      {/* Left: Sidebar Toggle & Organisation Name */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 pr-2 sm:pr-4">
        <TopbarToggle
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={onToggleSidebar}
          onOpenMobileSidebar={onOpenMobileSidebar}
        />
        <TopbarOrgName />
      </div>

      {/* Right: Live Machine Status Badges, Clock & User Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Machine Badges Container (Visible on all screen sizes) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Weight Scale Status */}
          {scalePorts.length === 0 ? (
            <button
              type="button"
              onClick={() => navigate('/admin/macine-connection')}
              title="Click to connect Weight Scale"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200/70 transition cursor-pointer"
            >
              <Scale className="w-3.5 h-3.5 text-slate-400" />
              <span className="whitespace-nowrap">Weight Scale: OFF</span>
              <span className="h-2 w-2 rounded-full bg-slate-400" />
            </button>
          ) : (
            scalePorts.map((port, idx) => {
              const isOn = port.status === 'connected'
              return (
                <button
                  key={port.path}
                  type="button"
                  onClick={() => navigate('/admin/macine-connection')}
                  title={`Port: ${port.path} (${port.status})`}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    isOn
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-2xs'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}
                >
                  <Scale className={`w-3.5 h-3.5 ${isOn ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className="whitespace-nowrap">
                    {scalePorts.length > 1 ? `Weight Scale ${idx + 1}` : 'Weight Scale'}:{' '}
                    <strong className={isOn ? 'text-emerald-700' : 'text-slate-500'}>
                      {isOn ? 'ON' : 'OFF'}
                    </strong>
                  </span>
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isOn ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                    }`}
                  />
                </button>
              )
            })
          )}

          {/* Milk Analyzer Status */}
          {analyzerPorts.length === 0 ? (
            <button
              type="button"
              onClick={() => navigate('/admin/macine-connection')}
              title="Click to connect Milk Analyzer"
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200/70 transition cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5 text-slate-400" />
              <span className="whitespace-nowrap">Milk Analyzer: OFF</span>
              <span className="h-2 w-2 rounded-full bg-slate-400" />
            </button>
          ) : (
            analyzerPorts.map((port, idx) => {
              const isOn = port.status === 'connected'
              return (
                <button
                  key={port.path}
                  type="button"
                  onClick={() => navigate('/admin/macine-connection')}
                  title={`Port: ${port.path} (${port.status})`}
                  className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    isOn
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-2xs'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}
                >
                  <Activity
                    className={`w-3.5 h-3.5 ${isOn ? 'text-emerald-600' : 'text-slate-400'}`}
                  />
                  <span className="whitespace-nowrap">
                    {analyzerPorts.length > 1 ? `Milk Analyzer ${idx + 1}` : 'Milk Analyzer'}:{' '}
                    <strong className={isOn ? 'text-emerald-700' : 'text-slate-500'}>
                      {isOn ? 'ON' : 'OFF'}
                    </strong>
                  </span>
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isOn ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                    }`}
                  />
                </button>
              )
            })
          )}
        </div>

        <TopbarClock />

        <div className="h-6 w-px bg-slate-200/80" />

        <TopbarUserProfile />
      </div>
    </header>
  )
}

export default Topbar