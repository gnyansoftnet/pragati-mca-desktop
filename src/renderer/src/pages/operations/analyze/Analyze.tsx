// import React, { useState, useEffect } from 'react'
// import { Search, Activity, CheckCircle2, Clock, RefreshCw } from 'lucide-react'
// import { toast } from 'react-toastify'
// import { useAuth } from '@renderer/context/AuthContext'
// import PageBreadcrumb from '@renderer/components/breadcrumbs/PageBreadcrumb'
// import CustomForm from '@renderer/components/customform/CustomForm'
// import Button1 from '@renderer/components/buttons/Button1'
// import { useSerialSnapshot } from '@renderer/hooks/useSerial'

// import api from '@renderer/services'
// import { MilkSampleDto, MilkSampleUpdateDto } from '@shared/dtos/milk-collection/milk-sample.dto'
// import { analyzerName, isAnalyzer } from '@shared/dtos/connection/serial-com-port.dto'
// import useShift from '@renderer/hooks/useShift'

// export const Analyze: React.FC = () => {
//   const { user } = useAuth()
//   const { shiftOptions, currentShiftId, getShiftLabel } = useShift(user?.plant)

//   // Current Date default
//   const getCurrentLocalDate = (): string => {
//     const today = new Date()
//     const year = today.getFullYear()
//     const month = String(today.getMonth() + 1).padStart(2, '0')
//     const day = String(today.getDate()).padStart(2, '0')
//     return `${year}-${month}-${day}`
//   }

//   const [date, setDate] = useState<string>(getCurrentLocalDate())
//   const [shift, setShift] = useState<string>(currentShiftId)
//   useEffect(() => {
//     if (currentShiftId) {
//       setShift(currentShiftId)
//     }
//   }, [currentShiftId])

//   const [plant, setPlant] = useState<string>(user?.plant)

//   const [samples, setSamples] = useState<MilkSampleDto[]>([])
//   const [loading, setLoading] = useState<boolean>(false)
//   const [updatingSampleId, setUpdatingSampleId] = useState<number | null>(null)
//   const [selectedPorts, setSelectedPorts] = useState<Record<number, string>>({})
//   const [activeSampleId, setActiveSampleId] = useState<number | null>(null)

//   // Live serial snapshot to detect connected Milk Analyzer ports
//   const snap = useSerialSnapshot()
//   const connectedAnalyzers = snap.ports
//     .filter((p) => isAnalyzer(p.parserType) && p.status === 'connected')
//     .sort((a, b) => a.parserType.localeCompare(b.parserType))

//   // const shifts = [
//   //   { value: '1', label: 'Morning' },
//   //   { value: '2', label: 'Evening' }
//   // ]
//   const shifts = shiftOptions

//   // const plantOptions = [
//   //   { value: '1102', label: 'Raipur' },
//   //   { value: '1103', label: 'Jagatpur' }
//   // ]

//   // 1. Fetch samples when user clicks "Find"
//   const fetchMilkSamples = async () => {
//     try {
//       setLoading(true)
//       const result = await api.sample.getMilkSamples(date, Number(shift), plant)
//       setSamples(Array.isArray(result) ? result : [])
//       toast.success(`Found ${result?.length || 0} milk samples.`)
//     } catch (error) {
//       console.error('Failed to fetch milk samples:', error)
//       toast.error('Failed to fetch milk samples.')
//     } finally {
//       setLoading(false)
//     }
//   }

//   // Set to true while testing without physical hardware, false in production
//   const IS_TEST_MODE = false
//   const DEFAULT_TEST_FAT = 4.2
//   const DEFAULT_TEST_SNF = 8.5

//   // Lookup live FAT/SNF for a specific analyzer ("analyzer-1" ... "analyzer-4")
//   const getLiveReading = (analyzerRole?: string) => {
//     if (!analyzerRole) return { fat: null as number | null, snf: null as number | null }
//     const rawFat = snap.readings[`${analyzerRole}.fat`]?.value
//     const rawSnf = snap.readings[`${analyzerRole}.snf`]?.value
//     return {
//       fat: rawFat !== undefined ? Number(rawFat) : IS_TEST_MODE ? DEFAULT_TEST_FAT : null,
//       snf: rawSnf !== undefined ? Number(rawSnf) : IS_TEST_MODE ? DEFAULT_TEST_SNF : null
//     }
//   }

