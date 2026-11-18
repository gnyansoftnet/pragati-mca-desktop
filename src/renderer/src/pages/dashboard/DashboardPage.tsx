// import React, { useState, useEffect } from 'react'
// import {
//   Users,
//   FileText,
//   Calendar,
//   CheckCircle2,
//   UploadCloud,
//   RefreshCw,
//   FileCheck,
//   AlertTriangle
// } from 'lucide-react'
// import { toast } from 'react-toastify'
// import { useAuth } from '../../context/AuthContext'
// import { useNetwork } from '../../hooks/useNetwork'
// import { useSerialSnapshot } from '../../hooks/useSerial'
// import { isAnalyzer } from '@shared/dtos/connection/serial-com-port.dto'
// import Button1 from '../../components/buttons/Button1'
// import PageBreadcrumb from '../../components/breadcrumbs/PageBreadcrumb'
// import TableToolbar from '../../components/table/TableToolbar'
// import TablePagination from '../../components/table/TablePagination'
// import type { MilkCollectionDto } from '@shared/dtos/milk-collection/milk-collection.dto'
// import type { MilkRejectionResponseDto } from '@shared/dtos/milk-rejection/milk-rejection.dto'
// import type { DashboardCountDto } from '@shared/dtos/master/master.dto'

// export type DashboardTab = 'analyzed' | 'rejected'

// export const DashboardPage: React.FC = () => {
//   const { user } = useAuth()
//   const { verifyConnection } = useNetwork()
//   const snap = useSerialSnapshot()

//   // Hardware connections count
//   const connectedScales = snap.ports.filter(
//     (p) => p.parserType === 'weight' && p.status === 'connected'
//   ).length
//   const connectedAnalyzers = snap.ports.filter(
//     (p) => isAnalyzer(p.parserType) && p.status === 'connected'
//   ).length

//   // Today's date YYYY-MM-DD
//   const getCurrentLocalDate = (): string => {
//     const today = new Date()
//     const year = today.getFullYear()
//     const month = String(today.getMonth() + 1).padStart(2, '0')
//     const day = String(today.getDate()).padStart(2, '0')
//     return `${year}-${month}-${day}`
//   }

//   // Format date as DD-MM-YYYY for display
//   const formatDateForDisplay = (dateStr?: string): string => {
//     if (!dateStr) return ''
//     const parts = dateStr.split('-')
//     if (parts.length === 3) {
//       return `${parts[2]}-${parts[1]}-${parts[0]}`
//     }
//     return dateStr
//   }

//   const todayDate = getCurrentLocalDate()

//   // Dashboard counts state
//   const [counts, setCounts] = useState<DashboardCountDto>({
//     user: '0',
//     vendor: '0',
//     route: '0',
//     supervisor: '0',
//     collection: '0',
//     analyze: '0',
//     rejected: '0'
//   })

//   // Active tab state
//   const [activeTab, setActiveTab] = useState<DashboardTab>('analyzed')

//   // Search & Page size
//   const [pageSize, setPageSize] = useState<number | 'all'>(10)
//   const [searchQuery, setSearchQuery] = useState<string>('')
//   const [loading, setLoading] = useState<boolean>(false)

//   // Sync state
//   const [isSyncing, setIsSyncing] = useState<boolean>(false)
//   const [showConfirm, setShowConfirm] = useState<boolean>(false)
//   const [syncTarget, setSyncTarget] = useState<DashboardTab>('analyzed')

//   // Analyzed collections for today
//   const [collections, setCollections] = useState<MilkCollectionDto[]>([])
//   const [analyzedPagination, setAnalyzedPagination] = useState({
//     page: 1,
//     limit: 10,
//     total: 0,
//     totalPages: 1,
//     hasNextPage: false,
//     hasPrevPage: false
//   })

//   // Rejected records for today
//   const [rejections, setRejections] = useState<MilkRejectionResponseDto[]>([])
//   const [rejectedPagination, setRejectedPagination] = useState({
//     page: 1,
//     limit: 10,
//     total: 0,
//     totalPages: 1,
//     hasNextPage: false,
//     hasPrevPage: false
//   })

//   // 1. Fetch dashboard counts
//   const fetchDashboardCounts = async () => {
//     try {
//       const res = await window.api.getDashboardCount()
//       const item = Array.isArray(res) ? res[0] : (res as any)
//       if (item) {
//         setCounts({
//           user: String(item.user ?? '0'),
//           vendor: String(item.vendor ?? '0'),
//           route: String(item.route ?? '0'),
//           supervisor: String(item.supervisor ?? '0'),
//           collection: String(item.collection ?? '0'),
//           analyze: String(item.analyze ?? '0'),
//           rejected: String(item.rejected ?? '0')
//         })
//       }
//     } catch (error) {
//       console.error('Failed to load dashboard counts:', error)
//     }
//   }

//   // 2. Fetch today's analyzed milk collections
//   const fetchAnalyzedCollections = async (
//     pageNo = analyzedPagination.page,
//     limitVal = pageSize,
//     searchVal = searchQuery
//   ) => {
//     try {
//       setLoading(true)
//       const actualLimit = limitVal === 'all' ? 1000000000 : limitVal
//       const response = await window.api.getPaginatedMilkCollctions(
//         {
//           page: pageNo,
//           limit: actualLimit,
//           search: searchVal.trim()
//         },
//         todayDate,
//         todayDate,
//         1
//       )

//       if (response) {
//         const dataList = Array.isArray(response.data)
//           ? response.data
//           : Array.isArray(response)
//             ? response
//             : []
//         setCollections(dataList)

