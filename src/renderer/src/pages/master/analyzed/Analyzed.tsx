import React, { useEffect, useState } from 'react'
import { RefreshCw, UploadCloud, Search, Clock } from 'lucide-react'
import { toast } from 'react-toastify'
import CustomForm from '@renderer/components/customform/CustomForm'
import PageBreadcrumb from '@renderer/components/breadcrumbs/PageBreadcrumb'
import Button1 from '@renderer/components/buttons/Button1'
import TableToolbar from '@renderer/components/table/TableToolbar'
import TablePagination from '@renderer/components/table/TablePagination'
import type { MilkCollectionDto } from '@shared/dtos/milk-collection/milk-collection.dto'
import { useAuth } from '@renderer/context/AuthContext'
import { useNetwork } from '@renderer/hooks/useNetwork'
import { useShift } from '@renderer/hooks/useShift'

export const Analyzed: React.FC = () => {
  const { user } = useAuth()
  const { verifyConnection } = useNetwork()
  const { shiftOptions, currentShiftId, loadingShifts, getShiftLabel } = useShift(user?.plant)
  const [isSyncing, setIsSyncing] = useState<boolean>(false)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  

  // Format today's date as YYYY-MM-DD
  const getCurrentLocalDate = (): string => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const [date, setDate] = useState<string>(getCurrentLocalDate())
  const [shift, setShift] = useState<string>(currentShiftId)

  // Applied filter states (locked until user clicks Search)
  const [appliedDate, setAppliedDate] = useState<string>(getCurrentLocalDate())
  const [appliedShift, setAppliedShift] = useState<string>('')

  useEffect(() => {
    if (currentShiftId) {
      setShift(currentShiftId)
      setAppliedShift(currentShiftId)
    }
  }, [currentShiftId])

  const [showConfirm, setShowConfirm] = useState(false)
  const [collections, setCollections] = useState<MilkCollectionDto[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  const [pageSize, setPageSize] = useState<number | 'all'>(10)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  })

  // Fetch paginated collections with: params, shift, date, isAnalyse (1)
  const fetchPaginatedCollections = async (
    pageNo = pagination.page,
    limitVal = pageSize,
    searchVal = searchQuery,
    selectedShift = appliedShift,
    selectedDate = appliedDate
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
        selectedShift ? Number(selectedShift) : undefined,
        selectedDate,
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
          setPagination(response.pagination)
        }
      }
    } catch (error) {
      console.error('Failed to fetch milk collections:', error)
      toast.error('Failed to fetch milk collections.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitFilter = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!date) {
      toast.warn('Please select a date.')
      return
    }
    setAppliedDate(date)
    setAppliedShift(shift)
    fetchPaginatedCollections(1, pageSize, searchQuery, shift, date)
  }

  // Initial load on mount & debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPaginatedCollections(1, pageSize, searchQuery, appliedShift, appliedDate)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, pageSize, appliedShift, appliedDate])

  // Handle Sync to Server with date and shift
  const handleStartSync = async () => {
    const hasNet = await verifyConnection()
    if (!hasNet) {
      toast.error('Cannot sync: No internet connection! Please check your network.')
      setShowConfirm(false)
      return
    }

    try {
      setIsSyncing(true)
      setShowConfirm(false)

      const result = await window.api.syncMilkCollection(appliedDate, Number(appliedShift))

      if (
        result &&
        (result.success === true || result.success === 1 || result.data?.success === 1)
      ) {
        const stats = result.data
        const summaryMsg = stats?.message || result.message || 'Milk collection sync completed!'
        const counts = stats
          ? ` (Total: ${stats.total ?? 0}, Inserted: ${stats.inserted ?? 0}, Updated: ${stats.updated ?? 0})`
          : ''
        toast.success(`${summaryMsg}${counts}`)

        await fetchPaginatedCollections(1, pageSize, searchQuery, appliedShift, appliedDate)
      } else {
        toast.error(result?.message || result?.data?.message || 'Failed to sync milk collections.')
      }
    } catch (error: any) {
      console.error('Failed to sync milk collection:', error)
      toast.error(error?.message || 'An error occurred while syncing milk collections.')
    } finally {
      setIsSyncing(false)
    }
  }

  // Format Date object or Date string to "DD-MM-YYYY" (or "DD-MM-YYYY HH:mm:ss" if time is present)
  const formatLastUpdated = (rawDate?: string | Date | null): string => {
    if (!rawDate) return ''
    const d = new Date(rawDate)
    if (isNaN(d.getTime())) return String(rawDate)

    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    const seconds = String(d.getSeconds()).padStart(2, '0')

    // If time is 00:00:00, show clean date "DD-MM-YYYY"
    if (hours === '00' && minutes === '00' && seconds === '00') {
      return `${day}-${month}-${year}`
    }

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`
  }

  const fetchLastSynced = async () => {
    try {
      if (typeof window !== 'undefined' && (window.api as any)?.getLastSynckedMilkCollection) {
        const res = await (window.api as any).getLastSynckedMilkCollection()
        const item = Array.isArray(res) ? res[0] : res
        // Property name returned from milk_collection_sync_log is lastSycfrom
        const syncDate = item?.lastSycfrom || item?.lastSyncFrom || item?.lastUpdated
        if (syncDate) {
          setLastUpdated(formatLastUpdated(syncDate))
        }
      }
    } catch (error) {
      console.error('Failed to fetch last synced milk collection:', error)
    }
  }


  useEffect(() => {
    fetchLastSynced()
  }, [])

  // Convert YYYY-MM-DD to DD-MM-YYYY for display only
  const formatDateForDisplay = (dateStr?: string): string => {
    if (!dateStr) return ''
    const parts = dateStr.split('-')
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`
    }
    return dateStr
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageBreadcrumb title="Procurement Samples" />

        <div className="flex items-center justify-end gap-2">
          {lastUpdated && (
            <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              Last Synced: <strong className="text-slate-700">{lastUpdated}</strong>
            </span>
          )}
          <Button1
            disabled={isSyncing}
            onClick={() => setShowConfirm(true)}
            variant="primary"
            icon={
              isSyncing ? (
                <RefreshCw className="w-3.5 h-3.5 text-white animate-spin" />
              ) : (
                <UploadCloud className="w-3.5 h-3.5 text-white" />
              )
            }
            label={isSyncing ? 'Syncing...' : 'Sync to server'}
          />
        </div>

        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fade-in ">
            <div className="w-full max-w-md bg-white shadow-2xl border rounded-2xl border-slate-100 p-6 text-center transform transition-all scale-100">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner">
                <RefreshCw className="w-8 h-8 animate-spin-slow" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Sync to Server</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                This will upload analyzed milk collection records for Date:{' '}
                <strong className="text-slate-800">{formatDateForDisplay(appliedDate)}</strong> and
                Shift:{' '}
                <strong className="text-slate-800">
                  {appliedShift === '1'
                    ? 'Morning'
                    : appliedShift === '2'
                      ? 'Evening'
                      : appliedShift}
                </strong>{' '}
                to the central cloud server. Are you sure you want to proceed?
              </p>

              {/* Current Context Badges */}
              <div className="mb-6 py-2 px-3 bg-slate-50 rounded-xl text-xs text-slate-600 flex flex-wrap justify-center gap-4">
                <span>
                  Plant:{' '}
                  <strong className="text-slate-800">{user?.plantName || user?.plant}</strong>
                </span>
                <span>
                  User: <strong className="text-slate-800">{user?.userName || '-'}</strong>
                </span>
                <span>
                  Date:{' '}
                  <strong className="text-slate-800">{formatDateForDisplay(appliedDate)}</strong>
                </span>
                <span>
                  Shift:{' '}
                  <strong className="text-slate-800">
                    {appliedShift === '1'
                      ? 'Morning'
                      : appliedShift === '2'
                        ? 'Evening'
                        : appliedShift}
                  </strong>
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={() => setShowConfirm(false)}
                  className="w-1/2 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={handleStartSync}
                  className="w-1/2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Syncing...</span>
                    </>
                  ) : (
                    'Yes, Sync to Server'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Table Card */}
      <div className="mt-2 p-3 sm:p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
        {/* Single Date & Shift Filter Bar */}
        <CustomForm onSubmit={handleSubmitFilter} className="w-full">
          <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-3 mb-3 items-end">
            {/* Date Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Date</label>
              <CustomForm.CustomDateField
                name="date"
                value={date}
                onChange={(e: any) => setDate(e.target.value)}
              />
            </div>

            {/* Shift Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Select Shift{' '}
                {loadingShifts && <span className="text-slate-400 font-normal">(Loading...)</span>}
              </label>
              <CustomForm.CustomSelectSearchField
                name="shift"
                value={shift}
                onChange={(e: any) => setShift(e.target.value)}
                options={shiftOptions}
                placeholder={loadingShifts ? 'Loading shifts...' : 'Select shift...'}
                disabled={loadingShifts}
              />
            </div>

            {/* Search Button */}
            <div className="flex items-end justify-start">
              <Button1
                variant="primary"
                icon={<Search className="w-3.5 h-3.5 text-white" />}
                label={loading ? 'Searching...' : 'Search'}
                onClick={handleSubmitFilter}
                disabled={loading}
              />
            </div>
          </div>
        </CustomForm>

        <TableToolbar
          pageSize={pageSize}
          onPageSizeChange={(val) => setPageSize(val === 'all' ? 'all' : Number(val))}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search sample no, route or vendor..."
        />

        {/* Table Following Rearranged Header & Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-500/10 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-2 px-2 whitespace-nowrap">Sample No</th>
                <th className="py-2 px-2 whitespace-nowrap">Date</th>
                <th className="py-2 px-2 whitespace-nowrap">Shift</th>
                <th className="py-2 px-2 whitespace-nowrap">Plant Id</th>
                <th className="py-2 px-2 whitespace-nowrap">Route Name</th>
                <th className="py-2 px-2 whitespace-nowrap">Vendor Name</th>
                <th className="py-2 px-2 whitespace-nowrap">Weight System</th>
                <th className="py-2 px-2 whitespace-nowrap">Cans Type</th>
                <th className="py-2 px-2 whitespace-nowrap">Milk Type</th>
                <th className="py-2 px-2 whitespace-nowrap">Milk Status</th>
                <th className="py-2 px-2 whitespace-nowrap">No. of Cans</th>
                <th className="py-2 px-2 whitespace-nowrap">Gross Weight</th>
                <th className="py-2 px-2 whitespace-nowrap">Net Weight</th>
                <th className="py-2 px-2 whitespace-nowrap">Tipping Time</th>
                <th className="py-2 px-2 whitespace-nowrap">FAT (%)</th>
                <th className="py-2 px-2 whitespace-nowrap">SNF (%)</th>
                <th className="py-2 px-2 whitespace-nowrap">CLR (%)</th>
                <th className="py-2 px-2 whitespace-nowrap text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading && (
                <tr>
                  <td colSpan={18} className="py-4 text-center text-slate-400 font-medium">
                    Loading collections...
                  </td>
                </tr>
              )}
              {!loading && collections.length === 0 && (
                <tr>
                  <td colSpan={18} className="py-4 text-center text-slate-400 font-medium">
                    No milk collections found for the selected date and shift
                  </td>
                </tr>
              )}
              {!loading &&
                collections.map((item, index) => (
                  <tr key={item.id ?? index} className="hover:bg-slate-50/70 transition">
                    <td className="py-2 px-4 font-semibold text-primary">{item.sampleCode}</td>
                    <td className="py-2 px-4 font-semibold text-primary">
                      {item.sampleDate
                        ? (() => {
                            const d = new Date(item.sampleDate)
                            return isNaN(d.getTime())
                              ? String(item.sampleDate)
                              : d.toLocaleDateString('en-GB', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: '2-digit'
                                })
                          })()
                        : ''}
                    </td>
                    <td className="py-2 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold border bg-rose-50 text-rose-500 border-rose-200">
                        {item.shiftName}
                      </span>
                    </td>
                    <td className="py-2 px-4 font-semibold text-slate-800">{item.plant}</td>
                    <td className="py-2 px-4 font-semibold text-primary max-w-40 truncate">
                      {item.rootCode}
                    </td>
                    <td className="py-2 px-4 font-semibold text-primary">{item.vendorCode}</td>
                    <td className="py-2 px-4 font-bold text-slate-900">{item.weightSystem}</td>
                    <td className="py-2 px-4 font-semibold text-primary">{item.canType}</td>
                    <td className="py-2 px-4">
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
                    <td className="py-2 px-4 font-semibold text-primary">{item.milkStatus}</td>
                    <td className="py-2 px-4 font-semibold text-primary">{item.noOfCans}</td>
                    <td className="py-2 px-4 font-bold text-slate-800">
                      {Number(item.grossWeight || 0).toFixed(1)}
                    </td>
                    <td className="py-2 px-4 font-bold text-emerald-600">
                      {Number(item.netWeight || item.netLtr || 0).toFixed(1)}
                    </td>
                    <td className="py-2 px-4 font-semibold text-primary">{item.tipingTime}</td>
                    <td className="py-2 px-4 font-bold text-slate-800">
                      {Number(item.fat || 0) > 0 ? `${Number(item.fat).toFixed(1)}%` : '0.0%'}
                    </td>
                    <td className="py-2 px-4 font-bold text-slate-800">
                      {Number(item.snf || 0) > 0 ? `${Number(item.snf).toFixed(1)}%` : '0.0%'}
                    </td>
                    <td className="py-2 px-4 font-bold text-slate-800">{item.clr}</td>
                    <td className="py-2 px-4 text-center">
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

        {/* Table Pagination */}
        <TablePagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          pageSize={pageSize}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          loading={loading}
          itemName="collections"
          onPageChange={(newPage) =>
            fetchPaginatedCollections(newPage, pageSize, searchQuery, appliedShift, appliedDate)
          }
        />
      </div>
    </div>
  )
}

export default Analyzed