//   // 1. On dropdown change: select analyzer & track this sample as active
//   const handlePortSelect = (sample: MilkSampleDto, chosenAnalyzer: string) => {
//     if (!chosenAnalyzer) {
//       setSelectedPorts((prev) => {
//         const next = { ...prev }
//         delete next[sample.id]
//         return next
//       })
//       if (activeSampleId === sample.id) {
//         setActiveSampleId(null)
//       }
//       return
//     }
//     setSelectedPorts((prev) => ({ ...prev, [sample.id]: chosenAnalyzer }))
//     setActiveSampleId(sample.id)
//     // toast.info(
//     //   `${analyzerName(chosenAnalyzer)} selected for Sample #${sample.sampleCode}. Ready for reading.`
//     // )
//   }

//   // 2. Global Enter key listener: saves the active sample with machine readings
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key !== 'Enter') return
//       // Don't intercept Enter if user is typing in date/search inputs
//       const target = e.target as HTMLElement | null
//       const tagName = target?.tagName
//       if (tagName === 'INPUT' || tagName === 'TEXTAREA') {
//         return
//       }
//       // 1. Check current active sample
//       let targetSample = samples.find(
//         (s) => s.id === activeSampleId && selectedPorts[s.id] && Number(s.isAnalyse) !== 1
//       )
//       // 2. Fallback: find any pending sample with port selected and live readings > 0
//       if (!targetSample) {
//         targetSample = samples.find((s) => {
//           const port = selectedPorts[s.id]
//           if (!port || Number(s.isAnalyse) === 1) return false
//           const { fat, snf } = getLiveReading(port)
//           return (fat ?? 0) > 0 || (snf ?? 0) > 0
//         })
//       }
//       if (targetSample && updatingSampleId === null) {
//         e.preventDefault()
//         handleSubmitSample(targetSample)
//       }
//     }
//     window.addEventListener('keydown', handleKeyDown)
//     return () => window.removeEventListener('keydown', handleKeyDown)
//   }, [activeSampleId, samples, selectedPorts, updatingSampleId, snap.readings, date, shift, plant])

//   // 2. Submit only when valid machine data (> 0.0) arrives for that row's analyzer
//   const handleSubmitSample = async (sample: MilkSampleDto) => {
//     const chosenAnalyzer = selectedPorts[sample.id]
//     if (!chosenAnalyzer) {
//       toast.warn('Please select an Analyzer Port first.')
//       return
//     }

//     const { fat: liveFat, snf: liveSnf } = getLiveReading(chosenAnalyzer)
//     const fatToSubmit = liveFat !== null ? liveFat : Number(sample.fat ?? 0)
//     const snfToSubmit = liveSnf !== null ? liveSnf : Number(sample.snf ?? 0)

//     if (fatToSubmit <= 0 && snfToSubmit <= 0) {
//       toast.error('Cannot submit: Machine reading is 0.0! Please wait for analyzer reading.')
//       return
//     }

//     try {
//       setUpdatingSampleId(sample.id)
//       const payload = {
//         sampleDate: date,
//         shift: Number(shift),
//         plant: String(user?.plant || plant),
//         sampleCode: String(sample.sampleCode),
//         fat: fatToSubmit,
//         snf: snfToSubmit
//       }

//       await api.sample.updateMilkSample(payload)

//       // Clear only this analyzer's readings so old FAT/SNF cannot be reused
//       if (window.api?.clearSerialReadings) {
//         await window.api.clearSerialReadings([
//           `${chosenAnalyzer}.fat`,
//           `${chosenAnalyzer}.snf`,
//           `${chosenAnalyzer}.wtr`,
//           `${chosenAnalyzer}.temp`
//         ])
//       }

//       setSelectedPorts((prev) => {
//         const next = { ...prev }
//         delete next[sample.id]
//         return next
//       })
//       setActiveSampleId(null)

