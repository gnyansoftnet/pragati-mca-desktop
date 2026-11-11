import React from 'react'
import { Scale, Activity } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSerialSnapshot } from '@renderer/hooks/useSerial'

export const TopbarMachineBadges: React.FC = () => {
  const navigate = useNavigate()
  const snap = useSerialSnapshot()

  // Find all connected weight scales and milk analyzers
  const scalePorts = snap.ports.filter((p) => p.parserType === 'weight')
  const analyzerPorts = snap.ports.filter((p) => p.parserType === 'milkAnalyzer')

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {/* Weight Scale Badges */}
      {scalePorts.length === 0 ? (
        <button
          type="button"
          onClick={() => navigate('/admin/machine-connection')}
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
              onClick={() => navigate('/admin/machine-connection')}
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

      {/* Milk Analyzer Badges */}
      {analyzerPorts.length === 0 ? (
        <button
          type="button"
          onClick={() => navigate('/admin/machine-connection')}
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
              onClick={() => navigate('/admin/machine-connection')}
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
  )
}

export default TopbarMachineBadges