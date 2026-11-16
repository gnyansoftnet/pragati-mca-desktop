import React, { useState, useEffect } from 'react'
import { Bookmark, X } from 'lucide-react'
import api from '@renderer/services'
import Button1 from '@renderer/components/buttons/Button1'
import PageBreadcrumb from '@renderer/components/breadcrumbs/PageBreadcrumb'
import CustomForm from '@renderer/components/customform/CustomForm'
import { toast } from 'react-toastify'
import { useAuth } from '@renderer/context/AuthContext'
import TableToolbar from '@renderer/components/table/TableToolbar'
import TablePagination from '@renderer/components/table/TablePagination'
import { RouteResponseDto } from '@shared/dtos/route/route-response.dto'
import type { TransportDto, TransportSaveDto } from '@shared/dtos/transport/transport.dto'

interface SelectOption {
  value: string
  label: string
}

export const Transport: React.FC = () => {
  const { user } = useAuth()

  // Form states
  const [loadingSave, setLoadingSave] = useState<boolean>(false)
  const [routes, setRoutes] = useState<RouteResponseDto[]>([])
  const [routeOptions, setRouteOptions] = useState<SelectOption[]>([])
  const [selectedRoute, setSelectedRoute] = useState<string>('')
  const [loadingRoutes, setLoadingRoutes] = useState<boolean>(false)

  const [shift, setShift] = useState('1')
  const [plant, setPlant] = useState(user?.plant)
  const [transporter, setTransporter] = useState('')
  const [rcno, setRcno] = useState('')
  const [driver, setDriver] = useState('')
  const [isRealVehicle, setIsRealVehicle] = useState('yes')

  // Options configuration
  const shifts = [
    { value: '1', label: 'Morning' },
    { value: '2', label: 'Evening' }
  ]
  const isRealVehicleOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ]

  // Date helpers
  const getCurrentLocalDate = (): string => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${day}-${month}-${year}`
  }

  const getCurrentDateISO = (): string => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Date filters default to current date
  const [fromDate, setFromDate] = useState<string>(getCurrentDateISO())
  const [toDate, setToDate] = useState<string>(getCurrentDateISO())

  // Paginated transports table state
  const [transports, setTransports] = useState<TransportDto[]>([])
  const [loadingTransports, setLoadingTransports] = useState<boolean>(false)
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

  // Fetch routes
  const fetchRoutes = async (): Promise<void> => {
    try {
      setLoadingRoutes(true)
      const response = await api.routes.getAll()
      setRoutes(response)
      const options: SelectOption[] = response.map((route) => ({
        value: String(route.id),
        label: route.routeName
      }))
      setRouteOptions(options)
    } catch (error) {
      console.error('Failed to fetch routes:', error)
    } finally {
      setLoadingRoutes(false)
    }
  }

  useEffect(() => {
    fetchRoutes()
  }, [])

  // Fetch paginated transports
  const fetchPaginatedTransports = async (
    pageNo = pagination.page,
    limitVal = pageSize,
    searchVal = searchQuery,
    fDate = fromDate,
    tDate = toDate
  ): Promise<void> => {
    try {
      setLoadingTransports(true)
      const actualLimit = limitVal === 'all' ? 10000000000000 : limitVal
      const response = await window.api.getPaginatedTransports(
        {
          page: pageNo,
          limit: actualLimit,
          search: searchVal.trim()
        },
        fDate,
        tDate
      )

      if (response) {
        const dataList = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : []
        setTransports(dataList)

        if (response.pagination) {
          setPagination(response.pagination)
        }
      }
    } catch (error) {
      console.error('Failed to fetch transports:', error)
      toast.error('Failed to fetch transport records.')
    } finally {
      setLoadingTransports(false)
    }
  }

  // Initial load and debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPaginatedTransports(1, pageSize, searchQuery, fromDate, toDate)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, pageSize, fromDate, toDate])

  // Clear form fields
  const handleClearForm = () => {
    setSelectedRoute('')
    setTransporter('')
    setRcno('')
    setDriver('')
    setIsRealVehicle('yes')
    setShift('1')
  }

  // Save transport
  const handleSaveTransport = async (): Promise<void> => {
    if (!plant && !user?.plant) {
      toast.warn('Plant cannot be empty.')
      return
    }
    if (!selectedRoute) {
      toast.warn('Please select a route name.')
      return
    }
    if (!shift) {
      toast.warn('Shift cannot be empty.')
      return
    }
    if (!transporter.trim()) {
      toast.warn('Transporter cannot be empty.')
      return
    }
    if (!rcno.trim()) {
      toast.warn('Vehicle RC No. cannot be empty.')
      return
    }
    if (!driver.trim()) {
      toast.warn('Driver name cannot be empty.')
      return
    }

    try {
      setLoadingSave(true)

      const chosenRoute = routes.find(
        (r) => String(r.id) === selectedRoute || r.routeCode === selectedRoute
      )

      const payload: TransportSaveDto = {
        plant: String(user?.plant || plant || ''),
        transportDate: getCurrentDateISO(),
        shift: String(shift),
        routeCode: String(chosenRoute?.routeCode || selectedRoute),
        trasporter: String(transporter.trim()),
        vehicleRcNo: String(rcno.trim()),
        driverName: String(driver.trim())
      }

      await window.api.saveTransport(payload)

      toast.success('Transport record saved successfully!')
      fetchPaginatedTransports(1, pageSize, searchQuery, fromDate, toDate)
      handleClearForm()
    } catch (error: any) {
      console.error('Failed to save transport:', error)
      toast.error(error?.message || 'Failed to save transport.')
    } finally {
      setLoadingSave(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageBreadcrumb title="Transport" />
      </div>

      {/* Top Form Card */}
      <div className="mt-2 p-3 sm:p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
        <CustomForm className="w-full">
          <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-2.5">
            {/* Date (Read-only) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Date</label>
              <CustomForm.CustomTextField
                name="date"
                value={getCurrentLocalDate()}
                readOnly={true}
              />
            </div>

            {/* Shift */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Select Shift</label>
              <CustomForm.CustomSelectField
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
                value={`${user?.plant || ''}, ${user?.plantName || ''}`}
                readOnly={true}
                tabIndex={-1}
              />
            </div>

            {/* Dynamic Routes Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Routes <span className="text-rose-500">*</span>{' '}
                {loadingRoutes && <span className="text-slate-400 font-normal">(Loading...)</span>}
              </label>
              <CustomForm.CustomSelectSearchField
                name="route"
                placeholder={loadingRoutes ? 'Loading routes...' : 'Select & search route...'}
                value={selectedRoute}
                onChange={(e: any) => setSelectedRoute(e.target.value)}
                options={routeOptions}
                disabled={loadingRoutes}
              />
            </div>

            {/* Transporter */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Transporter <span className="text-rose-500">*</span>
              </label>
              <CustomForm.CustomTextField
                name="transporter"
                value={transporter}
                onChange={(e: any) => setTransporter(e.target.value)}
                placeholder="Enter transporter"
              />
            </div>

            {/* RC Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Vehicle RC No. <span className="text-rose-500">*</span>
              </label>
              <CustomForm.CustomTextField
                name="rcno"
                value={rcno}
                onChange={(e: any) => setRcno(e.target.value)}
                placeholder="Enter RC number"
              />
            </div>

            {/* Driver Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Driver Name <span className="text-rose-500">*</span>
              </label>
              <CustomForm.CustomTextField
                name="driver"
                value={driver}
                onChange={(e: any) => setDriver(e.target.value)}
                placeholder="Enter driver name"
              />
            </div>

            {/* Is Real Vehicle */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Is Real Vehicle</label>
              <CustomForm.CustomSelectField
                name="isRealVehicleOptions"
                value={isRealVehicle}
                onChange={(e: any) => setIsRealVehicle(e.target.value)}
                options={isRealVehicleOptions}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-end justify-end mt-2 gap-2">
            <Button1
              variant="outline"
              icon={<X className="w-3.5 h-3.5 text-primary" />}
              label="Clear"
              onClick={handleClearForm}
              type="button"
            />
            <Button1
              variant="primary"
              icon={<Bookmark className="w-3.5 h-3.5 text-white" />}
              label={loadingSave ? 'Saving...' : 'Save'}
              onClick={handleSaveTransport}
              disabled={loadingSave}
              type="button"
            />
          </div>
        </CustomForm>
      </div>

      {/* Table Card */}
      <div className="mt-2 p-3 sm:p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
        <TableToolbar
          pageSize={pageSize}
          onPageSizeChange={(val) => setPageSize(val === 'all' ? 'all' : Number(val))}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search transporter, route, vehicle RC or driver..."
        />

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-500/10 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-2 px-2 whitespace-nowrap">ID</th>
                <th className="py-2 px-2 whitespace-nowrap">Transport Code</th>
                <th className="py-2 px-2 whitespace-nowrap">Plant Id</th>
                <th className="py-2 px-2 whitespace-nowrap">Date</th>
                <th className="py-2 px-2 whitespace-nowrap">Shift</th>
                <th className="py-2 px-2 whitespace-nowrap">Route Name</th>
                <th className="py-2 px-2 whitespace-nowrap">Transporter</th>
                <th className="py-2 px-2 whitespace-nowrap">Vehicle RC No.</th>
                <th className="py-2 px-2 whitespace-nowrap">Driver Name</th>
                <th className="py-2 px-2 whitespace-nowrap text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loadingTransports ? (
                <tr>
                  <td colSpan={10} className="py-4 px-4 text-center text-slate-500">
                    Loading transports...
                  </td>
                </tr>
              ) : transports.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-4 px-4 text-center text-slate-500">
                    No Transports Found
                  </td>
                </tr>
              ) : (
                transports.map((item, index) => (
                  <tr key={item.id ?? index} className="hover:bg-slate-50/70 transition">
                    <td className="py-2 px-2 font-semibold text-primary">{item.id}</td>
                    <td className="py-2 px-2 font-semibold text-primary">{item.transportCode}</td>
                    <td className="py-2 px-2 text-slate-700">{item.plant}</td>
                    <td className="py-2 px-2 text-slate-700">
                      {item.transportDate
                        ? (() => {
                            const d = new Date(item.transportDate)
                            return isNaN(d.getTime())
                              ? String(item.transportDate)
                              : d.toLocaleDateString()
                          })()
                        : ''}
                    </td>
                    <td className="py-2 px-2 font-semibold text-slate-800">{item.shift}</td>
                    <td className="py-2 px-2 font-semibold text-primary">
                      {item.routeName || item.routeCode}
                    </td>
                    <td className="py-2 px-2 font-semibold text-slate-800">{item.trasporter}</td>
                    <td className="py-2 px-2 text-slate-700">{item.vehicleRcNo}</td>
                    <td className="py-2 px-2 text-slate-700">{item.driverName}</td>
                    <td className="py-2 px-2 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                          item.syncStatus === 'synced' || item.syncStatus === '1'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {item.syncStatus === 'synced' || item.syncStatus === '1' ? 'Synced' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
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
          loading={loadingTransports}
          itemName="transports"
          onPageChange={(newPage) =>
            fetchPaginatedTransports(newPage, pageSize, searchQuery, fromDate, toDate)
          }
        />
      </div>
    </div>
  )
}

export default Transport