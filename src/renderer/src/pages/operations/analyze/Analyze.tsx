import React, { useState, useEffect } from 'react'
import { Search, Activity, CheckCircle2, Clock, RefreshCw } from 'lucide-react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import PageBreadcrumb from '@renderer/components/breadcrumbs/PageBreadcrumb'
import CustomForm from '@renderer/components/customform/CustomForm'
import Button1 from '@renderer/components/buttons/Button1'
import { useSerialSnapshot } from '@renderer/hooks/useSerial'

import api from '@renderer/services'
import { MilkSampleDto, MilkSampleUpdateDto } from '@shared/dtos/milk-collection/milk-sample.dto'

export const Analyze: React.FC = () => {
  // Current Date default
  const getCurrentLocalDate = (): string => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const [date, setDate] = useState<string>(getCurrentLocalDate())
  const [shift, setShift] = useState<string>('1')
  const [plant, setPlant] = useState<string>('1102')
  const [samples, setSamples] = useState<MilkSampleDto[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [updatingSampleId, setUpdatingSampleId] = useState<number | null>(null)
  const [selectedPorts, setSelectedPorts] = useState<Record<number, string>>({})

  // Live serial snapshot to detect connected Milk Analyzer ports
  const snap = useSerialSnapshot()
  const connectedAnalyzers = snap.ports.filter(
    (p) => p.parserType === 'milkAnalyzer' && p.status === 'connected'
  )

  const shifts = [
    { value: '1', label: 'Morning' },
    { value: '2', label: 'Evening' }
  ]

  const plantOptions = [
    { value: '1102', label: 'Raipur' },
    { value: '1103', label: 'Jagatpur' }
  ]

  // 1. Fetch samples when user clicks "Find"
  const fetchMilkSamples = async () => {
    try {
      setLoading(true)
      const result = await api.sample.getMilkSamples(date, Number(shift), plant)
      setSamples(Array.isArray(result) ? result : [])
      toast.success(`Found ${result?.length || 0} milk samples.`)
    } catch (error) {
      console.error('Failed to fetch milk samples:', error)
      toast.error('Failed to fetch milk samples.')
    } finally {
      setLoading(false)
    }
  }

  // 2. Instant update when a port is chosen for a sample row
  // Instant update when a port is chosen for a sample row
  const handlePortChange = async (sample: MilkSampleDto, chosenPort: string) => {
    if (!chosenPort) return
    try {
      setUpdatingSampleId(sample.id)
      // Save chosen port into local state so it stays selected after refresh
      setSelectedPorts((prev) => ({ ...prev, [sample.id]: chosenPort }))

      const payload = {
        sampleDate: date,
        shift: Number(shift),
        plant: plant,
        sampleCode: String(sample.sampleCode),
        fat: Number(snap.readings.fat?.value ?? sample.fat ?? 0),
        snf: Number(snap.readings.snf?.value ?? sample.snf ?? 0)
      }

      await api.sample.updateMilkSample(payload)
      toast.success(`Sample #${sample.sampleCode} updated via ${chosenPort}`)
      await fetchMilkSamples() // Refresh table
    } catch (error) {
      console.error('Failed to update analysis:', error)
      toast.error('Failed to update analysis.')
    } finally {
      setUpdatingSampleId(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Toast Alert Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageBreadcrumb title="Analyze" desc="Test milk samples with connected Milk Analyzer" />

        {/* Analyzer Connection Status Indicator */}
        <div className="flex items-center gap-2">
          {connectedAnalyzers.length > 0 ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {connectedAnalyzers.length}{' '}
              {connectedAnalyzers.length === 1 ? 'Analyzer Connected' : 'Analyzers Connected'}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <Activity className="w-3.5 h-3.5 text-amber-600" />
              No Analyzer Connected
            </span>
          )}
        </div>
      </div>

      {/* Filter Parameters Form */}
      <div className="mt-2 p-3 sm:p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
        <CustomForm
          onSubmit={(e) => {
            e.preventDefault()
            fetchMilkSamples()
          }}
          className="w-full"
        >
          <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-2.5 items-end">
            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Date</label>
              <CustomForm.CustomDateField
                name="date"
                value={date}
                onChange={(e: any) => setDate(e.target.value)}
              />
            </div>

            {/* Shift */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Select Shift</label>
              <CustomForm.CustomSelectSearchField
                name="shift"
                value={shift}
                onChange={(e: any) => setShift(e.target.value)}
                options={shifts}
              />
            </div>

            {/* Chilling Center */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Chilling Center</label>
              <CustomForm.CustomSelectField
                name="chilling"
                value={plant}
                onChange={(e: any) => setPlant(e.target.value)}
                options={plantOptions}
              />
            </div>

            {/* Find Button */}
            <div className="flex justify-end">
              <Button1
                variant="primary"
                icon={<Search className="w-3.5 h-3.5 text-white" />}
                label={loading ? 'Searching...' : 'Find'}
                onClick={fetchMilkSamples}
                disabled={loading}
              />
            </div>
          </div>
        </CustomForm>
      </div>

      {/* Samples Table */}
      <div className="mt-2 p-3 sm:p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-500/10 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-3 whitespace-nowrap">Sample No</th>
                <th className="py-3 px-3 whitespace-nowrap min-w-[200px]">Analyzer Port</th>
                <th className="py-3 px-3 whitespace-nowrap">Net Weight (LTR)</th>
                <th className="py-3 px-3 whitespace-nowrap">FAT (%)</th>
                <th className="py-3 px-3 whitespace-nowrap">SNF (%)</th>
                <th className="py-3 px-3 whitespace-nowrap text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                      <span>Loading milk samples...</span>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && samples.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                    No samples found. Click &quot;Find&quot; to load pending milk samples.
                  </td>
                </tr>
              )}

              {!loading &&
                samples.map((item, index) => {
                  const isAnalyzed = Number(item.isAnalyse) === 1
                  const isUpdating = updatingSampleId === item.id

                  return (
                    <tr key={item.id ?? index} className="hover:bg-slate-50/70 transition">
                      {/* Sample No */}
                      <td className="py-1 px-3 font-bold text-primary">{item.sampleCode}</td>

                      {/* Port Dropdown Column */}
                      {/* Port Dropdown Column */}
                      <td className="py-1 px-3">
                        <select
                          value={selectedPorts[item.id] || ''}
                          disabled={isUpdating || connectedAnalyzers.length === 0}
                          onChange={(e) => handlePortChange(item, e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed"
                        >
                          <option value="">
                            {connectedAnalyzers.length === 0
                              ? 'No Analyzer Connected'
                              : 'Select Port to Analyze...'}
                          </option>
                          {connectedAnalyzers.map((port, idx) => (
                            <option key={port.path} value={port.path}>
                              {connectedAnalyzers.length > 1
                                ? `Analyzer ${idx + 1} (${port.path})`
                                : port.path}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Net Weight */}
                      <td className="py-1 px-3 font-semibold text-slate-800">
                        {item.netWeight ?? '0.0'}
                      </td>

                      {/* FAT % */}
                      <td className="py-1 px-3 font-bold text-slate-800">
                        {item.fat !== undefined ? Number(item.fat).toFixed(1) : '0.0'}%
                      </td>

                      {/* SNF % */}
                      <td className="py-1 px-3 font-bold text-slate-800">
                        {item.snf !== undefined ? Number(item.snf).toFixed(1) : '0.0'}%
                      </td>

                      {/* Status */}
                      <td className="py-1 px-3 text-center">
                        {isUpdating ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary animate-pulse">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            Updating...
                          </span>
                        ) : isAnalyzed ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Analyzed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Analyze
