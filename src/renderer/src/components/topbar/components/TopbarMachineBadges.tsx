import React, { useState, useRef, useEffect } from 'react'
import { Scale, Activity, ChevronDown, Cable } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSerialSnapshot } from '@renderer/hooks/useSerial'
import { analyzerName, ParserType } from '@shared/dtos/connection/serial-com-port.dto'

const ANALYZER_SLOTS: ParserType[] = ['analyzer-1', 'analyzer-2', 'analyzer-3', 'analyzer-4']

export const TopbarMachineBadges: React.FC = () => {
  const navigate = useNavigate()
  const snap = useSerialSnapshot()
  const [openMenu, setOpenMenu] = useState<'weight' | 'analyzer' | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Weight Scale (1 machine)
  const scalePort = snap.ports.find((p) => p.parserType === 'weight')
  const isScaleOn = scalePort?.status === 'connected'

  // Milk Analyzers (4 machines)
  const analyzerSlots = ANALYZER_SLOTS.map((slot) => {
    const port = snap.ports.find((p) => p.parserType === slot)
    return {
      slot,
      label: analyzerName(slot),
      port,
      isOn: port?.status === 'connected'
    }
  })
  const connectedAnalyzersCount = analyzerSlots.filter((a) => a.isOn).length

  const goToMachineConnection = () => {
    setOpenMenu(null)
    navigate('/admin/machine-connection')
  }

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 select-none" ref={containerRef}>
      {/* Weight Scale Dropdown */}
      <div className="relative">
        <button
          type="button"
          title="Weight Scale Status"
          onClick={() => setOpenMenu(openMenu === 'weight' ? null : 'weight')}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold border transition cursor-pointer ${
            isScaleOn
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-2xs hover:bg-emerald-100/70'
              : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200/70'
          }`}
        >
          <Scale className={`w-3 h-3 ${isScaleOn ? 'text-emerald-600' : 'text-slate-400'}`} />
          <span className="whitespace-nowrap">
            {/* <span className="hidden sm:inline">Scale: </span> */}
            <strong className={isScaleOn ? 'text-emerald-700' : 'text-slate-500'}>
              {isScaleOn ? 'ON' : 'OFF'}
            </strong>
          </span>
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isScaleOn ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
            }`}
          />
          <ChevronDown
            className={`w-3 h-3 transition-transform ${openMenu === 'weight' ? 'rotate-180' : ''}`}
          />
        </button>

        {openMenu === 'weight' && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
            <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Weight Scale Report</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {isScaleOn ? '1/1 ON' : '0/1 ON'}
              </span>
            </div>

            <div className="p-2">
              <div className="flex items-center justify-between px-2.5 py-2 rounded-xl bg-slate-50/70">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800">Weight Scale</p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {scalePort ? `Port: ${scalePort.path}` : 'Not connected'}
                  </p>
                  {scalePort?.error && (
                    <p className="text-[10px] text-rose-500 truncate">{scalePort.error}</p>
                  )}
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    isScaleOn
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isScaleOn ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}
                  />
                  {isScaleOn ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-1.5 px-2">
              <button
                type="button"
                onClick={goToMachineConnection}
                className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-primary hover:bg-slate-50 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Cable className="w-3.5 h-3.5" />
                <span>Manage Connection</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Milk Analyzers Dropdown (All 4 Machines) */}
      <div className="relative">
        <button
          type="button"
          title="Milk Analyzers Status"
          onClick={() => setOpenMenu(openMenu === 'analyzer' ? null : 'analyzer')}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold border transition cursor-pointer ${
            connectedAnalyzersCount > 0
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-2xs hover:bg-emerald-100/70'
              : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200/70'
          }`}
        >
          <Activity
            className={`w-3 h-3 ${
              connectedAnalyzersCount > 0 ? 'text-emerald-600' : 'text-slate-400'
            }`}
          />
          <span className="whitespace-nowrap">
            {/* <span className="hidden sm:inline">Analyzers: </span> */}
            <strong className={connectedAnalyzersCount > 0 ? 'text-emerald-700' : 'text-slate-500'}>
              {connectedAnalyzersCount}/4
            </strong>
          </span>
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              connectedAnalyzersCount > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
            }`}
          />
          <ChevronDown
            className={`w-3 h-3 transition-transform ${
              openMenu === 'analyzer' ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openMenu === 'analyzer' && (
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
            <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Milk Analyzers Report</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {connectedAnalyzersCount}/4 ON
              </span>
            </div>

            <div className="p-2 space-y-1.5">
              {analyzerSlots.map(({ slot, label, port, isOn }) => (
                <div
                  key={slot}
                  className="flex items-center justify-between px-2.5 py-2 rounded-xl bg-slate-50/70"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800">{label}</p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {port ? `Port: ${port.path}` : 'Not connected'}
                    </p>
                    {port?.error && (
                      <p className="text-[10px] text-rose-500 truncate">{port.error}</p>
                    )}
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                      isOn
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isOn ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}
                    />
                    {isOn ? 'ON' : 'OFF'}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-1.5 px-2">
              <button
                type="button"
                onClick={goToMachineConnection}
                className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-primary hover:bg-slate-50 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Cable className="w-3.5 h-3.5" />
                <span>Manage Connections</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TopbarMachineBadges