//       toast.success(
//         `Sample #${sample.sampleCode} submitted! (FAT: ${fatToSubmit.toFixed(2)}%, SNF: ${snfToSubmit.toFixed(2)}%)`
//       )
//       await fetchMilkSamples()
//     } catch (error) {
//       console.error('Failed to submit analysis:', error)
//       toast.error('Failed to submit analysis.')
//     } finally {
//       setUpdatingSampleId(null)
//     }
//   }

//   return (
//     <div className="space-y-3">
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <PageBreadcrumb
//           title="Analyze"
//           //  desc="Test milk samples with connected Milk Analyzer"
//         />

//         {/* Analyzer Connection Status Indicator */}
//         <div className="flex items-center gap-2">
//           {connectedAnalyzers.length > 0 ? (
//             <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
//               <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
//               {connectedAnalyzers.length}{' '}
//               {connectedAnalyzers.length === 1 ? 'Analyzer Connected' : 'Analyzers Connected'}
//             </span>
//           ) : (
//             <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
//               <Activity className="w-3.5 h-3.5 text-amber-600" />
//               No Analyzer Connected
//             </span>
//           )}
//         </div>
//       </div>

//       {/* Filter Parameters Form */}
//       <div className="mt-2 p-3 sm:p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
//         <CustomForm
//           onSubmit={(e) => {
//             e.preventDefault()
//             fetchMilkSamples()
//           }}
//           className="w-full"
//         >
//           <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-2.5 items-end">
//             {/* Date */}
//             <div className="space-y-1.5">
//               <label className="text-xs font-semibold text-slate-700">Date</label>
//               <CustomForm.CustomDateField
//                 name="date"
//                 value={date}
//                 onChange={(e: any) => setDate(e.target.value)}
//                 readOnly={true}
//               />
//             </div>

//             {/* Shift */}
//             <div className="space-y-1.5">
//               <label className="text-xs font-semibold text-slate-700">Select Shift</label>
//               <CustomForm.CustomSelectField
//                 name="shift"
//                 value={shift}
//                 onChange={(e: any) => setShift(e.target.value)}
//                 options={shifts}
//                 tabIndex={1}
//                 readOnly={true}
//               />
//             </div>

//             {/* Chilling Center */}
//             <div className="space-y-1.5">
//               <label className="text-xs font-semibold text-slate-700">Chilling Center</label>
//               <CustomForm.CustomTextField
//                 name="chilling"
//                 value={`${user?.plant || ''}, ${user?.plantName || ''}`}
//                 readOnly={true}
//                 tabIndex={-1}
//               />
//             </div>

//             {/* Find Button */}
//             <div className="flex justify-end">
//               <Button1
//                 variant="primary"
//                 icon={<Search className="w-3.5 h-3.5 text-white" />}
//                 label={loading ? 'Searching...' : 'Find'}
//                 onClick={fetchMilkSamples}
//                 disabled={loading}
//               />
//             </div>
//           </div>
//         </CustomForm>
//       </div>

//       {/* Samples Table */}
//       <div className="mt-2 p-3 sm:p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
//         <div className="overflow-x-auto">
//           <table className="w-full text-left border-collapse">
//             <thead>
//               <tr className="border-b border-slate-100 bg-slate-500/10 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
//                 <th className="py-2 px-2 whitespace-nowrap">Sample No</th>
//                 <th className="py-2 px-2 whitespace-nowrap min-w-30">Analyzer Port</th>
//                 <th className="py-2 px-2 whitespace-nowrap">Net Weight</th>
//                 <th className="py-2 px-2 whitespace-nowrap">FAT (%)</th>
//                 <th className="py-2 px-2 whitespace-nowrap">SNF (%)</th>
//                 <th className="py-2 px-2 whitespace-nowrap text-center">Status</th>
//                 <th className="py-2 px-2 whitespace-nowrap text-center">Action</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100 text-xs">
//               {loading && (
//                 <tr>
//                   <td colSpan={7} className="py-4 text-center text-slate-400 font-medium">
//                     <div className="flex items-center justify-center gap-2">
//                       <RefreshCw className="w-4 h-4 animate-spin text-primary" />
//                       <span>Loading milk samples...</span>
//                     </div>
//                   </td>
//                 </tr>
//               )}