//         if (response.pagination) {
//           setAnalyzedPagination(response.pagination)
//         }
//       }
//     } catch (error) {
//       console.error('Failed to fetch today analyzed collections:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   // 3. Fetch today's rejected milk records
//   const fetchRejectedCollections = async (
//     pageNo = rejectedPagination.page,
//     limitVal = pageSize,
//     searchVal = searchQuery
//   ) => {
//     try {
//       setLoading(true)
//       const actualLimit = limitVal === 'all' ? 1000000000 : limitVal
//       const response = await window.api.getPaginatedMilkRejections(
//         {
//           page: pageNo,
//           limit: actualLimit,
//           search: searchVal.trim()
//         },
//         todayDate,
//         todayDate
//       )

//       if (response) {
//         const dataList = Array.isArray(response.data)
//           ? response.data
//           : Array.isArray(response)
//             ? response
//             : []
//         setRejections(dataList)

//         if (response.pagination) {
//           setRejectedPagination(response.pagination)
//         }
//       }
//     } catch (error) {
//       console.error('Failed to fetch today rejected collections:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   // Load dashboard counts on mount
//   useEffect(() => {
//     fetchDashboardCounts()
//   }, [])

//   // Debounced search / pagination / tab switch
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       if (activeTab === 'analyzed') {
//         fetchAnalyzedCollections(1, pageSize, searchQuery)
//       } else {
//         fetchRejectedCollections(1, pageSize, searchQuery)
//       }
//     }, 300)
//     return () => clearTimeout(timer)
//   }, [searchQuery, pageSize, activeTab])

//   // Handle Tab Switch
//   const handleTabSwitch = (newTab: DashboardTab) => {
//     if (newTab === activeTab) return
//     setActiveTab(newTab)
//     setSearchQuery('')
//   }

//   // Open confirmation modal for sync
//   const openSyncModal = (target: DashboardTab) => {
//     setSyncTarget(target)
//     setShowConfirm(true)
//   }

//   // Execute sync to server for today's records
//   const handleStartSync = async () => {
//     const hasNet = await verifyConnection()
//     if (!hasNet) {
//       toast.error('Cannot sync: No internet connection! Please check your network.')
//       setShowConfirm(false)
//       return
//     }

//     try {
//       setIsSyncing(true)
//       setShowConfirm(false)

//       if (syncTarget === 'analyzed') {
//         const result = await (window.api as any).syncMilkCollection(todayDate, todayDate)
//         if (
//           result &&
//           (result.success === true || result.success === 1 || result.data?.success === 1)
//         ) {
//           const stats = result.data
//           const summaryMsg = stats?.message || result.message || 'Today analyzed collections synced!'
//           const countsStr = stats
//             ? ` (Total: ${stats.total ?? 0}, Inserted: ${stats.inserted ?? 0}, Updated: ${stats.updated ?? 0})`
//             : ''
//           toast.success(`${summaryMsg}${countsStr}`)
//           await fetchAnalyzedCollections(1, pageSize, searchQuery)
//           await fetchDashboardCounts()
//         } else {
//           toast.error(result?.message || result?.data?.message || 'Failed to sync analyzed milk.')
//         }
//       } else {
//         const result = await (window.api as any).syncMilkRejection(todayDate, todayDate)
//         if (
//           result &&
//           (result.success === true || result.success === 1 || result.data?.success === 1)
//         ) {
//           const stats = result.data
//           const summaryMsg = stats?.message || result.message || 'Today rejected records synced!'
//           const countsStr = stats
//             ? ` (Total: ${stats.total ?? 0}, Inserted: ${stats.inserted ?? 0}, Updated: ${stats.updated ?? 0})`
//             : ''
//           toast.success(`${summaryMsg}${countsStr}`)
//           await fetchRejectedCollections(1, pageSize, searchQuery)
//           await fetchDashboardCounts()
//         } else {
//           toast.error(result?.message || result?.data?.message || 'Failed to sync rejected milk.')
//         }
//       }
//     } catch (error: any) {
//       console.error('Failed to sync:', error)
//       toast.error(error?.message || 'An error occurred while syncing.')
//     } finally {
//       setIsSyncing(false)
//     }
//   }

//   const currentPagination = activeTab === 'analyzed' ? analyzedPagination : rejectedPagination

//   return (
//     <div className="space-y-4">
//       {/* Top Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//         <PageBreadcrumb title="Dashboard" />

//         <div className="flex items-center gap-2">
//           <Button1
//             disabled={isSyncing}
//             onClick={() => openSyncModal('analyzed')}
//             variant="primary"
//             icon={
//               isSyncing && syncTarget === 'analyzed' ? (
//                 <RefreshCw className="w-3.5 h-3.5 text-white animate-spin" />
//               ) : (
//                 <UploadCloud className="w-3.5 h-3.5 text-white" />
//               )
//             }
//             label={isSyncing && syncTarget === 'analyzed' ? 'Syncing...' : 'Sync Analyzed (Today)'}
//           />
//           <Button1
//             disabled={isSyncing}
//             onClick={() => openSyncModal('rejected')}
//             variant="secondary"
//             icon={
//               isSyncing && syncTarget === 'rejected' ? (
//                 <RefreshCw className="w-3.5 h-3.5 text-white animate-spin" />
//               ) : (
//                 <UploadCloud className="w-3.5 h-3.5 text-slate-700" />
//               )
//             }
//             label={isSyncing && syncTarget === 'rejected' ? 'Syncing...' : 'Sync Rejected (Today)'}
//           />
//         </div>
//       </div>

//       {/* Sync Confirmation Modal */}
//       {showConfirm && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fade-in">
//           <div className="w-full max-w-md bg-white shadow-2xl border rounded-2xl border-slate-100 p-6 text-center transform transition-all scale-100">
//             <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner">
//               <RefreshCw className="w-8 h-8 animate-spin-slow" />
//             </div>
//             <h3 className="text-lg font-bold text-slate-800 mb-2">
//               Sync {syncTarget === 'analyzed' ? 'Analyzed Milk' : 'Rejected Milk'} to Server
//             </h3>
//             <p className="text-sm text-slate-600 leading-relaxed mb-4">
//               This will upload today's ({formatDateForDisplay(todayDate)}){' '}
//               {syncTarget === 'analyzed' ? 'analyzed milk collection' : 'rejected milk'} records to
//               the central cloud server. Are you sure you want to proceed?
//             </p>

//             <div className="mb-6 py-2 px-3 bg-slate-50 rounded-xl text-xs text-slate-600 flex flex-wrap justify-center gap-4">
//               <span>
//                 Plant: <strong className="text-slate-800">{user?.plantName || user?.plant || '1102'}</strong>
//               </span>
//               <span>
//                 Date: <strong className="text-slate-800">{formatDateForDisplay(todayDate)}</strong>
//               </span>
//             </div>

//             <div className="flex items-center justify-center gap-3">
//               <button
//                 type="button"
//                 disabled={isSyncing}
//                 onClick={() => setShowConfirm(false)}
//                 className="w-1/2 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-all cursor-pointer disabled:opacity-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="button"
//                 disabled={isSyncing}
//                 onClick={handleStartSync}
//                 className="w-1/2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
//               >
//                 {isSyncing ? (
//                   <>
//                     <RefreshCw className="w-4 h-4 animate-spin" />
//                     <span>Syncing...</span>
//                   </>
//                 ) : (
//                   'Yes, Sync Now'
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Summary Stat Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         {/* Card 1: Routes & Vendors */}
//         <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-start justify-between">
//           <div className="space-y-1">
//             <div className="flex items-center gap-2">
//               <p className="text-[13px] font-semibold text-slate-400 tracking-wider">Total Routes:</p>
//               <p className="text-[13px] font-bold text-slate-800 uppercase">{counts.route}</p>
//             </div>
//             <div className="flex items-center gap-2">
//               <p className="text-[13px] font-semibold text-slate-400 tracking-wider">Total Vendors:</p>
//               <p className="text-[13px] font-bold text-slate-800 uppercase">{counts.vendor}</p>
//             </div>
//           </div>

//           <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center shadow-md shadow-primary/25">
//             <Users className="w-6 h-6 strokeWidth={2}" />
//           </div>
//         </div>

//         {/* Card 2: Milk Operations */}
//         <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-start justify-between">
//           <div className="space-y-1">
//             <div className="flex items-center gap-2">
//               <p className="text-[13px] font-semibold text-slate-400 tracking-wider">Milk Collected:</p>
//               <p className="text-[13px] font-bold text-slate-800 uppercase">{counts.collection}</p>
//             </div>
//             <div className="flex items-center gap-2">
//               <p className="text-[13px] font-semibold text-slate-400 tracking-wider">Milk Analyzed:</p>
//               <p className="text-[13px] font-bold text-emerald-600 uppercase">{counts.analyze}</p>
//             </div>
//             <div className="flex items-center gap-2">
//               <p className="text-[13px] font-semibold text-slate-400 tracking-wider">Milk Rejected:</p>
//               <p className="text-[13px] font-bold text-rose-600 uppercase">{counts.rejected}</p>
//             </div>
//           </div>
//           <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-600 to-pink-300 text-white flex items-center justify-center shadow-md shadow-pink-500/20">
//             <FileText className="w-6 h-6 strokeWidth={2}" />
//           </div>
//         </div>

//         {/* Card 3: Supervisors & Users */}
//         <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-start justify-between">
//           <div className="space-y-1">
//             <div className="flex items-center gap-2">
//               <p className="text-[13px] font-semibold text-slate-400 tracking-wider">Total Supervisors:</p>
//               <p className="text-[13px] font-bold text-slate-800 uppercase">{counts.supervisor}</p>
//             </div>
//             <div className="flex items-center gap-2">
//               <p className="text-[13px] font-semibold text-slate-400 tracking-wider">Total Users:</p>
//               <p className="text-[13px] font-bold text-slate-800 uppercase">{counts.user}</p>
//             </div>
//           </div>
//           <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-300 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
//             <Calendar className="w-6 h-6 strokeWidth={2}" />
//           </div>
//         </div>

//         {/* Card 4: Machine Connections */}
//         <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-start justify-between">
//           <div className="space-y-1">
//             <div className="flex items-center gap-2">
//               <p className="text-[13px] font-semibold text-slate-400 tracking-wider">Weight Scale:</p>
//               <p className="text-[13px] font-bold text-slate-800 uppercase">{connectedScales}/1</p>
//             </div>
//             <div className="flex items-center gap-2">
//               <p className="text-[13px] font-semibold text-slate-400 tracking-wider">Milk Analyzer:</p>
//               <p className="text-[13px] font-bold text-slate-800 uppercase">{connectedAnalyzers}/4</p>
//             </div>
//           </div>
//           <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-600 to-orange-300 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
//             <CheckCircle2 className="w-6 h-6 strokeWidth={2}" />
//           </div>
//         </div>
//       </div>

//       {/* Today's Data Card (Tabbed View) */}
//       <div className="p-3 sm:p-4 bg-white rounded-2xl border border-slate-100 shadow-xs space-y-4">
//         {/* Card Title & Navigation Tabs */}
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-3">
//           <div className="flex items-center gap-2">
//             <h2 className="text-base font-bold text-slate-800">Today's Data</h2>
//             <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
//               {formatDateForDisplay(todayDate)}
//             </span>
//           </div>

//           {/* Tab Selector */}
//           <div className="flex items-center gap-4">
//             <button
//               type="button"
//               onClick={() => handleTabSwitch('analyzed')}
//               className={`pb-1 px-1 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
//                 activeTab === 'analyzed'
//                   ? 'border-primary text-primary'
//                   : 'border-transparent text-slate-400 hover:text-slate-600'
//               }`}
//             >
//               <FileCheck className="w-3.5 h-3.5" />
//               <span>Analyzed ({analyzedPagination.total})</span>
//             </button>

//             <button
//               type="button"
//               onClick={() => handleTabSwitch('rejected')}
//               className={`pb-1 px-1 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
//                 activeTab === 'rejected'
//                   ? 'border-rose-500 text-rose-600'
//                   : 'border-transparent text-slate-400 hover:text-slate-600'
//               }`}
//             >
//               <AlertTriangle className="w-3.5 h-3.5" />
//               <span>Rejected ({rejectedPagination.total})</span>
//             </button>
//           </div>
//         </div>

//         {/* Table Toolbar */}
//         <TableToolbar
//           pageSize={pageSize}
//           onPageSizeChange={(val) => setPageSize(val === 'all' ? 'all' : Number(val))}
//           searchQuery={searchQuery}
//           onSearchChange={setSearchQuery}
//           searchPlaceholder={
//             activeTab === 'analyzed'
//               ? 'Search sample code, route or vendor...'
//               : 'Search DSK, route or supervisor...'
//           }
//         />

//         {/* Analyzed Table */}
//         {activeTab === 'analyzed' && (
//           <div className="overflow-x-auto">
//             <table className="w-full text-left border-collapse">
//               <thead>
//                 <tr className="border-b border-slate-100 bg-slate-500/10 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
//                   <th className="py-2.5 px-2 whitespace-nowrap">Sample Code</th>
//                   <th className="py-2.5 px-2 whitespace-nowrap">Shift</th>
//                   <th className="py-2.5 px-2 whitespace-nowrap">Plant</th>
//                   <th className="py-2.5 px-2 whitespace-nowrap">Route Name</th>
//                   <th className="py-2.5 px-2 whitespace-nowrap">Vendor Name</th>
//                   <th className="py-2.5 px-2 whitespace-nowrap">Weight System</th>
//                   <th className="py-2.5 px-2 whitespace-nowrap">Cans Type</th>
//                   <th className="py-2.5 px-2 whitespace-nowrap">Milk Type</th>
//                   <th className="py-2.5 px-2 whitespace-nowrap">Milk Status</th>
//                   <th className="py-2.5 px-2 whitespace-nowrap">Cans</th>
//                   <th className="py-2.5 px-2 whitespace-nowrap">Net Weight</th>
//                   <th className="py-2.5 px-2 whitespace-nowrap">FAT (%)</th>
//                   <th className="py-2.5 px-2 whitespace-nowrap">SNF (%)</th>
//                   <th className="py-2.5 px-2 whitespace-nowrap">CLR (%)</th>
//                   <th className="py-2.5 px-2 whitespace-nowrap">Tipping Time</th>
//                   <th className="py-2.5 px-2 whitespace-nowrap text-center">Status</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-100 text-xs">
//                 {loading && (
//                   <tr>
//                     <td colSpan={16} className="py-4 text-center text-slate-400 font-medium">
//                       Loading today's analyzed collections...
//                     </td>
//                   </tr>
//                 )}
//                 {!loading && collections.length === 0 && (
//                   <tr>
//                     <td colSpan={16} className="py-4 text-center text-slate-400 font-medium">
//                       No analyzed collections recorded for today ({formatDateForDisplay(todayDate)})
//                     </td>
//                   </tr>
//                 )}
//                 {!loading &&
//                   collections.map((item, index) => (
//                     <tr key={item.id ?? index} className="hover:bg-slate-50/70 transition">
//                       <td className="py-2 px-2 font-semibold text-primary">{item.sampleCode}</td>
//                       <td className="py-2 px-2">
//                         <span
//                           className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
//                             String(item.shift) === '1'
//                               ? 'bg-orange-50 text-orange-500 border-orange-200'
//                               : String(item.shift) === '2'
//                                 ? 'bg-sky-50 text-sky-500 border-sky-200'
//                                 : 'bg-rose-50 text-rose-700 border-rose-200'
//                           }`}
//                         >
//                           {String(item.shift) === '1'
//                             ? 'Morning'
//                             : String(item.shift) === '2'
//                               ? 'Evening'
//                               : `Shift ${item.shift}`}
//                         </span>
//                       </td>
//                       <td className="py-2 px-2 font-semibold text-slate-800">{item.plant}</td>
//                       <td className="py-2 px-2 font-semibold text-primary max-w-36 truncate">
//                         {item.rootCode}
//                       </td>
//                       <td className="py-2 px-2 font-semibold text-primary">{item.vendorCode}</td>
//                       <td className="py-2 px-2 font-bold text-slate-900">{item.weightSystem}</td>
//                       <td className="py-2 px-2 font-semibold text-primary">{item.canType}</td>
//                       <td className="py-2 px-2">
//                         <span
//                           className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
//                             String(item.milkType).toLowerCase() === 'cow'
//                               ? 'bg-amber-50 text-amber-700 border-amber-200'
//                               : String(item.milkType).toLowerCase() === 'buffalo'
//                                 ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
//                                 : String(item.milkType).toLowerCase() === 'mixed'
//                                   ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
//                                   : 'bg-gray-50 text-gray-700 border-gray-200'
//                           }`}
//                         >
//                           {item.milkType}
//                         </span>
//                       </td>
//                       <td className="py-2 px-2 font-semibold text-primary">{item.milkStatus}</td>
//                       <td className="py-2 px-2 font-semibold text-primary">{item.noOfCans}</td>
//                       <td className="py-2 px-2 font-bold text-emerald-600">
//                         {Number(item.netWeight || item.netLtr || 0).toFixed(1)}
//                       </td>
//                       <td className="py-2 px-2 font-bold text-slate-800">
//                         {Number(item.fat || 0) > 0 ? `${Number(item.fat).toFixed(1)}%` : '0.0%'}
//                       </td>
//                       <td className="py-2 px-2 font-bold text-slate-800">
//                         {Number(item.snf || 0) > 0 ? `${Number(item.snf).toFixed(1)}%` : '0.0%'}
//                       </td>
//                       <td className="py-2 px-2 font-bold text-slate-800">{item.clr}</td>
//                       <td className="py-2 px-2 font-semibold text-primary">{item.tipingTime}</td>
//                       <td className="py-2 px-2 text-center">
//                         <span
//                           className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
//                             Number(item.isAnalyse) === 1
//                               ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
//                               : 'bg-amber-50 text-amber-700 border-amber-200'
//                           }`}
//                         >
//                           {Number(item.isAnalyse) === 1 ? 'Analyzed' : 'Pending'}
//                         </span>
//                       </td>
//                     </tr>
//                   ))}
//               </tbody>
//             </table>
//           </div>
//         )}

//         {/* Rejected Table */}
//         {activeTab === 'rejected' && (
//           <div className="overflow-x-auto">
//             <table className="w-full text-left border-collapse">
//               <thead>
//                 <tr className="border-b border-slate-100 bg-slate-500/10 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
//                   <th className="py-2.5 px-2 whitespace-nowrap">ID</th>
//                   <th className="py-2.5 px-2 whitespace-nowrap">Shift</th>
//                   <th className="py-2.5 px-2 whitespace-nowrap">Plant</th>
//                   <th className="py-2.5 px-2 whitespace-nowrap">Route Name</th>
//                   <th className="py-2.5 px-2 whitespace-nowrap">DSK Code</th>
//                   <th className="py-2.5 px-2 whitespace-nowrap">DSK Name</th>
//                   <th className="py-2.5 px-2 whitespace-nowrap">Supervisor</th>
//                   <th className="py-2.5 px-2 whitespace-nowrap">No. of Cans</th>
//                   <th className="py-2.5 px-2 whitespace-nowrap">Approx Qty (LTR)</th>
//                   <th className="py-2.5 px-2 whitespace-nowrap">Reason</th>
//                   <th className="py-2.5 px-2 whitespace-nowrap text-center">Status</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-100 text-xs">
//                 {loading && (
//                   <tr>
//                     <td colSpan={11} className="py-4 text-center text-slate-400 font-medium">
//                       Loading today's rejections...
//                     </td>
//                   </tr>
//                 )}
//                 {!loading && rejections.length === 0 && (
//                   <tr>
//                     <td colSpan={11} className="py-4 text-center text-slate-400 font-medium">
//                       No milk rejections recorded for today ({formatDateForDisplay(todayDate)})
//                     </td>
//                   </tr>
//                 )}
//                 {!loading &&
//                   rejections.map((item, index) => (
//                     <tr key={item.id ?? index} className="hover:bg-slate-50/70 transition">
//                       <td className="py-2 px-2 font-semibold text-primary">{item.id}</td>
//                       <td className="py-2 px-2 font-semibold text-primary">{item.shift}</td>
//                       <td className="py-2 px-2 font-semibold text-slate-800">{item.plant}</td>
//                       <td className="py-2 px-2 font-semibold text-primary">
//                         {(item as any).routeName || item.route}
//                       </td>
//                       <td className="py-2 px-2 text-slate-700">{item.dskCode}</td>
//                       <td className="py-2 px-2 font-semibold text-slate-800">{item.dskName}</td>
//                       <td className="py-2 px-2 text-slate-700">{item.supervisor}</td>
//                       <td className="py-2 px-2 text-slate-700">{item.noOfCanes}</td>
//                       <td className="py-2 px-2 font-bold text-emerald-600">{item.aproxQuantity}</td>
//                       <td className="py-2 px-2 text-slate-700">{item.reason}</td>
//                       <td className="py-2 px-2 text-center">
//                         <span
//                           className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
//                             item.syncStatus === 'synced' || item.syncStatus === '1'
//                               ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
//                               : 'bg-amber-50 text-amber-700 border-amber-200'
//                           }`}
//                         >
//                           {item.syncStatus === 'synced' || item.syncStatus === '1'
//                             ? 'Synced'
//                             : 'Pending'}
//                         </span>
//                       </td>
//                     </tr>
//                   ))}
//               </tbody>
//             </table>
//           </div>
//         )}

//         {/* Table Pagination */}
//         <TablePagination
//           page={currentPagination.page}
//           totalPages={currentPagination.totalPages}
//           totalItems={currentPagination.total}
//           pageSize={pageSize}
//           hasNextPage={currentPagination.hasNextPage}
//           hasPrevPage={currentPagination.hasPrevPage}
//           loading={loading}
//           itemName={activeTab === 'analyzed' ? 'collections' : 'rejections'}
//           onPageChange={(newPage) => {
//             if (activeTab === 'analyzed') {
//               fetchAnalyzedCollections(newPage, pageSize, searchQuery)
//             } else {
//               fetchRejectedCollections(newPage, pageSize, searchQuery)
//             }
//           }}
//         />
//       </div>
//     </div>
//   )
// }

// export default DashboardPage



import React, { useState, useEffect } from 'react'
import {
  Users,
  FileText,
  Calendar,
  CheckCircle2,
  FileCheck,
  AlertTriangle
} from 'lucide-react'
import { useSerialSnapshot } from '../../hooks/useSerial'
import { isAnalyzer } from '@shared/dtos/connection/serial-com-port.dto'
import PageBreadcrumb from '../../components/breadcrumbs/PageBreadcrumb'
import TableToolbar from '../../components/table/TableToolbar'
import TablePagination from '../../components/table/TablePagination'
import type { MilkCollectionDto } from '@shared/dtos/milk-collection/milk-collection.dto'
import type { MilkRejectionResponseDto } from '@shared/dtos/milk-rejection/milk-rejection.dto'
import type { DashboardCountDto } from '@shared/dtos/master/master.dto'

export type DashboardTab = 'analyzed' | 'rejected'

export const DashboardPage: React.FC = () => {
  const snap = useSerialSnapshot()

  // Hardware connections count
  const connectedScales = snap.ports.filter(
    (p) => p.parserType === 'weight' && p.status === 'connected'
  ).length
  const connectedAnalyzers = snap.ports.filter(
    (p) => isAnalyzer(p.parserType) && p.status === 'connected'
  ).length

  // Today's date YYYY-MM-DD
  const getCurrentLocalDate = (): string => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Format date as DD-MM-YYYY for display
  const formatDateForDisplay = (dateStr?: string): string => {
    if (!dateStr) return ''
    const parts = dateStr.split('-')
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`
    }
    return dateStr
  }

  const todayDate = getCurrentLocalDate()

  // Dashboard counts state
  const [counts, setCounts] = useState<DashboardCountDto>({
    user: '0',
    vendor: '0',
    route: '0',
    supervisor: '0',
    collection: '0',
    analyze: '0',
    rejected: '0'
  })

  // Active tab state
  const [activeTab, setActiveTab] = useState<DashboardTab>('analyzed')

  // Search & Page size
  const [pageSize, setPageSize] = useState<number | 'all'>(10)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  // Analyzed collections for today
  const [collections, setCollections] = useState<MilkCollectionDto[]>([])
  const [analyzedPagination, setAnalyzedPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  })

  // Rejected records for today
  const [rejections, setRejections] = useState<MilkRejectionResponseDto[]>([])
  const [rejectedPagination, setRejectedPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  })

  // 1. Fetch dashboard counts
  const fetchDashboardCounts = async () => {
    try {
      const res = await window.api.getDashboardCount()
      const item = Array.isArray(res) ? res[0] : (res as any)
      if (item) {
        setCounts({
          user: String(item.user ?? '0'),
          vendor: String(item.vendor ?? '0'),
          route: String(item.route ?? '0'),
          supervisor: String(item.supervisor ?? '0'),
          collection: String(item.collection ?? '0'),
          analyze: String(item.analyze ?? '0'),
          rejected: String(item.rejected ?? '0')
        })
      }
    } catch (error) {
      console.error('Failed to load dashboard counts:', error)
    }
  }

  // 2. Fetch today's analyzed milk collections
  const fetchAnalyzedCollections = async (
    pageNo = analyzedPagination.page,
    limitVal = pageSize,
    searchVal = searchQuery
  ) => {
    try {
      setLoading(true)
      const actualLimit = limitVal === 'all' ? 1000000000 : limitVal
      const response = await window.api.getPaginatedMilkCollctions(
        {
          page: pageNo,
          limit: actualLimit,
          search: searchVal.trim()
        },
        todayDate,
        todayDate,
        1
      )

      if (response) {
        const dataList = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : []
        setCollections(dataList)

        if (response.pagination) {
          setAnalyzedPagination(response.pagination)
        }
      }
    } catch (error) {
      console.error('Failed to fetch today analyzed collections:', error)
    } finally {
      setLoading(false)
    }
  }

  // 3. Fetch today's rejected milk records
  const fetchRejectedCollections = async (
    pageNo = rejectedPagination.page,
    limitVal = pageSize,
    searchVal = searchQuery
  ) => {
    try {
      setLoading(true)
      const actualLimit = limitVal === 'all' ? 1000000000 : limitVal
      const response = await window.api.getPaginatedMilkRejections(
        {
          page: pageNo,
          limit: actualLimit,
          search: searchVal.trim()
        },
        todayDate,
        todayDate
      )

      if (response) {
        const dataList = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : []
        setRejections(dataList)

        if (response.pagination) {
          setRejectedPagination(response.pagination)
        }
      }
    } catch (error) {
      console.error('Failed to fetch today rejected collections:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load dashboard counts on mount
  useEffect(() => {
    fetchDashboardCounts()
  }, [])

  // Debounced search / pagination / tab switch
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === 'analyzed') {
        fetchAnalyzedCollections(1, pageSize, searchQuery)
      } else {
        fetchRejectedCollections(1, pageSize, searchQuery)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, pageSize, activeTab])

  // Handle Tab Switch
  const handleTabSwitch = (newTab: DashboardTab) => {
    if (newTab === activeTab) return
    setActiveTab(newTab)
    setSearchQuery('')
  }

  const currentPagination = activeTab === 'analyzed' ? analyzedPagination : rejectedPagination

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <PageBreadcrumb title="Dashboard" />
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Routes & Vendors */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-[13px] font-semibold text-slate-400 tracking-wider">Total Routes:</p>
              <p className="text-[13px] font-bold text-slate-800 uppercase">{counts.route}</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-[13px] font-semibold text-slate-400 tracking-wider">Total Vendors:</p>
              <p className="text-[13px] font-bold text-slate-800 uppercase">{counts.vendor}</p>
            </div>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-l-to-br from-primary to-secondary text-white flex items-center justify-center shadow-md shadow-primary/25">
            <Users className="w-6 h-6 strokeWidth={2}" />
          </div>
        </div>

        {/* Card 2: Milk Operations */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-[13px] font-semibold text-slate-400 tracking-wider">Milk Collected:</p>
              <p className="text-[13px] font-bold text-slate-800 uppercase">{counts.collection}</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-[13px] font-semibold text-slate-400 tracking-wider">Milk Analyzed:</p>
              <p className="text-[13px] font-bold text-emerald-600 uppercase">{counts.analyze}</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-[13px] font-semibold text-slate-400 tracking-wider">Milk Rejected:</p>
              <p className="text-[13px] font-bold text-rose-600 uppercase">{counts.rejected}</p>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-l-to-br from-pink-600 to-pink-300 text-white flex items-center justify-center shadow-md shadow-pink-500/20">
            <FileText className="w-6 h-6 strokeWidth={2}" />
          </div>
        </div>

        {/* Card 3: Supervisors & Users */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-[13px] font-semibold text-slate-400 tracking-wider">Total Supervisors:</p>
              <p className="text-[13px] font-bold text-slate-800 uppercase">{counts.supervisor}</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-[13px] font-semibold text-slate-400 tracking-wider">Total Users:</p>
              <p className="text-[13px] font-bold text-slate-800 uppercase">{counts.user}</p>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-l-to-br from-emerald-600 to-emerald-300 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Calendar className="w-6 h-6 strokeWidth={2}" />
          </div>
        </div>

        {/* Card 4: Machine Connections */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-[13px] font-semibold text-slate-400 tracking-wider">Weight Scale:</p>
              <p className="text-[13px] font-bold text-slate-800 uppercase">{connectedScales}/1</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-[13px] font-semibold text-slate-400 tracking-wider">Milk Analyzer:</p>
              <p className="text-[13px] font-bold text-slate-800 uppercase">{connectedAnalyzers}/4</p>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-l-to-br from-orange-600 to-orange-300 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
            <CheckCircle2 className="w-6 h-6 strokeWidth={2}" />
          </div>
        </div>
      </div>

      {/* Today's Data Card (Tabbed View) */}
      <div className="p-3 sm:p-4 bg-white rounded-2xl border border-slate-100 shadow-xs space-y-4">
        {/* Card Title & Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-800">Today's Data</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              {formatDateForDisplay(todayDate)}
            </span>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => handleTabSwitch('analyzed')}
              className={`pb-1 px-1 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                activeTab === 'analyzed'
                  ? 'border-green-700 text-green-700'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Analyzed ({analyzedPagination.total})</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabSwitch('rejected')}
              className={`pb-1 px-1 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                activeTab === 'rejected'
                  ? 'border-rose-500 text-rose-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Rejected ({rejectedPagination.total})</span>
            </button>
          </div>
        </div>

        {/* Table Toolbar */}
        <TableToolbar
          pageSize={pageSize}
          onPageSizeChange={(val) => setPageSize(val === 'all' ? 'all' : Number(val))}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder={
            activeTab === 'analyzed'
              ? 'Search sample code, route or vendor...'
              : 'Search DSK, route or supervisor...'
          }
        />

        {/* Analyzed Table */}
        {activeTab === 'analyzed' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-500/10 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-2.5 px-2 whitespace-nowrap">Sample Code</th>
                  <th className="py-2.5 px-2 whitespace-nowrap">Shift</th>
                  <th className="py-2.5 px-2 whitespace-nowrap">Plant</th>
                  <th className="py-2.5 px-2 whitespace-nowrap">Route Name</th>
                  <th className="py-2.5 px-2 whitespace-nowrap">Vendor Name</th>
                  <th className="py-2.5 px-2 whitespace-nowrap">Weight System</th>
                  <th className="py-2.5 px-2 whitespace-nowrap">Cans Type</th>
                  <th className="py-2.5 px-2 whitespace-nowrap">Milk Type</th>
                  <th className="py-2.5 px-2 whitespace-nowrap">Milk Status</th>
                  <th className="py-2.5 px-2 whitespace-nowrap">Cans</th>
                  <th className="py-2.5 px-2 whitespace-nowrap">Net Weight</th>
                  <th className="py-2.5 px-2 whitespace-nowrap">FAT (%)</th>
                  <th className="py-2.5 px-2 whitespace-nowrap">SNF (%)</th>
                  <th className="py-2.5 px-2 whitespace-nowrap">CLR (%)</th>
                  <th className="py-2.5 px-2 whitespace-nowrap">Tipping Time</th>
                  <th className="py-2.5 px-2 whitespace-nowrap text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loading && (
                  <tr>
                    <td colSpan={16} className="py-4 text-center text-slate-400 font-medium">
                      Loading today's analyzed collections...
                    </td>
                  </tr>
                )}
                {!loading && collections.length === 0 && (
                  <tr>
                    <td colSpan={16} className="py-4 text-center text-slate-400 font-medium">
                      No analyzed collections recorded for today ({formatDateForDisplay(todayDate)})
                    </td>
                  </tr>
                )}
                {!loading &&
                  collections.map((item, index) => (
                    <tr key={item.id ?? index} className="hover:bg-slate-50/70 transition">
                      <td className="py-2 px-2 font-semibold text-primary">{item.sampleCode}</td>
                      <td className="py-2 px-2">
                        {/* <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                            String(item.shift) === '1'
                              ? 'bg-orange-50 text-orange-500 border-orange-200'
                              : String(item.shift) === '2'
                                ? 'bg-sky-50 text-sky-500 border-sky-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {String(item.shift) === '1'
                            ? 'Morning'
                            : String(item.shift) === '2'
                              ? 'Evening'
                              : `Shift ${item.shift}`}
                        </span> */}
                        {item.shift}
                      </td>
                      <td className="py-2 px-2 font-semibold text-slate-800">{item.plant}</td>
                      <td className="py-2 px-2 font-semibold text-primary max-w-36 truncate">
                        {item.rootCode}
                      </td>
                      <td className="py-2 px-2 font-semibold text-primary">{item.vendorCode}</td>
                      <td className="py-2 px-2 font-bold text-slate-900">{item.weightSystem}</td>
                      <td className="py-2 px-2 font-semibold text-primary">{item.canType}</td>
                      <td className="py-2 px-2">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                            String(item.milkType).toLowerCase() === 'cow'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : String(item.milkType).toLowerCase() === 'buffalo'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                : String(item.milkType).toLowerCase() === 'mixed'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-gray-50 text-gray-700 border-gray-200'
                          }`}
                        >
                          {item.milkType}
                        </span>
                      </td>
                      <td className="py-2 px-2 font-semibold text-primary">{item.milkStatus}</td>
                      <td className="py-2 px-2 font-semibold text-primary">{item.noOfCans}</td>
                      <td className="py-2 px-2 font-bold text-emerald-600">
                        {Number(item.netWeight || item.netLtr || 0).toFixed(1)}
                      </td>
                      <td className="py-2 px-2 font-bold text-slate-800">
                        {Number(item.fat || 0) > 0 ? `${Number(item.fat).toFixed(1)}%` : '0.0%'}
                      </td>
                      <td className="py-2 px-2 font-bold text-slate-800">
                        {Number(item.snf || 0) > 0 ? `${Number(item.snf).toFixed(1)}%` : '0.0%'}
                      </td>
                      <td className="py-2 px-2 font-bold text-slate-800">{item.clr}</td>
                      <td className="py-2 px-2 font-semibold text-primary">{item.tipingTime}</td>
                      <td className="py-2 px-2 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                            Number(item.isAnalyse) === 1
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {Number(item.isAnalyse) === 1 ? 'Analyzed' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Rejected Table */}
        {activeTab === 'rejected' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-500/10 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-2.5 px-2 whitespace-nowrap">ID</th>
                  <th className="py-2.5 px-2 whitespace-nowrap">Shift</th>
                  <th className="py-2.5 px-2 whitespace-nowrap">Plant</th>
                  <th className="py-2.5 px-2 whitespace-nowrap">Route Name</th>
                  <th className="py-2.5 px-2 whitespace-nowrap">DSK Code</th>
                  <th className="py-2.5 px-2 whitespace-nowrap">DSK Name</th>
                  <th className="py-2.5 px-2 whitespace-nowrap">Supervisor</th>
                  <th className="py-2.5 px-2 whitespace-nowrap">No. of Cans</th>
                  <th className="py-2.5 px-2 whitespace-nowrap">Approx Qty (LTR)</th>
                  <th className="py-2.5 px-2 whitespace-nowrap">Reason</th>
                  <th className="py-2.5 px-2 whitespace-nowrap text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loading && (
                  <tr>
                    <td colSpan={11} className="py-4 text-center text-slate-400 font-medium">
                      Loading today's rejections...
                    </td>
                  </tr>
                )}
                {!loading && rejections.length === 0 && (
                  <tr>
                    <td colSpan={11} className="py-4 text-center text-slate-400 font-medium">
                      No milk rejections recorded for today ({formatDateForDisplay(todayDate)})
                    </td>
                  </tr>
                )}
                {!loading &&
                  rejections.map((item, index) => (
                    <tr key={item.id ?? index} className="hover:bg-slate-50/70 transition">
                      <td className="py-2 px-2 font-semibold text-primary">{item.id}</td>
                      <td className="py-2 px-2 font-semibold text-primary">{item.shift}</td>
                      <td className="py-2 px-2 font-semibold text-slate-800">{item.plant}</td>
                      <td className="py-2 px-2 font-semibold text-primary">
                        {(item as any).routeName || item.route}
                      </td>
                      <td className="py-2 px-2 text-slate-700">{item.dskCode}</td>
                      <td className="py-2 px-2 font-semibold text-slate-800">{item.dskName}</td>
                      <td className="py-2 px-2 text-slate-700">{item.supervisor}</td>
                      <td className="py-2 px-2 text-slate-700">{item.noOfCanes}</td>
                      <td className="py-2 px-2 font-bold text-emerald-600">{item.aproxQuantity}</td>
                      <td className="py-2 px-2 text-slate-700">{item.reason}</td>
                      <td className="py-2 px-2 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                            item.syncStatus === 'synced' || item.syncStatus === '1'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {item.syncStatus === 'synced' || item.syncStatus === '1'
                            ? 'Synced'
                            : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Pagination */}
        <TablePagination
          page={currentPagination.page}
          totalPages={currentPagination.totalPages}
          totalItems={currentPagination.total}
          pageSize={pageSize}
          hasNextPage={currentPagination.hasNextPage}
          hasPrevPage={currentPagination.hasPrevPage}
          loading={loading}
          itemName={activeTab === 'analyzed' ? 'collections' : 'rejections'}
          onPageChange={(newPage) => {
            if (activeTab === 'analyzed') {
              fetchAnalyzedCollections(newPage, pageSize, searchQuery)
            } else {
              fetchRejectedCollections(newPage, pageSize, searchQuery)
            }
          }}
        />
      </div>
    </div>
  )
}

export default DashboardPage