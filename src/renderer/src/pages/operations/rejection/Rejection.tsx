import React, { useState, useEffect, useRef } from 'react'
import { Bookmark, X } from 'lucide-react'
import api from '@renderer/services'
import Button1 from '@renderer/components/buttons/Button1'
import PageBreadcrumb from '@renderer/components/breadcrumbs/PageBreadcrumb'
import CustomForm from '@renderer/components/customform/CustomForm'
// import type { Route } from '@renderer/types/routes/routes.types'
// import type { Vendor } from '@renderer/types/vendors/vendors.types'
import { toast } from 'react-toastify'
import {
  MilkRejectionSaveDto,
  MilkRejectionResponseDto
} from '@shared/dtos/milk-collection/milk-rejection.dto'
import { useAuth } from '@renderer/context/AuthContext'
import TableToolbar from '@renderer/components/table/TableToolbar'
import TablePagination from '@renderer/components/table/TablePagination'
import { RouteResponseDto } from '@shared/dtos/route/route-response.dto'
import { VendoreResponseDto } from '@shared/dtos/vendor/vendor.dto'
import { ReasonDto } from '@shared/dtos/milk-collection/milk-rejection.dto'
import useShift from '@renderer/hooks/useShift'

interface SelectOption {
  value: string
  label: string
}
export const Rejection: React.FC = () => {
  const { user } = useAuth()
  const { shiftOptions, currentShiftId, getShiftLabel } = useShift(user?.plant)
  const shouldFocusDskRef = useRef(false)

  const shifts = shiftOptions
  //save
  const [loadingSave, setLoadingSave] = useState<boolean>(false)
  // Routes state
  const [routes, setRoutes] = useState<RouteResponseDto[]>([])
  const [routeOptions, setRouteOptions] = useState<SelectOption[]>([])
  const [selectedRoute, setSelectedRoute] = useState<string>('')
  const [loadingRoutes, setLoadingRoutes] = useState<boolean>(false)

  // Vendors state
  const [vendors, setVendors] = useState<VendoreResponseDto[]>([])
  const [vendorOptions, setVendorOptions] = useState<SelectOption[]>([])
  const [selectedVendor, setSelectedVendor] = useState<string>('')
  const [loadingVendors, setLoadingVendors] = useState<boolean>(false)

  const [reason, setReason] = useState<ReasonDto[]>([])
  const [reasonOptions, setReasonOptions] = useState<SelectOption[]>([])
  const [selectedReason, setSelectedReason] = useState<string>('')
  const [loadingReasons, setLoadingReasons] = useState<boolean>(false)

  const [shift, setShift] = useState<string>(currentShiftId)
  const [plant, setPlant] = useState(user?.plant)
  const [noOfCans, setNoOfCans] = useState('')
  const [approxQuantity, setApproxQuantity] = useState('')
  const [supervisor, setSupervisor] = useState('')

  useEffect(() => {
    if (currentShiftId) {
      setShift(currentShiftId)
    }
  }, [currentShiftId])

  // Options configuration
  // const shifts = [
  //   { value: '1', label: 'Morning' },
  //   { value: '2', label: 'Evening' }
  // ]
  // const plantOptions = [
  //   { value: '1102', label: 'Raipur' },
  //   { value: '1103', label: 'Jagatpur' }
  // ]

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

  const fetchReasons = async (): Promise<void> => {
    try {
      setLoadingReasons(true)
      const response = await api.rejection.getReasons()
      setReason(response)

      const options: SelectOption[] = response.map((reason) => ({
        value: String(reason.reason),
        label: reason.reason
      }))
      setReasonOptions(options)
    } catch (error) {
      console.error('Failed to fetch reasons:', error)
    } finally {
      setLoadingReasons(false)
    }
  }

  useEffect(() => {
    // If no route is selected, clear vendor list and selection
    if (!selectedRoute) {
      setVendors([])
      setVendorOptions([])
      setSelectedVendor('')
      setSupervisor('')
      return
    }

    // Find the routeCode (e.g. "1102001") corresponding to the selected route
    const currentRoute = routes.find(
      (r) => String(r.id) === selectedRoute || r.routeCode === selectedRoute
    )
    const routeCode = currentRoute?.routeCode || selectedRoute

    const fetchVendorsBySelectedRoute = async () => {
      try {
        setLoadingVendors(true)
        setSelectedVendor('')
        setSupervisor('')

        let response: any = null

        if (typeof window !== 'undefined' && (window as any).api?.getVendorsByRoute) {
          response = await (window as any).api.getVendorsByRoute(routeCode)
        }

        const vendorList: VendoreResponseDto[] = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : []
        // console.log('vendorList', vendorList)
        // setSupervisor(response.supervisorEmpId)
        // console.log('supervisorEmpId', response.supervisorEmpId)
        setVendors(vendorList)

        // Map to dropdown options: show Vendor Code + DSK Name if available
        const options: SelectOption[] = vendorList.map((vendor: any) => ({
          value: String(vendor.dskCode ?? ''),
          label: `${vendor.dskCode} - ${vendor.dskName}`
        }))

        setVendorOptions(options)
      } catch (error) {
        console.error('Failed to fetch vendors by route:', error)
        toast.error('Failed to load vendors for the selected route.')
        setVendors([])
        setVendorOptions([])
      } finally {
        setLoadingVendors(false)
        if (shouldFocusDskRef.current) {
          shouldFocusDskRef.current = false
          setTimeout(() => {
            const dskInput = document.getElementById('dsk-select-input') as HTMLInputElement | null
            dskInput?.focus()
          }, 80)
        }
      }
    }

    fetchVendorsBySelectedRoute()
  }, [selectedRoute, routes])

  // Set selected DSK and auto-populate supervisorEmpId & focus No. of Cans
  const handleVendorChange = (dskCode: string | number) => {
    const value = String(dskCode ?? '')
    setSelectedVendor(value)
    const chosenVendor = vendors.find((v) => String(v.dskCode) === value)
    setSupervisor(chosenVendor?.supervisorEmpId || '')
    if (value) {
      setTimeout(() => {
        const cansInput = document.getElementById('no-of-cans-input') as HTMLInputElement | null
        cansInput?.focus()
      }, 60)
    }
  }

  useEffect(() => {
    ;(fetchRoutes(), fetchReasons())
  }, [])

  const getCurrentLocalDate = (): string => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${day}-${month}-${year}`
  }

  const formatApproxQuantity = (raw: string): string => {
    const trimmed = raw.trim()
    if (!trimmed) return ''
    const num = Number(trimmed)
    if (!Number.isFinite(num) || num < 0) return ''
    const [intPart, decPart = ''] = num.toString().split('.')
    return `${intPart}.${(decPart + '0').slice(0, 1)}`
  }

  // Handle route change and flag that DSK should be focused
  const handleRouteChange = (e: any) => {
    const val = e?.target?.value ?? ''
    setSelectedRoute(val)
    if (val) {
      shouldFocusDskRef.current = true
      setTimeout(() => {
        const dskInput = document.getElementById('dsk-select-input') as HTMLInputElement | null
        dskInput?.focus()
      }, 100)
    }
  }

  const handleApproxQuantityChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const raw = e.target.value
    if (raw === '') {
      setApproxQuantity('')
      return
    }
    // Disallow negative numbers (e.g. -89.9)
    if (raw.includes('-') || Number(raw) < 0) {
      e.target.value = approxQuantity
      return
    }
    // Keep digits and at most 1 decimal digit (e.g. 2.33 -> 2.3, 2.3345 -> 2.3)
    const match = raw.match(/^\d*(?:\.\d?)?/)
    const cleaned = match ? match[0] : ''
    if (e.target.value !== cleaned) {
      e.target.value = cleaned
    }
    setApproxQuantity(cleaned)
  }

  // Paginated rejections table state
  const [rejections, setRejections] = useState<MilkRejectionResponseDto[]>([])
  const [loadingRejections, setLoadingRejections] = useState<boolean>(false)
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

  // Get current date in YYYY-MM-DD format for database queries
  const getCurrentDateISO = (): string => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Fetch paginated milk rejections automatically filtered by current date and current shift
  const fetchPaginatedRejections = async (
    pageNo = pagination.page,
    limitVal = pageSize,
    searchVal = searchQuery,
    selectedShift = shift
  ): Promise<void> => {
    try {
      setLoadingRejections(true)
      const actualLimit = limitVal === 'all' ? 10000000000000 : limitVal
      const todayDate = getCurrentDateISO()
      const shiftParam =
        selectedShift && String(selectedShift).trim() !== '' && String(selectedShift) !== '0'
          ? String(selectedShift).trim()
          : undefined
      const response = await window.api.getPaginatedMilkRejections(
        {
          page: pageNo,
          limit: actualLimit,
          search: searchVal.trim()
        },
        shiftParam,
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
          setPagination(response.pagination)
        }
      }
    } catch (error) {
      console.error('Failed to fetch milk rejections:', error)
      toast.error('Failed to fetch milk rejections.')
    } finally {
      setLoadingRejections(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPaginatedRejections(1, pageSize, searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, pageSize])

  const handleSaveRejection = async (): Promise<void> => {
    // Validation
    if (!plant) {
      toast.warn('Plant cannot be empty.')
      return
    }
    if (!selectedRoute) {
      toast.warn('Please select a route name.')
      return
    }
    if (!selectedVendor) {
      toast.warn('Please select a DSK / Vendor.')
      return
    }
    if (!shift) {
      toast.warn('Shift cannot be empty.')
      return
    }
    if (!noOfCans || Number(noOfCans) <= 0) {
      toast.warn('No. of cans must be greater than 0.')
      return
    }
    const formattedQty = formatApproxQuantity(approxQuantity)
    if (!formattedQty || Number(formattedQty) <= 0) {
      toast.warn('Approx quantity must be greater than 0.')
      return
    }
    if (!selectedReason) {
      toast.warn('Please select a rejection reason.')
      return
    }

    try {
      setLoadingSave(true)

      // Look up full Vendor & Route objects for dskName and routeCode
      const chosenVendor = vendors.find(
        (v) => v.dskCode === selectedVendor || String(v.id) === selectedVendor
      )
      const chosenRoute = routes.find(
        (r) => String(r.id) === selectedRoute || r.routeCode === selectedRoute
      )

      // Note exact DTO field names: noOfCanes & aproxQuantity
      const payload: MilkRejectionSaveDto = {
        plant: String(user?.plant || plant),
        dskName: String(chosenVendor?.dskName || ''),
        dskCode: String(chosenVendor?.dskCode || selectedVendor),
        route: String(chosenRoute?.routeCode || selectedRoute),
        supervisor: String(supervisor || chosenVendor?.supervisorEmpId || ''),
        shift: String(shift),
        noOfCanes: String(noOfCans),
        aproxQuantity: String(approxQuantity),
        reason: String(selectedReason)
      }

      // console.log("payload rejection", payload)

      await api.rejection.saveMilkRejection(payload)

      toast.success('Milk rejection saved successfully!')
      fetchPaginatedRejections()
      // Reset entry fields after save
      setSelectedVendor('')
      setSupervisor('')
      setNoOfCans('')
      setApproxQuantity('')
      setSelectedReason('')
    } catch (error: any) {
      console.error('Failed to save milk rejection:', error)
      toast.error(error?.message || 'Failed to save milk rejection.')
    } finally {
      fetchPaginatedRejections()
      setLoadingSave(false)
    }
  }

  const handleCancel = () => {
    setSelectedRoute('')
    setSelectedVendor('')
    setSupervisor('')
    setNoOfCans('')
    setApproxQuantity('')
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageBreadcrumb
          title="Rejection"
          //  desc="Connect you machine before collection"
        />
      </div>

      <div className="mt-2 p-3 sm:p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
        <CustomForm onSubmit={(e) => e.preventDefault()} className="w-full">
          <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-2.5">
            {/* Date (Read-only, skipped from Tab order) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Date</label>
              <CustomForm.CustomTextField
                name="date"
                value={getCurrentLocalDate()}
                readOnly={true}
                tabIndex={-1}
              />
            </div>

            {/* Shift (tabIndex: 1) */}
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

            {/* Chilling Center (Read-only, skipped from Tab order) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Chilling Center</label>
              <CustomForm.CustomTextField
                name="chilling"
                value={`${user?.plant || ''}, ${user?.plantName || ''}`}
                readOnly={true}
                tabIndex={-1}
              />
            </div>

            {/* Routes Dropdown (tabIndex: 2) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Routes <span className="text-rose-500">*</span>{' '}
                {loadingRoutes && <span className="text-slate-400 font-normal">(Loading...)</span>}
              </label>
              <CustomForm.CustomSelectSearchField
                name="route"
                inputId="route-select-input"
                placeholder={loadingRoutes ? 'Loading routes...' : 'Select & search route...'}
                value={selectedRoute}
                onChange={handleRouteChange}
                options={routeOptions}
                disabled={loadingRoutes}
                tabIndex={2}
              />
            </div>

            {/* DSK Name (tabIndex: 3) - Automatically focused after selecting route */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                DSK Name <span className="text-rose-500">*</span>{' '}
                {loadingVendors && <span className="text-slate-400 font-normal">(Loading...)</span>}
              </label>
              <CustomForm.CustomSelectSearchField
                name="vendor"
                inputId="dsk-select-input"
                placeholder={
                  !selectedRoute
                    ? 'Please select a route first...'
                    : loadingVendors
                      ? 'Loading dsks...'
                      : vendorOptions.length === 0
                        ? 'No dsk found for this route'
                        : 'Select & search dsk...'
                }
                value={selectedVendor}
                onChange={(e: any) => handleVendorChange(e.target.value)}
                options={vendorOptions}
                disabled={loadingVendors || !selectedRoute}
                tabIndex={3}
              />
            </div>

            {/* Supervisor Id (Read-only, skipped from Tab order) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Supervisor Id</label>
              <CustomForm.CustomTextField
                name="supervisor"
                value={supervisor}
                readOnly={true}
                tabIndex={-1}
              />
            </div>

            {/* No. of Cans (tabIndex: 4) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                No. of Cans <span className="text-rose-500">*</span>
              </label>
              <CustomForm.CustomNumberField
                name="noOfCans"
                id="no-of-cans-input"
                value={noOfCans}
                onChange={(e: any) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 2)
                  setNoOfCans(val)
                }}
                onInput={(e: any) => {
                  if (e.target.value.length > 2) {
                    e.target.value = e.target.value.slice(0, 2)
                  }
                }}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    document.getElementById('approx-quantity-input')?.focus()
                  }
                }}
                max={99}
                min={1}
                maxLength={2}
                placeholder="e.g. 1"
                tabIndex={4}
              />
            </div>

            {/* Approx Quantity (tabIndex: 5) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Aprox Quantity(LTR) <span className="text-rose-500">*</span>
              </label>
              <CustomForm.CustomNumberField
                name="approxQuantity"
                id="approx-quantity-input"
                min="0"
                step="0.1"
                value={approxQuantity}
                onChange={handleApproxQuantityChange}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (['-', '+', 'e', 'E'].includes(e.key)) {
                    e.preventDefault()
                  }
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    document.getElementById('reason-select-input')?.focus()
                  }
                }}
                onBlur={() => {
                  if (!approxQuantity) return
                  const formatted = formatApproxQuantity(approxQuantity)
                  setApproxQuantity(formatted)
                }}
                placeholder="e.g. 4.5"
                tabIndex={5}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 grid-cols-1 gap-2.5">
            {/* Select Reason (tabIndex: 6) - Pressing Enter saves entry if reason is selected */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Select Reason <span className="text-rose-500">*</span>{' '}
                {loadingReasons && <span className="text-slate-400 font-normal">(Loading...)</span>}
              </label>
              <CustomForm.CustomSelectSearchField
                name="reason"
                inputId="reason-select-input"
                placeholder={loadingReasons ? 'Loading reasons...' : 'Select & search reason...'}
                value={selectedReason}
                onChange={(e: any) => setSelectedReason(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.key === 'Enter') {
                    if (selectedReason) {
                      e.preventDefault()
                      handleSaveRejection()
                    }
                  }
                }}
                options={reasonOptions}
                disabled={loadingReasons}
                tabIndex={6}
              />
            </div>
          </div>

          {/* Action Buttons (tabIndex: 7 & 8) */}
          <div className="flex justify-end items-center gap-2.5 mt-3 pt-2 border-t border-slate-100">
            <Button1
              variant="outline"
              icon={<X className="w-3.5 h-3.5 text-primary" />}
              label="Clear"
              onClick={handleCancel}
              tabIndex={8}
            />
            <Button1
              variant="primary"
              icon={<Bookmark className="w-3.5 h-3.5 text-white" />}
              label={loadingSave ? 'Saving...' : 'Save'}
              onClick={handleSaveRejection}
              disabled={loadingSave}
              tabIndex={7}
            />
          </div>
        </CustomForm>
      </div>

      {/* Bottom Card: Display List (Automatically filtered by Current Date and Current Shift) */}
      <div className="mt-2 p-3 sm:p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
        {/* Toolbar for page size & text search */}
        <TableToolbar
          pageSize={pageSize}
          onPageSizeChange={(val) => setPageSize(val === 'all' ? 'all' : Number(val))}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search DSK name, route, or supervisor..."
        />

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-500/10 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-2 px-2">ID</th>
                <th className="py-2 px-2">Plant Id</th>
                <th className="py-2 px-2">Date</th>
                <th className="py-2 px-2">Shift</th>
                <th className="py-2 px-2">Route Name</th>
                <th className="py-2 px-2">DSK Code</th>
                <th className="py-2 px-2">DSK Name</th>
                <th className="py-2 px-2">Supervisor</th>
                <th className="py-2 px-2">No. of Cans</th>
                <th className="py-2 px-2">Approx Qty (LTR)</th>
                <th className="py-2 px-2">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loadingRejections ? (
                <tr>
                  <td colSpan={11} className="py-4 px-4 text-center text-slate-500">
                    Loading Rejections...
                  </td>
                </tr>
              ) : rejections.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-4 px-4 text-center text-slate-500">
                    No Rejections Found
                  </td>
                </tr>
              ) : (
                rejections.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-2 px-2 font-semibold text-primary">{item.id}</td>
                    <td className="py-2 px-2 text-slate-700">{item.plant}</td>
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
                    <td className="py-2 px-2 text-slate-700">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                          String(item.shiftName) === 'morning'
                            ? 'bg-orange-50 text-orange-500 border-orange-200'
                            : String(item.shiftName) === 'evening'
                              ? 'bg-sky-50 text-sky-500 border-sky-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {String(item.shiftName) === 'morning'
                          ? 'Morning'
                          : String(item.shiftName) === 'evening'
                            ? 'Evening'
                            : item.shiftName || `Shift ${item.shiftName}`}
                      </span>
                    </td>
                    <td className="py-2 px-2 font-semibold text-primary">{item.routeName}</td>
                    <td className="py-2 px-2 text-slate-700">{item.dskCode}</td>
                    <td className="py-2 px-2 font-semibold text-slate-800">{item.dskName}</td>
                    <td className="py-2 px-2 text-slate-700">{item.supervisor}</td>
                    <td className="py-2 px-2 text-slate-700">{item.noOfCanes}</td>
                    <td className="py-2 px-2 font-bold text-emerald-600">{item.aproxQuantity}</td>
                    <td className="py-2 px-2 text-slate-700">{item.reason}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <TablePagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          pageSize={pageSize}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          loading={loadingRejections}
          itemName="rejections"
          onPageChange={(newPage) => fetchPaginatedRejections(newPage, pageSize, searchQuery)}
        />
      </div>
    </div>
  )
}

export default Rejection
