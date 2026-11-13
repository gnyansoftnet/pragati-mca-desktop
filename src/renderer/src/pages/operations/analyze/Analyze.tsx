import React, { useState, useEffect } from 'react'
import { Search, Activity, CheckCircle2, Clock, RefreshCw } from 'lucide-react'
import { toast } from 'react-toastify'
import { useAuth } from '@renderer/context/AuthContext'
import PageBreadcrumb from '@renderer/components/breadcrumbs/PageBreadcrumb'
import CustomForm from '@renderer/components/customform/CustomForm'
import Button1 from '@renderer/components/buttons/Button1'
import { useSerialSnapshot } from '@renderer/hooks/useSerial'

import api from '@renderer/services'
import { MilkSampleDto, MilkSampleUpdateDto } from '@shared/dtos/milk-collection/milk-sample.dto'
import { analyzerName, isAnalyzer } from '@shared/dtos/connection/serial-com-port.dto'

export const Analyze: React.FC = () => {
  const { user } = useAuth()

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
  const [plant, setPlant] = useState<string>(user?.plant)

  const [samples, setSamples] = useState<MilkSampleDto[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [updatingSampleId, setUpdatingSampleId] = useState<number | null>(null)
  const [selectedPorts, setSelectedPorts] = useState<Record<number, string>>({})
  const [activeSampleId, setActiveSampleId] = useState<number | null>(null)

  // Live serial snapshot to detect connected Milk Analyzer ports
  const snap = useSerialSnapshot()
  const connectedAnalyzers = snap.ports
    .filter((p) => isAnalyzer(p.parserType) && p.status === 'connected')
    .sort((a, b) => a.parserType.localeCompare(b.parserType))

  const shifts = [
    { value: '1', label: 'Morning' },
    { value: '2', label: 'Evening' }
  ]

  // const plantOptions = [
  //   { value: '1102', label: 'Raipur' },
  //   { value: '1103', label: 'Jagatpur' }
  // ]

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

  // Set to true while testing without physical hardware, false in production
  const IS_TEST_MODE = false
  const DEFAULT_TEST_FAT = 4.2
  const DEFAULT_TEST_SNF = 8.5

  // Lookup live FAT/SNF for a specific analyzer ("analyzer-1" ... "analyzer-4")
  const getLiveReading = (analyzerRole?: string) => {
    if (!analyzerRole) return { fat: null as number | null, snf: null as number | null }
    const rawFat = snap.readings[`${analyzerRole}.fat`]?.value
    const rawSnf = snap.readings[`${analyzerRole}.snf`]?.value
    return {
      fat: rawFat !== undefined ? Number(rawFat) : IS_TEST_MODE ? DEFAULT_TEST_FAT : null,
      snf: rawSnf !== undefined ? Number(rawSnf) : IS_TEST_MODE ? DEFAULT_TEST_SNF : null
    }
  }

  // 1. On dropdown change: select analyzer & track this sample as active
  const handlePortSelect = (sample: MilkSampleDto, chosenAnalyzer: string) => {
    if (!chosenAnalyzer) {
      setSelectedPorts((prev) => {
        const next = { ...prev }
        delete next[sample.id]
        return next
      })
      if (activeSampleId === sample.id) {
        setActiveSampleId(null)
      }
      return
    }
    setSelectedPorts((prev) => ({ ...prev, [sample.id]: chosenAnalyzer }))
    setActiveSampleId(sample.id)
    toast.info(
      `${analyzerName(chosenAnalyzer)} selected for Sample #${sample.sampleCode}. Ready for reading.`
    )
  }

  // 2. Global Enter key listener: saves the active sample with machine readings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Enter') return
      // Don't intercept Enter if user is typing in date/search inputs
      const target = e.target as HTMLElement | null
      const tagName = target?.tagName
      if (tagName === 'INPUT' || tagName === 'TEXTAREA') {
        return
      }
      // 1. Check current active sample
      let targetSample = samples.find(
        (s) => s.id === activeSampleId && selectedPorts[s.id] && Number(s.isAnalyse) !== 1
      )
      // 2. Fallback: find any pending sample with port selected and live readings > 0
      if (!targetSample) {
        targetSample = samples.find((s) => {
          const port = selectedPorts[s.id]
          if (!port || Number(s.isAnalyse) === 1) return false
          const { fat, snf } = getLiveReading(port)
          return (fat ?? 0) > 0 || (snf ?? 0) > 0
        })
      }
      if (targetSample && updatingSampleId === null) {
        e.preventDefault()
        handleSubmitSample(targetSample)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeSampleId, samples, selectedPorts, updatingSampleId, snap.readings, date, shift, plant])

  // 2. Submit only when valid machine data (> 0.0) arrives for that row's analyzer
  const handleSubmitSample = async (sample: MilkSampleDto) => {
    const chosenAnalyzer = selectedPorts[sample.id]
    if (!chosenAnalyzer) {
      toast.warn('Please select an Analyzer Port first.')
      return
    }

    const { fat: liveFat, snf: liveSnf } = getLiveReading(chosenAnalyzer)
    const fatToSubmit = liveFat !== null ? liveFat : Number(sample.fat ?? 0)
    const snfToSubmit = liveSnf !== null ? liveSnf : Number(sample.snf ?? 0)

    if (fatToSubmit <= 0 && snfToSubmit <= 0) {
      toast.error('Cannot submit: Machine reading is 0.0! Please wait for analyzer reading.')
      return
    }

    try {
      setUpdatingSampleId(sample.id)
      const payload = {
        sampleDate: date,
        shift: Number(shift),
        plant: String(user?.plant || plant),
        sampleCode: String(sample.sampleCode),
        fat: fatToSubmit,
        snf: snfToSubmit
      }

      await api.sample.updateMilkSample(payload)

      // Clear only this analyzer's readings so old FAT/SNF cannot be reused
      if (window.api?.clearSerialReadings) {
        await window.api.clearSerialReadings([
          `${chosenAnalyzer}.fat`,
          `${chosenAnalyzer}.snf`,
          `${chosenAnalyzer}.wtr`,
          `${chosenAnalyzer}.temp`
        ])
      }

      setSelectedPorts((prev) => {
        const next = { ...prev }
        delete next[sample.id]
        return next
      })
      setActiveSampleId(null)

      toast.success(
        `Sample #${sample.sampleCode} submitted! (FAT: ${fatToSubmit.toFixed(2)}%, SNF: ${snfToSubmit.toFixed(2)}%)`
      )
      await fetchMilkSamples()
    } catch (error) {
      console.error('Failed to submit analysis:', error)
      toast.error('Failed to submit analysis.')
    } finally {
      setUpdatingSampleId(null)
    }
  }

  return (
    <div className="space-y-4">
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
              <CustomForm.CustomTextField
                name="chilling"
                value={user?.plantName || user?.plant || ''}
                readOnly={true}
                tabIndex={-1}
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
                <th className="py-3 px-3 whitespace-nowrap min-w-30">Analyzer Port</th>
                <th className="py-3 px-3 whitespace-nowrap">Net Weight (LTR)</th>
                <th className="py-3 px-3 whitespace-nowrap">FAT (%)</th>
                <th className="py-3 px-3 whitespace-nowrap">SNF (%)</th>
                <th className="py-3 px-3 whitespace-nowrap text-center">Status</th>
                <th className="py-3 px-3 whitespace-nowrap text-center">Action</th>
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
                  const selectedAnalyzer = selectedPorts[item.id]
                  const { fat: liveFat, snf: liveSnf } = getLiveReading(selectedAnalyzer)

                  return (
                    <tr
                      key={item.id ?? index}
                      onClick={() => {
                        if (!isAnalyzed) {
                          setActiveSampleId(item.id)
                        }
                      }}
                      className={`hover:bg-slate-50/70 transition cursor-pointer ${
                        activeSampleId === item.id ? 'bg-primary/5' : ''
                      }`}
                    >
                      <td className="py-1 px-3 font-bold text-primary">{item.sampleCode}</td>

                      <td className="py-1 px-3">
                        <select
                          value={selectedAnalyzer || ''}
                          disabled={isUpdating || isAnalyzed || connectedAnalyzers.length === 0}
                          onChange={(e) => handlePortSelect(item, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleSubmitSample(item)
                            }
                          }}
                          className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed"
                        >
                          <option value="">
                            {connectedAnalyzers.length === 0
                              ? 'No Analyzer Connected'
                              : 'Select Analyzer to Read...'}
                          </option>
                          {connectedAnalyzers.map((port) => (
                            <option key={port.path} value={port.parserType}>
                              {analyzerName(port.parserType)} ({port.path})
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
                        {isAnalyzed ? (
                          <span className="text-slate-800">
                            {Number(item.fat ?? 0).toFixed(1)}%
                          </span>
                        ) : selectedPorts[item.id] && liveFat !== null && liveFat > 0 ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-extrabold">
                            {liveFat.toFixed(1)}%
                            <span className="text-[9px] px-1 py-0.2 bg-emerald-100 text-emerald-700 rounded-xs font-semibold uppercase">
                              Live
                            </span>
                          </span>
                        ) : (
                          <span className="text-slate-400">0.0%</span>
                        )}
                      </td>

                      {/* SNF % */}
                      <td className="py-1 px-3 font-bold text-slate-800">
                        {isAnalyzed ? (
                          <span className="text-slate-800">
                            {Number(item.snf ?? 0).toFixed(1)}%
                          </span>
                        ) : selectedPorts[item.id] && liveSnf !== null && liveSnf > 0 ? (
                          <span className="inline-flex items-center gap-1 text-blue-600 font-extrabold">
                            {liveSnf.toFixed(1)}%
                            <span className="text-[9px] px-1 py-0.2 bg-blue-100 text-blue-700 rounded-xs font-semibold uppercase">
                              Live
                            </span>
                          </span>
                        ) : (
                          <span className="text-slate-400">0.0%</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-1 px-3 text-center">
                        {isUpdating ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary animate-pulse">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            Saving...
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

                      {/* Action: Save Button (Active ONLY when port is selected & machine reading > 0.0) */}
                      <td className="py-1 px-3 text-center">
                        {isAnalyzed ? (
                          <span className="text-[11px] text-slate-400 font-medium">Done</span>
                        ) : (
                          <button
                            type="button"
                            disabled={
                              isUpdating ||
                              !selectedPorts[item.id] ||
                              ((liveFat ?? 0) <= 0 && (liveSnf ?? 0) <= 0)
                            }
                            onClick={() => handleSubmitSample(item)}
                            title={
                              !selectedPorts[item.id]
                                ? 'Select port first'
                                : (liveFat ?? 0) <= 0
                                  ? 'Waiting for analyzer reading > 0.0'
                                  : 'Click or press Enter to save machine reading'
                            }
                            className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer inline-flex items-center justify-center gap-1.5 ${
                              selectedPorts[item.id] && ((liveFat ?? 0) > 0 || (liveSnf ?? 0) > 0)
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs ring-2 ring-emerald-300'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                            }`}
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Save (Enter)</span>
                          </button>
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