//               {!loading && samples.length === 0 && (
//                 <tr>
//                   <td colSpan={7} className="py-4 text-center text-slate-400 font-medium">
//                     No samples found. Click &quot;Find&quot; to load pending milk samples.
//                   </td>
//                 </tr>
//               )}

//               {!loading &&
//                 samples.map((item, index) => {
//                   const isAnalyzed = Number(item.isAnalyse) === 1
//                   const isUpdating = updatingSampleId === item.id
//                   const selectedAnalyzer = selectedPorts[item.id]
//                   const { fat: liveFat, snf: liveSnf } = getLiveReading(selectedAnalyzer)

//                   return (
//                     <tr
//                       key={item.id ?? index}
//                       onClick={() => {
//                         if (!isAnalyzed) {
//                           setActiveSampleId(item.id)
//                         }
//                       }}
//                       className={`hover:bg-slate-50/70 transition cursor-pointer ${
//                         activeSampleId === item.id ? 'bg-primary/5' : ''
//                       }`}
//                     >
//                       <td className="py-1 px-3 font-bold text-primary">{item.sampleCode}</td>

//                       <td className="py-1 px-3">
//                         <select
//                           value={selectedAnalyzer || ''}
//                           disabled={isUpdating || isAnalyzed || connectedAnalyzers.length === 0}
//                           onChange={(e) => handlePortSelect(item, e.target.value)}
//                           onKeyDown={(e) => {
//                             if (e.key === 'Enter') {
//                               e.preventDefault()
//                               handleSubmitSample(item)
//                             }
//                           }}
//                           className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed"
//                         >
//                           <option value="">
//                             {connectedAnalyzers.length === 0
//                               ? 'No Analyzer Connected'
//                               : 'Select Analyzer to Read...'}
//                           </option>
//                           {connectedAnalyzers.map((port) => (
//                             <option key={port.path} value={port.parserType}>
//                               {analyzerName(port.parserType)} ({port.path})
//                             </option>
//                           ))}
//                         </select>
//                       </td>

//                       <td className="py-1 px-3 font-semibold text-green-800">
//                         {item.netWeight ?? '0.0'}
//                       </td>

//                       <td className="py-1 px-3 font-bold text-slate-800">
//                         {isAnalyzed ? (
//                           <span className="text-slate-800">
//                             {Number(item.fat ?? 0).toFixed(1)}%
//                           </span>
//                         ) : selectedPorts[item.id] && liveFat !== null && liveFat > 0 ? (
//                           <span className="inline-flex items-center gap-1 text-emerald-600 font-extrabold">
//                             {liveFat.toFixed(1)}%
//                             <span className="text-[9px] px-1 py-0.2 bg-emerald-100 text-emerald-700 rounded-xs font-semibold uppercase">
//                               Live
//                             </span>
//                           </span>
//                         ) : (
//                           <span className="text-slate-400">0.0%</span>
//                         )}
//                       </td>

//                       <td className="py-1 px-3 font-bold text-slate-800">
//                         {isAnalyzed ? (
//                           <span className="text-slate-800">
//                             {Number(item.snf ?? 0).toFixed(1)}%
//                           </span>
//                         ) : selectedPorts[item.id] && liveSnf !== null && liveSnf > 0 ? (
//                           <span className="inline-flex items-center gap-1 text-blue-600 font-extrabold">
//                             {liveSnf.toFixed(1)}%
//                             <span className="text-[9px] px-1 py-0.2 bg-blue-100 text-blue-700 rounded-xs font-semibold uppercase">
//                               Live
//                             </span>
//                           </span>
//                         ) : (
//                           <span className="text-slate-400">0.0%</span>
//                         )}
//                       </td>

//                       <td className="py-1 px-3 text-center">
//                         {isUpdating ? (
//                           <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary animate-pulse">
//                             <RefreshCw className="w-3 h-3 animate-spin" />
//                             Saving...
//                           </span>
//                         ) : isAnalyzed ? (
//                           <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
//                             <CheckCircle2 className="w-3 h-3 text-emerald-600" />
//                             Analyzed
//                           </span>
//                         ) : (
//                           <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
//                             <Clock className="w-3 h-3 text-amber-600" />
//                             Pending
//                           </span>
//                         )}
//                       </td>

