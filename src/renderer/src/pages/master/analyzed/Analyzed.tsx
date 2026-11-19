import React, { useEffect, useState } from 'react'
import { RefreshCw, UploadCloud, Search } from 'lucide-react'
import { toast } from 'react-toastify'
import CustomForm from '@renderer/components/customform/CustomForm'
import PageBreadcrumb from '@renderer/components/breadcrumbs/PageBreadcrumb'
import Button1 from '@renderer/components/buttons/Button1'
import TableToolbar from '@renderer/components/table/TableToolbar'
import TablePagination from '@renderer/components/table/TablePagination'
import type { MilkCollectionDto } from '@shared/dtos/milk-collection/milk-collection.dto'
import { useAuth } from '@renderer/context/AuthContext'
import { useNetwork } from '@renderer/hooks/useNetwork'

export const Analyzed: React.FC = () => {
  const { user } = useAuth()
  const { verifyConnection } = useNetwork()
  const [isSyncing, setIsSyncing] = useState<boolean>(false)

  
  const getCurrentLocalDate = (): string => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  
  const [fromDate, setFromDate] = useState<string>(getCurrentLocalDate())
  const [toDate, setToDate] = useState<string>(getCurrentLocalDate())

  
  const [appliedFromDate, setAppliedFromDate] = useState<string>(getCurrentLocalDate())
  const [appliedToDate, setAppliedToDate] = useState<string>(getCurrentLocalDate())
  const [appliedIsAnalyse, setAppliedIsAnalyse] = useState<number>(1)

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

  
  const fetchPaginatedCollections = async (
    pageNo = pagination.page,
    limitVal = pageSize,
    searchVal = searchQuery,
    fDate = appliedFromDate,
    tDate = appliedToDate,
    isAnalyse = appliedIsAnalyse
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
        fDate,
        tDate,
        isAnalyse
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
    if (fromDate && toDate && fromDate > toDate) {
      toast.warn('From Date cannot be greater than To Date.')
      return
    }
    setAppliedFromDate(fromDate)
    setAppliedToDate(toDate)
    fetchPaginatedCollections(1, pageSize, searchQuery, fromDate, toDate)
  }

  // Initial load on mount & debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPaginatedCollections(1, pageSize, searchQuery, appliedFromDate, appliedToDate)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, pageSize])

  // Handle Sync to Server
  const handleStartSync = async () => {
    // 1. Verify internet connection first
    const hasNet = await verifyConnection()
    if (!hasNet) {
      toast.error('Cannot sync: No internet connection! Please check your network.')
      setShowConfirm(false)
      return
    }

    try {
      setIsSyncing(true)
      setShowConfirm(false)

      // 2. Invoke syncMilkCollection with the selected/applied date range
      const result = await (window.api as any).syncMilkCollection(appliedFromDate, appliedToDate)

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

        // 3. Refresh list with currently applied dates
        await fetchPaginatedCollections(1, pageSize, searchQuery, appliedFromDate, appliedToDate)
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
        <PageBreadcrumb title="Analyzed Collections" />

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

        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fade-in ">
            <div className="w-full max-w-md bg-white shadow-2xl border rounded-2xl border-slate-100 p-6 text-center transform transition-all scale-100">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner">
                <RefreshCw className="w-8 h-8 animate-spin-slow" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Sync to Server</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                This will upload analyzed milk collection records from{' '}
                <strong className="text-slate-800">{formatDateForDisplay(appliedFromDate)}</strong>{' '}
                to <strong className="text-slate-800">{formatDateForDisplay(appliedToDate)}</strong>{' '}
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
                  Date Range:{' '}
                  <strong className="text-slate-800">
                    {formatDateForDisplay(appliedFromDate)} to {formatDateForDisplay(appliedToDate)}
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
        {/* Date Filter Bar */}
        <CustomForm onSubmit={handleSubmitFilter} className="w-full">
          <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-3 mb-3 items-end">
            {/* From Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">From Date</label>
              <CustomForm.CustomDateField
                name="fromDate"
                value={fromDate}
                onChange={(e: any) => setFromDate(e.target.value)}
              />
            </div>

            {/* To Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">To Date</label>
              <CustomForm.CustomDateField
                name="toDate"
                value={toDate}
                onChange={(e: any) => setToDate(e.target.value)}
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-end justify-start">
              <Button1
                variant="primary"
                icon={<Search className="w-3.5 h-3.5 text-white" />}
                label={loading ? 'Filtering...' : 'Submit'}
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
                  <td colSpan={16} className="py-4 text-center text-slate-400 font-medium">
                    Loading collections...
                  </td>
                </tr>
              )}
              {!loading && collections.length === 0 && (
                <tr>
                  <td colSpan={16} className="py-4 text-center text-slate-400 font-medium">
                    No milk collections found for the selected date range
                  </td>
                </tr>
              )}
              {!loading &&
                collections.map((item, index) => (
                  <tr key={item.id ?? index} className="hover:bg-slate-50/70 transition">
                    <td className="py-2 px-2 font-semibold text-primary">{item.sampleCode}</td>
                    <td className="py-2 px-2 font-semibold text-primary">
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
                    <td className="py-2 px-3 font-semibold text-primary max-w-40 truncate">
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
                    <td className="py-2 px-2 font-bold text-emerald-600">
                      {Number(item.netWeight || item.netLtr || 0).toFixed(1)}
                    </td>
                    <td className="py-2 px-2 font-semibold text-primary">{item.tipingTime}</td>
                    <td className="py-2 px-2 font-bold text-slate-800">
                      {Number(item.fat || 0) > 0 ? `${Number(item.fat).toFixed(1)}%` : '0.0%'}
                    </td>
                    <td className="py-2 px-2 font-bold text-slate-800">
                      {Number(item.snf || 0) > 0 ? `${Number(item.snf).toFixed(1)}%` : '0.0%'}
                    </td>
                    <td className="py-2 px-2 font-bold text-slate-800">
                      {/* {Number(item.clr || 0) > 0 ? `${Number(item.snf).toFixed(1)}%` : '0.0%'} */}
                      {item.clr}
                    </td>
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
            fetchPaginatedCollections(
              newPage,
              pageSize,
              searchQuery,
              appliedFromDate,
              appliedToDate
            )
          }
        />
      </div>
    </div>
  )
}

export default Analyzed
