import React, { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { toast } from 'react-toastify'
import PageBreadcrumb from '@renderer/components/breadcrumbs/PageBreadcrumb'
import Button1 from '@renderer/components/buttons/Button1'
import TableToolbar from '@renderer/components/table/TableToolbar'
import TablePagination from '@renderer/components/table/TablePagination'
import { useAuth } from '@renderer/context/AuthContext'
import { useNetwork } from '@renderer/hooks/useNetwork'
import type { UserResponseDto } from '@shared/dtos/user/user.dto'

export const Users: React.FC = () => {
  const { user } = useAuth()
  const { verifyConnection } = useNetwork()

  const [showConfirm, setShowConfirm] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [users, setUsers] = useState<UserResponseDto[]>([])
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false)

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

  const fetchPaginatedUsers = async (
    pageNo = pagination.page,
    limitVal = pageSize,
    searchVal = searchQuery
  ) => {
    try {
      setLoadingUsers(true)
      const actualLimit = limitVal === 'all' ? 1000000000 : limitVal
      const response = await window.api.getPaginatedUsers({
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
        setUsers(dataList)

        if (response.pagination) {
          setPagination(response.pagination)
        }
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast.error('Failed to fetch users from database.')
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleStartSync = async () => {
    // 1. Check internet connection first
    const hasNet = await verifyConnection()
    if (!hasNet) {
      toast.error('Cannot sync users: No internet connection! Please check your network.')
      setShowConfirm(false)
      return
    }

    // 2. Extract logged-in plant (fallback to "1102") and initial flag "false"
    const plant = String(user?.plant || '1102')
    const initial = 'false'

    try {
      setIsSyncing(true)
      setShowConfirm(false)

      const result = await window.api.syncUser(plant, initial)
      if (result && (result.success === 1)) {
        toast.success(result.message || 'Users synced successfully from server!')
        // Refresh users table to display newly synced data
        await fetchPaginatedUsers(1, pageSize, searchQuery)
      } else {
        toast.error(result?.message || 'Failed to sync users from server.')
      }
    } catch (error: any) {
      console.error('Failed to sync users:', error)
      toast.error(error?.message || 'An error occurred while syncing users.')
    } finally {
      setIsSyncing(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPaginatedUsers(1, pageSize, searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, pageSize])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageBreadcrumb title="Users" desc="Sync users with internet connection" />
        <Button1
          disabled={isSyncing}
          onClick={() => setShowConfirm(true)}
          variant="primary"
          icon={
            <RefreshCw className={`w-3.5 h-3.5 text-white ${isSyncing ? 'animate-spin' : ''}`} />
          }
          label={isSyncing ? 'Syncing...' : 'Sync User Data'}
        />

        {/* Confirmation Modal */}
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fade-in">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-zinc-800 p-6 text-center transform transition-all scale-100">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner">
                <RefreshCw className="w-8 h-8 animate-spin-slow" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100 mb-2">
                Sync User Data
              </h3>
              <p className="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed mb-4">
                It will take a while, are you sure you want to continue?
              </p>

              {/* Displaying Current User Context */}
              <div className="mb-6 py-2 px-3 bg-slate-50 dark:bg-zinc-800 rounded-xl text-xs text-slate-600 dark:text-zinc-400 flex justify-center gap-4">
                <span>
                  Plant:{' '}
                  <strong className="text-slate-800 dark:text-zinc-200">
                    {user?.plant || '1102'}
                  </strong>
                </span>
                <span>
                  User:{' '}
                  <strong className="text-slate-800 dark:text-zinc-200">
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
                  className="w-1/2 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all cursor-pointer disabled:opacity-50"
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
          onPageSizeChange={(val) => setPageSize(val === 'all' ? 'all' : Number(val))}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search user code or name..."
        />

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-500/10 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-3">ID</th>
                <th className="py-3 px-3">User Code</th>
                <th className="py-3 px-3">User Name</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Plant</th>
                <th className="py-3 px-3">Plant Name</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loadingUsers && (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-slate-500">
                    Loading Users....
                  </td>
                </tr>
              )}
              {!loadingUsers && users.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-slate-500">
                    No Users Found
                  </td>
                </tr>
              )}
              {!loadingUsers &&
                users.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-3 font-semibold text-primary">{item.id}</td>
                    <td className="py-2.5 px-3 font-semibold text-primary">{item.userCode}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{item.userName}</td>
                    <td className="py-2.5 px-3 text-slate-600">{item.role || '-'}</td>
                    <td className="py-2.5 px-3 text-slate-600">{item.plant || '-'}</td>
                    <td className="py-2.5 px-3 text-slate-600">{item.plantName || '-'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <TablePagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          pageSize={pageSize}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          loading={loadingUsers}
          itemName="users"
          onPageChange={(newPage) => fetchPaginatedUsers(newPage, pageSize, searchQuery)}
        />
      </div>
    </div>
  )
}

export default Users