//                       <td className="py-1 px-3 text-center">
//                         {isAnalyzed ? (
//                           <span className="text-[11px] text-slate-400 font-medium">Done</span>
//                         ) : (
//                           <button
//                             type="button"
//                             disabled={
//                               isUpdating ||
//                               !selectedPorts[item.id] ||
//                               ((liveFat ?? 0) <= 0 && (liveSnf ?? 0) <= 0)
//                             }
//                             onClick={() => handleSubmitSample(item)}
//                             title={
//                               !selectedPorts[item.id]
//                                 ? 'Select port first'
//                                 : (liveFat ?? 0) <= 0
//                                   ? 'Waiting for analyzer reading > 0.0'
//                                   : 'Click or press Enter to save machine reading'
//                             }
//                             className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer inline-flex items-center justify-center gap-1.5 ${
//                               selectedPorts[item.id] && ((liveFat ?? 0) > 0 || (liveSnf ?? 0) > 0)
//                                 ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs ring-2 ring-emerald-300'
//                                 : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
//                             }`}
//                           >
//                             <CheckCircle2 className="w-3 h-3" />
//                             <span>Save (Enter)</span>
//                           </button>
//                         )}
//                       </td>
//                     </tr>
//                   )
//                 })}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Analyze


import React, { useState, useEffect, useRef } from 'react'
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
import useShift from '@renderer/hooks/useShift'

