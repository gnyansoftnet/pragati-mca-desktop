import React, { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { toast } from 'react-toastify'
import PageBreadcrumb from '@renderer/components/breadcrumbs/PageBreadcrumb'
import Button1 from '@renderer/components/buttons/Button1'
import TableToolbar from '@renderer/components/table/TableToolbar'
import TablePagination from '@renderer/components/table/TablePagination'
import api from '@renderer/services'
// import type { Supervisor } from '@renderer/types/supervisors/supervisors.types'
import { useAuth } from '@renderer/context/AuthContext'
import { useNetwork } from '@renderer/hooks/useNetwork'
import { SupervisorResponseDto } from '@shared/dtos/supervisor/supervisor.dto'

interface PaginationState {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export const Supervisors: React.FC = () => {
  const { user } = useAuth()
  const { verifyConnection } = useNetwork()

  const [showConfirm, setShowConfirm] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [supervisors, setSupervisors] = useState<SupervisorResponseDto[]>([])
  const [loadingSupervisors, setLoadingSupervisors] = useState<boolean>(false)

  // Filter & Pagination States
  const [pageSize, setPageSize] = useState<number | 'all'>(10)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  })

  // Fetch paginated supervisors
  const fetchPaginatedSupervisors = async (
    pageNo: number = pagination.page,
    limitVal: number | 'all' = pageSize,
    searchVal: string = searchQuery
  ) => {
    try {
      setLoadingSupervisors(true)

      const actualLimit = limitVal === 'all' ? 100000000000000 : limitVal

      let response: any = null
      if ((api as any)?.supervisors?.getPaginated) {
        response = await (api as any).supervisors.getPaginated(
          pageNo,
          actualLimit,
          searchVal.trim()
        )
      } else if (typeof window !== 'undefined' && (window as any).api?.getPaginatedSupervisors) {
        response = await (window as any).api.getPaginatedSupervisors({
          page: pageNo,
          limit: actualLimit,
          search: searchVal.trim()
        })
      }

      if (response) {
        const dataList = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : []
        setSupervisors(dataList)

        if (response.pagination) {
          setPagination(response.pagination)
        } else if ('totalPages' in response) {
          setPagination({
            page: response.page || pageNo,
            limit: actualLimit,
            total: response.total || dataList.length,
            totalPages: response.totalPages || 1,
            hasNextPage: response.hasNextPage ?? pageNo < (response.totalPages || 1),
            hasPrevPage: response.hasPrevPage ?? pageNo > 1
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch supervisors:', error)
    } finally {
      setLoadingSupervisors(false)
    }
  }

  const handleStartSync = async () => {
    // Check internet connection first
    const hasNet = await verifyConnection()
    if (!hasNet) {
      toast.error('Cannot sync Supervisors: No internet connection! Please check your network.')
      setShowConfirm(false)
      return
    }
    // Extract logged-in user credentials (with safe fallbacks)
    const plant = String(user?.plant)
    const org = String(user?.orgCode)
    const branch = String(user?.branchCode)
    // console.log('plant', user?.plant)
    // console.log('org', user?.orgCode)
    // console.log('branch', user?.branchCode)
    try {
      setIsSyncing(true)
      setShowConfirm(false)
      const result = await (window as any).api?.syncSupervisors(plant, org, branch)
      if (result && (result.success === 1 || result.success === true)) {
        toast.success(result.message || 'Supervisors synced successfully from server!')
        // Refresh Supervisors table to display newly synced data
        await fetchPaginatedSupervisors(1, pageSize, searchQuery)
      } else {
        toast.error(result?.message || 'Failed to sync supervisors from server.')
      }
    } catch (error: any) {
      console.error('Failed to sync supervisors:', error)
      toast.error(error?.message || 'An error occurred while syncing supervisors.')
    } finally {
      setIsSyncing(false)
    }
  }

  // Debounced search & entries-per-page change effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPaginatedSupervisors(1, pageSize, searchQuery)
    }, 300)

    return () => clearTimeout(timer)
    console.log('supervisors', supervisors)
  }, [searchQuery, pageSize])

  // Handle Entries Per Page Dropdown Change
  const handleLimitChange = (val: string) => {
    const newLimit = val === 'all' ? 'all' : Number(val)
    setPageSize(newLimit)
  }

  // Handle Next / Previous Page Navigation
  const handlePageChange = (newPage: number) => {
    fetchPaginatedSupervisors(newPage, pageSize, searchQuery)
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageBreadcrumb title="Supervisors" 
        // desc="Manage and view plant supervisors"
         />

        <Button1
          disabled={isSyncing}
          onClick={() => setShowConfirm(true)}
          variant="primary"
          icon={
            <RefreshCw className={`w-3.5 h-3.5 text-white ${isSyncing ? 'animate-spin' : ''}`} />
          }
          label={isSyncing ? 'Syncing...' : 'Sync Supervisor Data'}
        />
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fade-in">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 text-center transform transition-all scale-100">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-100  text-amber-600 flex items-center justify-center shadow-inner">
                <RefreshCw className="w-8 h-8 animate-spin-slow" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Sync Supervisor Data</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                It will take a while, are you sure you want to continue?
              </p>
              {/* Displaying Current User Context */}
              <div className="mb-6 py-2 px-3 bg-slate-50 rounded-xl text-xs text-slate-600  flex justify-center gap-4">
                <span>
                  Plant: <strong className="text-slate-800">{user?.plant}</strong>
                </span>
                <span>
                  User: <strong className="text-slate-800">{user?.userName}</strong>
                </span>
              </div>
              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={() => setShowConfirm(false)}
                  className="w-1/2 py-2.5 px-4 rounded-xl border border-slate-200  text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={handleStartSync}
                  className="w-1/2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSyncing ? 'Syncing...' : 'Yes, Start Sync'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 p-3 sm:p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
        <TableToolbar
          pageSize={pageSize}
          onPageSizeChange={handleLimitChange}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search supervisor by name, ID, or plant..."
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-500/10 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-2">ID</th>
                <th className="py-3 px-2">Employee ID</th>
                <th className="py-3 px-2">Supervisor Name</th>
                <th className="py-3 px-2">Plant</th>
                <th className="py-3 px-2">Contact No</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loadingSupervisors && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                    Loading supervisors...
                  </td>
                </tr>
              )}
              {supervisors.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                    No supervisors found
                  </td>
                </tr>
              )}
              {supervisors.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-2 px-4 font-semibold text-primary">{item.id}</td>
                  <td className="py-2 px-4 font-semibold text-primary">{item.employeeId}</td>
                  <td className="py-2 px-4 font-semibold text-slate-800">
                    {`${item.firstName} ${item.lastName}`}
                  </td>
                  <td className="py-2 px-4 font-semibold text-primary">{item.plant}</td>
                  <td className="py-2 px-4 text-slate-600">{item.contactNo || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Reusable Pagination Footer */}
        <TablePagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          pageSize={pageSize}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          loading={loadingSupervisors}
          itemName="supervisors"
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  )
}

export default Supervisors
