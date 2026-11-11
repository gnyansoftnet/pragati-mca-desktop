import React, { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import api from '@renderer/services'
import Button1 from '@renderer/components/buttons/Button1'
import PageBreadcrumb from '@renderer/components/breadcrumbs/PageBreadcrumb'
import CustomForm from '@renderer/components/customform/CustomForm'
import type { Route } from '@renderer/types/routes/routes.types'
import type { Vendor } from '@renderer/types/vendors/vendors.types'
import { toast } from 'react-toastify'
import { ReasonDto } from '@shared/dtos/milk-rejection/milk-rejection.dto'

interface SelectOption {
  value: string
  label: string
}
export const Rejection: React.FC = () => {
  //save
  const [loadingSave, setLoadingSave] = useState<boolean>(false)
  // Routes state
  const [routes, setRoutes] = useState<Route[]>([])
  const [routeOptions, setRouteOptions] = useState<SelectOption[]>([])
  const [selectedRoute, setSelectedRoute] = useState<string>('')
  const [loadingRoutes, setLoadingRoutes] = useState<boolean>(false)

  // Vendors state
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [vendorOptions, setVendorOptions] = useState<SelectOption[]>([])
  const [selectedVendor, setSelectedVendor] = useState<string>('')
  const [loadingVendors, setLoadingVendors] = useState<boolean>(false)

  const [reason, setReason] = useState<ReasonDto[]>([])
  const [reasonOptions, setReasonOptions] = useState<SelectOption[]>([])
  const [selectedReason, setSelectedReason] = useState<string>('')
  const [loadingReasons, setLoadingReasons] = useState<boolean>(false)

  const [shift, setShift] = useState('1')
  const [plant, setPlant] = useState('1102')
  const [noOfCans, setNoOfCans] = useState('')
  const [approxQuantity, setApproxQuantity] = useState('')

  // Options configuration
  const shifts = [
    { value: '1', label: 'Morning' },
    { value: '2', label: 'Evening' }
  ]
  const plantOptions = [
    { value: '1102', label: 'Raipur' },
    { value: '1103', label: 'Jagatpur' }
  ]

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

        let response: any = null

        if (typeof window !== 'undefined' && (window as any).api?.getVendorsByRoute) {
          response = await (window as any).api.getVendorsByRoute(routeCode)
        }

        const vendorList: Vendor[] = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : []
        console.log('vendorList', vendorList)
        setVendors(vendorList)

        // Map to dropdown options: show Vendor Code + DSK Name if available
        const options: SelectOption[] = vendorList.map((vendor: any) => ({
          value: vendor.dskCode,
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
      }
    }

    fetchVendorsBySelectedRoute()
  }, [selectedRoute, routes])

  useEffect(() => {
    ;(fetchRoutes(), fetchReasons())
  }, [])

  const getCurrentLocalDate = (): string => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const handleSaveRejection = async (): Promise<void> => {
    try {
      setLoadingSave(true)
      if (!plant) {
        toast.warn('Plant Can not be empty')
        return
      }
      if (!selectedRoute) {
        toast.warn('Please seleact a route name')
        return
      }
      if (!selectedVendor) {
        toast.warn('Please select a vendor')
        return
      }
      if (!shift) {
        toast.warn('shift can not be empty')
        return
      }
      if (!noOfCans || Number(noOfCans) <= 0) {
        toast.warn('no no cans can not be empty')
        return
      }
      if (!approxQuantity || Number(approxQuantity) <= 0) {
        toast.warn('Approx Quantity can not be empty')
        return
      }
      if (!selectedReason) {
        toast.warn('Reason can not be empty')
        return
      }
      const payload = {
        // plant,
        // dskName: vendorList.dskName,
        // dskCode: vendorList.dskCode,
        // route: selectedRoute,
        

      }
      if (typeof window !== 'undefined' && (window as any).api?.saveMilkRejection) {
        await (window as any).api.saveMilkRejection(payload)
      }
    } catch (error) {
      console.log('fail to save ')
    } finally {
      setLoadingSave(false)
    }
  }
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageBreadcrumb title="Rejection" desc="Connect you machine before collection" />
      </div>

      <div className="mt-2 p-3 sm:p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
        <CustomForm className="w-full">
          <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-2.5">
            {/* Chilling Center */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Chilling Center</label>
              <CustomForm.CustomSelectField
                name="chilling"
                value={plant}
                onChange={(e: any) => setPlant(e.target.value)}
                options={plantOptions}
                readOnly={true}
              />
            </div>
            {/* Date (Read-only, skipped in Tab order) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Date</label>
              <CustomForm.CustomTextField
                name="date"
                value={getCurrentLocalDate()}
                readOnly={true}
              />
            </div>
            {/* Dynamic Routes Dropdown (tabIndex: 6) */}
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

            {/* DSK Name (tabIndex: 7) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                DSK Name <span className="text-rose-500">*</span>{' '}
                {loadingVendors && <span className="text-slate-400 font-normal">(Loading...)</span>}
              </label>
              <CustomForm.CustomSelectSearchField
                name="vendor"
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
                onChange={(e: any) => setSelectedVendor(e.target.value)}
                options={vendorOptions}
                disabled={loadingVendors || !selectedRoute}
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

            {/* Number of Cans (tabIndex: 8) with Enter handler and Route Total Cans counter */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                No. of Cans <span className="text-rose-500">*</span>
              </label>
              <CustomForm.CustomNumberField
                name="noOfCans"
                value={noOfCans}
                onChange={(e: any) => setNoOfCans(e.target.value)}
                // onKeyDown={handleNoOfCansKeyDown}
                placeholder="e.g. 1"
                // tabIndex={8}
              />
            </div>

            {/* aprox quantity */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Aprox Quantity(LTR) <span className="text-rose-500">*</span>
              </label>
              <CustomForm.CustomNumberField
                name="approxQuantity"
                value={approxQuantity}
                onChange={(e: any) => setApproxQuantity(e.target.value)}
                // onKeyDown={handleNoOfCansKeyDown}
                placeholder="e.g. 4.5"
                // tabIndex={8}
              />
            </div>

            {/* Dynamic Reason Dropdown (tabIndex: 6) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Select Reason <span className="text-rose-500">*</span>{' '}
                {loadingReasons && <span className="text-slate-400 font-normal">(Loading...)</span>}
              </label>
              <CustomForm.CustomSelectSearchField
                name="reason"
                placeholder={loadingReasons ? 'Loading routes...' : 'Select & search reason...'}
                value={selectedReason}
                onChange={(e: any) => setSelectedReason(e.target.value)}
                options={reasonOptions}
                disabled={loadingReasons}
                tabIndex={6}
              />
            </div>

            {/* Find Button (Saves Analysis) */}
            <div className="flex items-end justify-end">
              <Button1
                variant="primary"
                icon={<Search className="w-3.5 h-3.5 text-white" />}
                label={loadingSave ? 'Saving...' : 'Save'}
                onClick={handleSaveRejection}
                disabled={loadingSave}
              />
            </div>
          </div>
        </CustomForm>
      </div>
    </div>
  )
}

export default Rejection
