import React, { useEffect, useState } from 'react'
import { RefreshCw, UploadCloud } from 'lucide-react'
import { toast } from 'react-toastify'
import PageBreadcrumb from '@renderer/components/breadcrumbs/PageBreadcrumb'
import Button1 from '@renderer/components/buttons/Button1'
import TableToolbar from '@renderer/components/table/TableToolbar'
import TablePagination from '@renderer/components/table/TablePagination'
import { useAuth } from '@renderer/context/AuthContext'
import { useNetwork } from '@renderer/hooks/useNetwork'
import type { MilkCollectionDto } from '@shared/dtos/milk-collection/milk-collection.dto'

export const Analyzed: React.FC = () => {
  const { user } = useAuth()
  const { verifyConnection } = useNetwork()

  const [showConfirm, setShowConfirm] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isVerifyingNet, setIsVerifyingNet] = useState(false)

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
    searchVal = searchQuery
  ) => {
    try {
      setLoading(true)
      const actualLimit = limitVal === 'all' ? 1000000000 : limitVal
      const response = await window.api.getPaginatedMilkCollctions({
        page: pageNo,
        limit: actualLimit,
        search: searchVal.trim()
      })

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

  // Pre-check network before opening confirmation modal
  const handleOpenSyncConfirm = async () => {
    try {
      setIsVerifyingNet(true)
      const hasNet = await verifyConnection()
      if (!hasNet) {
        toast.error('Cannot sync to server: No internet connection! Please check your network.')
        return
      }
      setShowConfirm(true)
    } finally {
      setIsVerifyingNet(false)
    }
  }

  const handleStartSync = async () => {
    const hasNet = await verifyConnection()
    if (!hasNet) {
      toast.error('Cannot sync to server: No internet connection! Please check your network.')
      setShowConfirm(false)
      return
    }

    try {
      setIsSyncing(true)
      setShowConfirm(false)

      toast.info('Sync to server initiated (functionality will be integrated).')
      await fetchPaginatedCollections(1, pageSize, searchQuery)
    } catch (error: any) {
      console.error('Failed to sync to server:', error)
      toast.error(error?.message || 'An error occurred while syncing to server.')
    } finally {
      setIsSyncing(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPaginatedCollections(1, pageSize, searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, pageSize])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageBreadcrumb
          title="Analyzed Collections"
          desc="View collection records and sync local storage to server"
        />

        {/* Sync to server Button */}
        <Button1
          disabled={isSyncing || isVerifyingNet}
          onClick={handleOpenSyncConfirm}
          variant="primary"
          icon={
            <UploadCloud
              className={`w-3.5 h-3.5 text-white ${isSyncing || isVerifyingNet ? 'animate-bounce' : ''}`}
            />
          }
          label={
            isSyncing
              ? 'Syncing to Server...'
              : isVerifyingNet
                ? 'Checking Network...'
                : 'Sync to server'
          }
        />

        {/* Confirmation Modal */}
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fade-in rounded-2xl">
            <div className="w-full max-w-md bg-white shadow-2xl border rounded-md border-slate-100 p-6 text-center transform transition-all scale-100">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner">
                <RefreshCw className="w-8 h-8 animate-spin-slow" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                Sync to Server
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                This will upload all locally collected milk records to the central cloud server. Are you sure you want to proceed?
              </p>

              {/* Current Context Badges */}
              <div className="mb-6 py-2 px-3 bg-slate-50 rounded-xl text-xs text-slate-600 flex justify-center gap-4">
                <span>
                  Plant:{' '}
                  <strong className="text-slate-800">
                    {user?.plantName || user?.plant || '1102'}
                  </strong>
                </span>
                <span>
                  User:{' '}
                  <strong className="text-slate-800 ">
                    {user?.userName || '-'}
                  </strong>
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={() => setShowConfirm(false)}
                  className="w-1/2 py-2.5 px-4 rounded-xl border border-slate-200  text-slate-700  font-semibold text-xs hover:bg-slate-100  transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={handleStartSync}
                  className="w-1/2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSyncing ? 'Syncing...' : 'Yes, Sync to Server'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Table Card (ProcurementCollection Style) */}
      <div className="mt-2 p-3 sm:p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
        <TableToolbar
          pageSize={pageSize}
          onPageSizeChange={(val) => setPageSize(val === 'all' ? 'all' : Number(val))}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search sample code, route or vendor..."
        />

        {/* Table Following ProcurementCollection.tsx Header & Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-500/10 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-2 whitespace-nowrap">Sample Code</th>
                <th className="py-3 px-2 whitespace-nowrap">Shift</th>
                <th className="py-3 px-2 whitespace-nowrap">Chilling Plant</th>
                <th className="py-3 px-2 whitespace-nowrap">Date</th>
                <th className="py-3 px-2 whitespace-nowrap">Weight System</th>
                <th className="py-3 px-2 whitespace-nowrap">Routes</th>
                <th className="py-3 px-2 whitespace-nowrap">Cans Type</th>
                <th className="py-3 px-2 whitespace-nowrap">Milk Type</th>
                <th className="py-3 px-2 whitespace-nowrap">Milk Status</th>
                <th className="py-3 px-2 whitespace-nowrap">Tipping Time</th>
                <th className="py-3 px-2 whitespace-nowrap">Vendor Name</th>
                <th className="py-3 px-2 whitespace-nowrap">No. of Cans</th>
                <th className="py-3 px-2 whitespace-nowrap">Net Weight</th>
                <th className="py-3 px-2 whitespace-nowrap">FAT (%)</th>
                <th className="py-3 px-2 whitespace-nowrap">SNF (%)</th>
                <th className="py-3 px-2 whitespace-nowrap text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading && (
                <tr>
                  <td colSpan={16} className="py-8 text-center text-slate-400 font-medium">
                    Loading collections...
                  </td>
                </tr>
              )}
              {!loading && collections.length === 0 && (
                <tr>
                  <td colSpan={16} className="py-8 text-center text-slate-400 font-medium">
                    No milk collections found
                  </td>
                </tr>
              )}
              {!loading &&
                collections.map((item, index) => (
                  <tr key={item.id ?? index} className="hover:bg-slate-50/70 transition">
                    <td className="py-2 px-4 font-semibold text-primary">{item.sampleCode}</td>
                    <td className="py-2 px-4">
                      <span
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
                      </span>
                    </td>
                    <td className="py-2 px-4 font-semibold text-slate-800">
                      {item.plant}
                    </td>
                    <td className="py-2 px-4 font-semibold text-primary">
                      {item.sampleDate
                        ? (() => {
                            const d = new Date(item.sampleDate)
                            return isNaN(d.getTime())
                              ? String(item.sampleDate)
                              : d.toLocaleDateString()
                          })()
                        : ''}
                    </td>
                    <td className="py-2 px-4 font-bold text-slate-900">
                      {item.weightSystem}
                    </td>
                    <td className="py-2 px-4 font-semibold text-primary max-w-40 truncate">
                      {item.rootCode}
                    </td>
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
                    <td className="py-2 px-4 font-semibold text-primary">{item.tipingTime}</td>
                    <td className="py-2 px-4 font-semibold text-primary">{item.vendorCode}</td>
                    <td className="py-2 px-4 font-semibold text-primary">{item.noOfCans}</td>
                    <td className="py-2 px-4 font-bold text-emerald-600">
                      {Number(item.netWeight || item.netLtr || 0).toFixed(1)}
                    </td>
                    <td className="py-2 px-4 font-bold text-slate-800">
                      {Number(item.fat || 0) > 0 ? `${Number(item.fat).toFixed(1)}%` : '0.0%'}
                    </td>
                    <td className="py-2 px-4 font-bold text-slate-800">
                      {Number(item.snf || 0) > 0 ? `${Number(item.snf).toFixed(1)}%` : '0.0%'}
                    </td>
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
          onPageChange={(newPage) => fetchPaginatedCollections(newPage, pageSize, searchQuery)}
        />
      </div>
    </div>
  )
}

export default Analyzed