export const Analyze: React.FC = () => {
  const { user } = useAuth()
  const { shiftOptions, currentShiftId, getShiftLabel } = useShift(user?.plant)

  // Current Date default
  const getCurrentLocalDate = (): string => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const [date, setDate] = useState<string>(getCurrentLocalDate())
  const [shift, setShift] = useState<string>(currentShiftId)
  useEffect(() => {
    if (currentShiftId) {
      setShift(currentShiftId)
    }
  }, [currentShiftId])

  const [plant, setPlant] = useState<string>(user?.plant)

  const [samples, setSamples] = useState<MilkSampleDto[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [updatingSampleId, setUpdatingSampleId] = useState<number | null>(null)
  const [selectedPorts, setSelectedPorts] = useState<Record<number, string>>({})
  const [activeSampleId, setActiveSampleId] = useState<number | null>(null)

  // Ref to track the timestamp when a port was assigned to a sample (prevents reusing old readings)
  const portSelectedAtRef = useRef<Record<number, number>>({})

  // Ref to track samples currently submitting (prevents duplicate submissions)
  const submittingRef = useRef<Set<number>>(new Set())

  // Live serial snapshot to detect connected Milk Analyzer ports
  const snap = useSerialSnapshot()
  const connectedAnalyzers = snap.ports
    .filter((p) => isAnalyzer(p.parserType) && p.status === 'connected')
    .sort((a, b) => a.parserType.localeCompare(b.parserType))

    // console.log("connectedAnalyzers", connectedAnalyzers)

  // const shifts = [
  //   { value: '1', label: 'Morning' },
  //   { value: '2', label: 'Evening' }
  // ]
  const shifts = shiftOptions

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

  // Hotkey 'f' (or Alt+F) to trigger fetchMilkSamples()
  useEffect(() => {
    const handleKeyDownF = (e: KeyboardEvent) => {
      // Preserve standard browser/system shortcuts (Ctrl+F for in-page search)
      if (e.ctrlKey || e.metaKey) return

      const isAltF = e.altKey && e.key.toLowerCase() === 'f'
      const isPlainF = !e.altKey && e.key.toLowerCase() === 'f'

      if (isAltF) {
        e.preventDefault()
        fetchMilkSamples()
        return
      }

      if (isPlainF) {
        const target = e.target as HTMLElement | null
        const tagName = target?.tagName
        if (tagName === 'INPUT' || tagName === 'TEXTAREA') {
          return
        }
        e.preventDefault()
        fetchMilkSamples()
      }
    }

    window.addEventListener('keydown', handleKeyDownF)
    return () => window.removeEventListener('keydown', handleKeyDownF)
  }, [date, shift, plant])

  // Set to true while testing without physical hardware, false in production
  const IS_TEST_MODE = false
  const DEFAULT_TEST_FAT = 4.2
  const DEFAULT_TEST_SNF = 8.5

  // Lookup live FAT/SNF for a specific analyzer ("analyzer-1" ... "analyzer-4")
  const getLiveReading = (analyzerRole?: string) => {
    if (!analyzerRole) return { fat: null as number | null, snf: null as number | null, at: null as number | null }
    const fatObj = snap.readings[`${analyzerRole}.fat`]
    const snfObj = snap.readings[`${analyzerRole}.snf`]
    const rawFat = fatObj?.value
    const rawSnf = snfObj?.value
    const at = fatObj?.at || snfObj?.at || null

    return {
      fat: rawFat !== undefined ? Number(rawFat) : IS_TEST_MODE ? DEFAULT_TEST_FAT : null,
      snf: rawSnf !== undefined ? Number(rawSnf) : IS_TEST_MODE ? DEFAULT_TEST_SNF : null,
      at: at ?? (IS_TEST_MODE ? Date.now() : null)
    }
  }

  // 1. On dropdown change: select analyzer & track this sample as active
  const handlePortSelect = async (sample: MilkSampleDto, chosenAnalyzer: string) => {
    if (!chosenAnalyzer) {
      const prevPort = selectedPorts[sample.id]
      if (prevPort && typeof window !== 'undefined' && window.api?.clearSerialReadings) {
        await window.api.clearSerialReadings([
          `${prevPort}.fat`,
          `${prevPort}.snf`,
          `${prevPort}.clr`,
          `${prevPort}.wtr`,
          `${prevPort}.temp`
        ])
      }
      setSelectedPorts((prev) => {
        const next = { ...prev }
        delete next[sample.id]
        return next
      })
      delete portSelectedAtRef.current[sample.id]
      if (activeSampleId === sample.id) {
        setActiveSampleId(null)
      }
      return
    }

    // Clear only this analyzer's readings so old FAT/SNF cannot be reused
    if (typeof window !== 'undefined' && window.api?.clearSerialReadings) {
      await window.api.clearSerialReadings([
        `${chosenAnalyzer}.fat`,
        `${chosenAnalyzer}.snf`,
        `${chosenAnalyzer}.clr`,
        `${chosenAnalyzer}.wtr`,
        `${chosenAnalyzer}.temp`
      ])
    }

    portSelectedAtRef.current[sample.id] = Date.now()
    setSelectedPorts((prev) => ({ ...prev, [sample.id]: chosenAnalyzer }))
    setActiveSampleId(sample.id)
    // toast.info(
    //   `${analyzerName(chosenAnalyzer)} selected for Sample #${sample.sampleCode}. Ready for reading.`
    // )
  }

  // 2. Submit only when valid machine data (> 0.0) arrives for that row's analyzer
  const handleSubmitSample = async (
    sample: MilkSampleDto,
    fatValue?: number,
    snfValue?: number,
    analyzer?: string
  ) => {
    const chosenAnalyzer = analyzer || selectedPorts[sample.id]
    if (!chosenAnalyzer) {
      submittingRef.current.delete(sample.id)
      return
    }

    const { fat: liveFat, snf: liveSnf } = getLiveReading(chosenAnalyzer)
    const fatToSubmit = fatValue !== undefined ? fatValue : liveFat !== null ? liveFat : Number(sample.fat ?? 0)
    const snfToSubmit = snfValue !== undefined ? snfValue : liveSnf !== null ? liveSnf : Number(sample.snf ?? 0)

    // console.log("fatToSubmit", fatToSubmit)
    // console.log("snfToSubmit", snfToSubmit)

    if (fatToSubmit <= 0 && snfToSubmit <= 0) {
      submittingRef.current.delete(sample.id)
      return
    }

    try {
      setUpdatingSampleId(sample.id)
      const payload: MilkSampleUpdateDto = {
        sampleDate: date,
        shift: Number(shift),
        plant: String(user?.plant || plant),
        sampleCode: String(sample.sampleCode),
        fat: fatToSubmit,
        snf: snfToSubmit
      }

      await api.sample.updateMilkSample(payload)

      // Clear only this analyzer's readings so old FAT/SNF cannot be reused
      if (typeof window !== 'undefined' && window.api?.clearSerialReadings) {
        await window.api.clearSerialReadings([
          `${chosenAnalyzer}.fat`,
          `${chosenAnalyzer}.snf`,
          `${chosenAnalyzer}.clr`,
          `${chosenAnalyzer}.wtr`,
          `${chosenAnalyzer}.temp`
        ])
      }

      delete portSelectedAtRef.current[sample.id]
      setSelectedPorts((prev) => {
        const next = { ...prev }
        delete next[sample.id]
        return next
      })
      setActiveSampleId(null)

      toast.success(
        `Sample #${sample.sampleCode} submitted! (FAT: ${fatToSubmit.toFixed(1)}%, SNF: ${snfToSubmit.toFixed(1)}%)`
      )
      await fetchMilkSamples()
    } catch (error) {
      console.error('Failed to submit analysis:', error)
      toast.error('Failed to submit analysis.')
    } finally {
      submittingRef.current.delete(sample.id)
      setUpdatingSampleId(null)
    }
  }

  // Automatically submit when machine data arrives for a selected port
  useEffect(() => {
    samples.forEach((sample) => {
      if (Number(sample.isAnalyse) === 1 || submittingRef.current.has(sample.id)) {
        return
      }

      const chosenAnalyzer = selectedPorts[sample.id]
      if (!chosenAnalyzer) return

      const { fat, snf, at } = getLiveReading(chosenAnalyzer)
      const selectedAt = portSelectedAtRef.current[sample.id] || 0

      // Only accept readings generated after the port was selected
      const isFresh = IS_TEST_MODE || (at !== null && at >= selectedAt)
      const hasValidReading = (fat !== null && fat > 0) && (snf !== null && snf > 0)

      if (isFresh && hasValidReading) {
        submittingRef.current.add(sample.id)
        handleSubmitSample(sample, fat!, snf!, chosenAnalyzer)
      }
    })
  }, [snap.readings, selectedPorts, samples])

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageBreadcrumb
          title="Analyze"
          //  desc="Test milk samples with connected Milk Analyzer"
        />

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
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Date</label>
              <CustomForm.CustomDateField
                name="date"
                value={date}
                onChange={(e: any) => setDate(e.target.value)}
                readOnly={true}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Select Shift</label>
              <CustomForm.CustomSelectField
                name="shift"
                value={shift}
                onChange={(e: any) => setShift(e.target.value)}
                options={shifts}
                tabIndex={1}
                readOnly={true}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Chilling Center</label>
              <CustomForm.CustomTextField
                name="chilling"
                value={`${user?.plant || ''}, ${user?.plantName || ''}`}
                readOnly={true}
                tabIndex={-1}
              />
            </div>

            <div className="flex justify-end">
              <Button1
                variant="primary"
                icon={<Search className="w-3.5 h-3.5 text-white" />}
                // label={loading ? 'Finding...' : 'Find (F)'}
                label={loading ? 'Finding...' : <><u>F</u>ind</>}
                onClick={fetchMilkSamples}
                disabled={loading}
              />
            </div>
          </div>
        </CustomForm>
      </div>

      <div className="mt-2 p-3 sm:p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-500/10 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-2 px-2 whitespace-nowrap">Sample No</th>
                <th className="py-2 px-2 whitespace-nowrap min-w-30">Analyzer Port</th>
                <th className="py-2 px-2 whitespace-nowrap">Net Weight</th>
                <th className="py-2 px-2 whitespace-nowrap">FAT (%)</th>
                <th className="py-2 px-2 whitespace-nowrap">SNF (%)</th>
                <th className="py-2 px-2 whitespace-nowrap text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading && (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-slate-400 font-medium">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                      <span>Loading milk samples...</span>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && samples.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-slate-400 font-medium">
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

                  // Active rows rule: only the first N rows equal to connected analyzers are active
                  // const isRowActive = index < connectedAnalyzers.length
                  const isRowActive = index < 3

                  // Filter out ports already selected in OTHER rows
                  const usedPorts = Object.entries(selectedPorts)
                    .filter(([sId]) => Number(sId) !== item.id)
                    .map(([_, port]) => port)

                  const availableAnalyzers = connectedAnalyzers.filter(
                    (port) => !usedPorts.includes(port.parserType) || port.parserType === selectedAnalyzer
                  )

                  return (
                    <tr
                      key={item.id ?? index}
                      onClick={() => {
                        if (!isAnalyzed && isRowActive) {
                          setActiveSampleId(item.id) 
                        }
                      }}
                      className={`transition ${
                        !isRowActive
                          ? 'opacity-50 bg-slate-50/40 cursor-not-allowed'
                          : activeSampleId === item.id
                            ? 'bg-primary/5 cursor-pointer'
                            : selectedAnalyzer
                              ? 'bg-amber-50/20 hover:bg-amber-50/40 cursor-pointer'
                              : 'hover:bg-slate-50/70 cursor-pointer'
                      }`}
                    >
                      <td className="py-1 px-3 font-bold text-primary">{item.sampleCode}</td>

                      <td className="py-1 px-3">
                        <select
                          value={selectedAnalyzer || ''}
                          disabled={!isRowActive || isUpdating || isAnalyzed || connectedAnalyzers.length === 0}
                          onChange={(e) => handlePortSelect(item, e.target.value)}
                          className={`w-full border rounded-xl px-2.5 py-1.5 text-xs font-medium transition ${
                            !isRowActive
                              ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                              : selectedAnalyzer
                                ? 'bg-amber-50/70 border-amber-300 text-slate-800'
                                : 'bg-white border-slate-200 text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer'
                          }`}
                        >
                          <option value="">
                            {connectedAnalyzers.length === 0
                              ? 'No Analyzer Connected'
                              : !isRowActive
                                ? 'Slot Inactive'
                                : selectedAnalyzer
                                  ? 'Hold (Waiting for machine data...)'
                                  : 'Select Analyzer to Read...'}
                          </option>
                          {availableAnalyzers.map((port) => (
                            <option key={port.path} value={port.parserType}>
                              {analyzerName(port.parserType)} ({port.path})
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-1 px-3 font-semibold text-green-800">
                        {item.netWeight ?? '0.0'}
                      </td>

                      <td className="py-1 px-3 font-bold text-slate-800">
                        {isAnalyzed ? (
                          <span className="text-slate-800">
                            {Number(item.fat ?? 0).toFixed(1)}%
                          </span>
                        ) : selectedAnalyzer && liveFat !== null && liveFat > 0 ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-extrabold">
                            {liveFat.toFixed(1)}%
                            <span className="text-[9px] px-1 py-0.2 bg-emerald-100 text-emerald-700 rounded-xs font-semibold uppercase">
                              Live
                            </span>
                          </span>
                        ) : selectedAnalyzer ? (
                          <span className="text-amber-500 font-semibold italic text-xs animate-pulse">
                            Hold...
                          </span>
                        ) : (
                          <span className="text-slate-400">0.0%</span>
                        )}
                      </td>

                      <td className="py-1 px-3 font-bold text-slate-800">
                        {isAnalyzed ? (
                          <span className="text-slate-800">
                            {Number(item.snf ?? 0).toFixed(1)}%
                          </span>
                        ) : selectedAnalyzer && liveSnf !== null && liveSnf > 0 ? (
                          <span className="inline-flex items-center gap-1 text-blue-600 font-extrabold">
                            {liveSnf.toFixed(1)}%
                            <span className="text-[9px] px-1 py-0.2 bg-blue-100 text-blue-700 rounded-xs font-semibold uppercase">
                              Live
                            </span>
                          </span>
                        ) : selectedAnalyzer ? (
                          <span className="text-amber-500 font-semibold italic text-xs animate-pulse">
                            Hold...
                          </span>
                        ) : (
                          <span className="text-slate-400">0.0%</span>
                        )}
                      </td>

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
                        ) : selectedAnalyzer ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                            <Clock className="w-3 h-3 text-amber-700" />
                            Hold
                          </span>
                        ) : isRowActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            <Activity className="w-3 h-3 text-blue-600" />
                            Ready
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                            <Clock className="w-3 h-3 text-slate-400" />
                            Inactive
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