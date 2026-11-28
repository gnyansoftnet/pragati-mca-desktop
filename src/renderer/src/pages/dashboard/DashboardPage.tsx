import React, { useState, useEffect, useRef } from 'react'
import { Users, FileText, Calendar, CheckCircle2, FileCheck, AlertTriangle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useSerialSnapshot } from '../../hooks/useSerial'
import { useShift } from '../../hooks/useShift'
import { useNetwork } from '../../hooks/useNetwork'
import { isAnalyzer } from '@shared/dtos/connection/serial-com-port.dto'
import PageBreadcrumb from '../../components/breadcrumbs/PageBreadcrumb'
import TableToolbar from '../../components/table/TableToolbar'
import TablePagination from '../../components/table/TablePagination'
import CustomForm from '../../components/customform/CustomForm'
import type { MilkCollectionDto } from '@shared/dtos/milk-collection/milk-collection.dto'
import type { MilkRejectionResponseDto } from '@shared/dtos/milk-collection/milk-rejection.dto'
import type { DashboardCountDto } from '@shared/dtos/master/master.dto'

export type DashboardTab = 'analyzed' | 'rejected'

export const DashboardPage: React.FC = () => {
  const { user, menus } = useAuth()
  const snap = useSerialSnapshot()
  const { shiftOptions, currentShiftId, loadingShifts, getShiftLabel } = useShift(user?.plant)
  const { verifyConnection } = useNetwork()

  const hasSyncedRef = useRef(false)

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
    rejected: '0',
    milkColleWeight: '0.0',
    morningMilkColleWeight: '0.0',
    eveningMilkColleWeight: '0.0',
    milkRejWeight: '0',
    morningMilkRejWeight: '0',
    eveningMilkRejWeight: '0',
    milkSample: '0',
    morningMilkSample: '0',
    eveningMilkSample: '0'
  })

  // Active tab state
  const [activeTab, setActiveTab] = useState<DashboardTab>('analyzed')

  // Shift filter state (defaults to currentShiftId from useShift)
  const [shift, setShift] = useState<string>(currentShiftId)
  // Automatically sync shift when currentShiftId is resolved
  // useEffect(() => {
  //   if (currentShiftId) {
  //     setShift(currentShiftId)
  //   }
  // }, [currentShiftId])
  useEffect(() => {
    if (currentShiftId) {
      setShift(currentShiftId)
      if (activeTab === 'analyzed') {
        fetchAnalyzedCollections(1, pageSize, searchQuery, currentShiftId)
      } else {
        fetchRejectedCollections(1, pageSize, searchQuery, currentShiftId)
      }
    }
  }, [currentShiftId])

  // Handle Shift dropdown change & immediately re-fetch the active list with the new shift ID
  const handleShiftChange = (e: any) => {
    const newShift = e?.target ? e.target.value : (e?.value ?? e)
    setShift(newShift)

    if (activeTab === 'analyzed') {
      fetchAnalyzedCollections(1, pageSize, searchQuery, newShift)
    } else {
      fetchRejectedCollections(1, pageSize, searchQuery, newShift)
    }
  }

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
          user: item.user ?? '0',
          vendor: item.vendor ?? '0',
          route: item.route ?? '0',
          supervisor: item.supervisor ?? '0',
          collection: item.collection ?? '0',
          analyze: item.analyze ?? '0',
          rejected: item.rejected ?? '0',
          milkColleWeight: item.milkColleWeight ?? '0.0',
          morningMilkColleWeight: item.morningMilkColleWeight ?? '0.0',
          eveningMilkColleWeight: item.eveningMilkColleWeight ?? '0.0',
          milkRejWeight: item.milkRejWeight ?? '0',
          morningMilkRejWeight: item.morningMilkRejWeight ?? '0',
          eveningMilkRejWeight: item.eveningMilkRejWeight ?? '0',
          milkSample: item.milkSample ?? 0,
          morningMilkSample: item.morningMilkSample ?? '0',
          eveningMilkSample: item.eveningMilkSample ?? '0'
        })
      }
    } catch (error) {
      console.error('Failed to load dashboard counts:', error)
    }
  }

  const hasRouteAccess = menus.some((item) => {
    const isDirectMatch =
      String(item.pageId) === '4' ||
      item.title?.trim().toLowerCase() === 'routes master' ||
      item.path === '/routes'
    const isChildMatch = item.children?.some(
      (child) =>
        String(child.pageId) === '4' ||
        child.title?.trim().toLowerCase().includes('vendor') ||
        child.path === '/routes'
    )
    return isDirectMatch || isChildMatch
  })

  const hasVendorAccess = menus.some((item) => {
  const isDirectMatch =
    String(item.pageId) === '5' ||
    item.title?.trim().toLowerCase().includes('vendor') ||
    item.path === '/vendors'
  const isChildMatch = item.children?.some(
    (child) =>
      String(child.pageId) === '5' ||
      child.title?.trim().toLowerCase().includes('vendor') ||
      child.path === '/vendors'
  )
  return isDirectMatch || isChildMatch
})

  const hasAnalyzeAccess = menus.some((item) => {
    const isDirectMatch =
      String(item.pageId) === '3' ||
      item.title?.trim().toLowerCase() === 'analyze' ||
      item.path === '/analyze'
    const isChildMatch = item.children?.some(
      (child) =>
        String(child.pageId) === '3' ||
        child.title?.trim().toLowerCase() === 'analyze' ||
        child.path === '/analyze'
    )
    return isDirectMatch || isChildMatch
  })
  const hasProcurementAccess = menus.some((item) => {
    const isDirectMatch =
      String(item.pageId) === '1' ||
      item.title?.trim().toLowerCase() === 'procurement collection' ||
      item.path === '/procurement-collection'
    const isChildMatch = item.children?.some(
      (child) =>
        String(child.pageId) === '1' ||
        child.title?.trim().toLowerCase() === 'procurement collection' ||
        child.path === '/procurement-collection'
    )
    return isDirectMatch || isChildMatch
  })

  // 2. Fetch today's analyzed milk collections
  const fetchAnalyzedCollections = async (
    pageNo = analyzedPagination.page,
    limitVal = pageSize,
    searchVal = searchQuery,
    shiftVal = shift
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
        shiftVal ? Number(shiftVal) : undefined,
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
    searchVal = searchQuery,
    shiftVal = shift
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
        shiftVal ? Number(shiftVal) : undefined,
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
    // fetchAnalyzedCollections()
    fetchRejectedCollections()
  }, [])

  //sync data
  const syncMasterDataSilently = async () => {
    const hasNet = await verifyConnection()
    if (!hasNet) {
      return
    }

    const plant = String(user?.plant || '')
    const org = String(user?.orgCode || '')
    const branch = String(user?.branchCode || '')

    if (!plant) {
      return
    }

    try {
      if (org && branch) {
        await (window as any).api?.syncRoutes(plant, org, branch)
      }
    } catch (err) {
      console.warn('Silent sync routes:', err)
    }

    try {
      if (org && branch) {
        await (window as any).api?.syncSupervisors(plant, org, branch)
      }
    } catch (err) {
      console.warn('Silent sync supervisors:', err)
    }

    try {
      if (org && branch) {
        await (window as any).api?.syncVendors(plant, org, branch)
      }
    } catch (err) {
      console.warn('Silent sync vendors:', err)
    }

    try {
      await (window as any).api?.syncUser(plant, 'false')
    } catch (err) {
      console.warn('Silent sync user:', err)
    }

    // 6. Refresh dashboard count cards with the newly synced numbers
    await fetchDashboardCounts()
  }

  // console.log('user-plant', user?.plant)

  // Trigger silent sync once when Dashboard mounts and user plant is available
  useEffect(() => {
    if (user?.plant && !hasSyncedRef.current) {
      hasSyncedRef.current = true
      syncMasterDataSilently()
    }
  }, [user?.plant])

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
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-start justify-between">
          <div className="space-y-0.3">
            <h5 className="text-[14px] font-semibold text-slate-800 tracking-wider">
              <u>Master Data</u>
            </h5>
            {hasRouteAccess && (
              <div className="flex items-center gap-2">
                <p className="text-[12px] font-semibold text-slate-400 tracking-wider">
                  Total Routes:
                </p>

                <p className="text-[12px] font-bold text-slate-800 uppercase">{counts.route}</p>
              </div>
            )}

            {hasVendorAccess && (
              <div className="flex items-center gap-2">
                <p className="text-[12px] font-semibold text-slate-400 tracking-wider">
                  Total Vendors:
                </p>
                <p className="text-[12px] font-bold text-slate-800 uppercase">{counts.vendor}</p>
              </div>
            )}

            {!hasAnalyzeAccess && !hasProcurementAccess && (
              <div className="flex items-center gap-2">
                <p className="text-[12px] font-semibold text-slate-400 tracking-wider">
                  Total Users:
                </p>
                <p className="text-[12px] font-bold text-slate-800 uppercase">{counts.user}</p>
              </div>
            )}
          </div>

          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white flex items-center justify-center shadow-md shadow-primary/25">
            <Users className="w-6 h-6 strokeWidth={2}" />
          </div>
        </div>

        {/* Card 2: Milk Operations */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-start justify-between">
          <div className="space-y-0.3">
            <h5 className="text-[14px] font-semibold text-slate-800 tracking-wider">
              <u>Todays Collection</u>
            </h5>
            <div className="flex items-center gap-2">
              <p className="text-[12px] font-semibold text-slate-400 tracking-wider">Total Milk:</p>
              <p className="text-[12px] font-bold text-slate-800 uppercase">
                {Number(counts.milkColleWeight || 0).toFixed(1)} kg
              </p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-[12px] font-semibold text-slate-400 tracking-wider">Morning:</p>
              <p className="text-[12px] font-bold text-slate-800 uppercase">
                {Number(counts.morningMilkColleWeight || 0).toFixed(1)} kg
              </p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-[12px] font-semibold text-slate-400 tracking-wider">Evening:</p>
              <p className="text-[12px] font-bold text-slate-800 uppercase">
                {Number(counts.eveningMilkColleWeight || 0).toFixed(1)} kg
              </p>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-pink-600 to-pink-300 text-white flex items-center justify-center shadow-md shadow-pink-500/20">
            <FileText className="w-6 h-6 strokeWidth={2}" />
          </div>
        </div>

        {/* Card 3: Supervisors & Users */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-start justify-between">
          <div className="space-y-0.3">
            <h5 className="text-[14px] font-semibold text-slate-800 tracking-wider">
              <u>Todays Rejection</u>
            </h5>
            <div className="flex items-center gap-2">
              <p className="text-[12px] font-semibold text-slate-400 tracking-wider">Total Milk:</p>
              <p className="text-[12px] font-bold text-slate-800 uppercase">
                {Number(counts.milkRejWeight || 0).toFixed(1)} kg
              </p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-[12px] font-semibold text-slate-400 tracking-wider">Morning:</p>
              <p className="text-[12px] font-bold text-slate-800 uppercase">
                {Number(counts.morningMilkRejWeight || 0).toFixed(1)} kg
              </p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-[12px] font-semibold text-slate-400 tracking-wider">Evening:</p>
              <p className="text-[12px] font-bold text-slate-800 uppercase">
                {Number(counts.eveningMilkRejWeight || 0).toFixed(1)} kg
              </p>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r  from-emerald-600 to-emerald-300 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Calendar className="w-6 h-6 strokeWidth={2}" />
          </div>
        </div>

        {/* Card 4: Machine Connections */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-start justify-between">
          <div className="space-y-0.3">
            <h5 className="text-[14px] font-semibold text-slate-800 tracking-wider">
              <u>Todays Samples</u>
            </h5>
            <div className="flex items-center gap-2">
              <p className="text-[12px] font-semibold text-slate-400 tracking-wider">
                Total Samples:
              </p>
              <p className="text-[12px] font-bold text-slate-800 uppercase">
                {counts.milkSample ?? 0}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-[12px] font-semibold text-slate-400 tracking-wider">Morning:</p>
              <p className="text-[12px] font-bold text-slate-800 uppercase">
                {counts.morningMilkSample ?? 0}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-[12px] font-semibold text-slate-400 tracking-wider">Evening:</p>
              <p className="text-[12px] font-bold text-slate-800 uppercase">
                {counts.eveningMilkSample ?? 0}
              </p>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-orange-600 to-orange-300 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
            <CheckCircle2 className="w-6 h-6 strokeWidth={2}" />
          </div>
        </div>
        {/* <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-[13px] font-semibold text-slate-400 tracking-wider">
                Weight Scale:
              </p>
              <p className="text-[13px] font-bold text-slate-800 uppercase">{connectedScales}/1</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-[13px] font-semibold text-slate-400 tracking-wider">
                Milk Analyzer:
              </p>
              <p className="text-[13px] font-bold text-slate-800 uppercase">
                {connectedAnalyzers}/4
              </p>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-orange-600 to-orange-300 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
            <CheckCircle2 className="w-6 h-6 strokeWidth={2}" />
          </div>
        </div> */}
      </div>

      {/* Today's Data Card (Tabbed View) */}
      <div className="p-3 sm:p-4 bg-white rounded-2xl border border-slate-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-800">Today's Data</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                {formatDateForDisplay(todayDate)}
              </span>
            </div>
            ,
            <div className="w-full sm:w-60 flex items-center gap-2">
              <label className="text-base font-bold text-slate-800 block">
                Shift{' '}
                {loadingShifts && <span className="text-slate-400 font-normal">(Loading...)</span>}
              </label>
              <CustomForm.CustomSelectSearchField
                name="shift"
                value={shift}
                onChange={handleShiftChange}
                options={shiftOptions}
                placeholder={loadingShifts ? 'Loading shifts...' : 'Select shift...'}
                disabled={loadingShifts}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => handleTabSwitch('analyzed')}
              className={`pb-1 px-1 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                activeTab === 'analyzed'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Procurement Data ({analyzedPagination.total})</span>
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
              <span>Rejected Data ({rejectedPagination.total})</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* <div className="w-full sm:w-60 space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">
              Shift{' '}
              {loadingShifts && <span className="text-slate-400 font-normal">(Loading...)</span>}
            </label>
            <CustomForm.CustomSelectSearchField
              name="shift"
              value={shift}
              onChange={handleShiftChange}
              options={shiftOptions}
              placeholder={loadingShifts ? 'Loading shifts...' : 'Select shift...'}
              disabled={loadingShifts}
            />
          </div> */}
        </div>

        <TableToolbar
          pageSize={pageSize}
          onPageSizeChange={(val) => setPageSize(val === 'all' ? 'all' : Number(val))}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder={
            activeTab === 'analyzed'
              ? 'Search sample no, route or vendor...'
              : 'Search DSK, route or supervisor...'
          }
        />

        {activeTab === 'analyzed' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-500/10 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-2.5 px-2 whitespace-nowrap">Sample No</th>
                  <th className="py-2.5 px-2 whitespace-nowrap">Shift</th>
                  <th className="py-2.5 px-2 whitespace-nowrap">Plant</th>
                  <th className="py-2.5 px-2 whitespace-nowrap">Route Name</th>
                  <th className="py-2.5 px-2 whitespace-nowrap">Vendor Name</th>
                  <th className="py-2.5 px-2 whitespace-nowrap">Weight System</th>
                  <th className="py-2.5 px-2 whitespace-nowrap">Cans Type</th>
                  <th className="py-2.5 px-2 whitespace-nowrap">Milk Type</th>
                  <th className="py-2.5 px-2 whitespace-nowrap">Milk Status</th>
                  <th className="py-2.5 px-2 whitespace-nowrap">No. of Cans</th>
                  <th className="py-2.5 px-2 whitespace-nowrap">Gross Weight</th>
                  <th className="py-2.5 px-2 whitespace-nowrap">Net Weight</th>
                  <th className="py-2.5 px-2 whitespace-nowrap">Net Ltr</th>
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
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold border bg-rose-50 text-rose-500 border-rose-200">
                          {item.shiftName}
                        </span>
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
                        {Number(item.grossWeight).toFixed(1)}
                      </td>
                      <td className="py-2 px-2 font-bold text-emerald-600">
                        {Number(item.netWeight).toFixed(1)}
                      </td>
                      <td className="py-2 px-2 font-bold text-emerald-600">
                        {Number(item.netLtr).toFixed(1)}
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

        {activeTab === 'rejected' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-500/10 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-2.5 px-2 whitespace-nowrap">Date</th>
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
                      {/* <td className="py-2 px-2 font-semibold text-primary">{item.id}</td> */}
                      <td className="py-2 px-2 text-slate-700">
                        {item.createdAt
                          ? (() => {
                              const d = new Date(item.createdAt)
                              return isNaN(d.getTime())
                                ? String(item.createdAt)
                                : d.toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: '2-digit'
                                  })
                            })()
                          : ''}
                      </td>
                      <td className="py-2 px-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold border bg-rose-50 text-rose-500 border-rose-200">
                          {item.shiftName}
                        </span>
                      </td>
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
              fetchAnalyzedCollections(newPage, pageSize, searchQuery, shift)
            } else {
              fetchRejectedCollections(newPage, pageSize, searchQuery, shift)
            }
          }}
        />
      </div>
    </div>
  )
}

export default DashboardPage
