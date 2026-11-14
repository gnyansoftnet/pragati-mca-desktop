import React, { useEffect, useState, useRef, useMemo } from 'react'
import { Bookmark, X, ChevronLeft, ChevronRight, Scale, WifiOff } from 'lucide-react'
import Button1 from '@renderer/components/buttons/Button1'
import PageBreadcrumb from '@renderer/components/breadcrumbs/PageBreadcrumb'
import CustomForm from '@renderer/components/customform/CustomForm'
import api from '@renderer/services'
// import type { Route } from '@renderer/types/routes/routes.types'
// import type { Vendor } from '@renderer/types/vendors/vendors.types'
import { toast } from 'react-toastify'
import { useSerialSnapshot } from '@renderer/hooks/useSerial'
import { useAuth } from '@renderer/context/AuthContext'
import { RouteResponseDto } from '@shared/dtos/route/route-response.dto'
import { VendoreResponseDto } from '@shared/dtos/vendor/vendor.dto'

interface SelectOption {
  value: string
  label: string
}

interface MilkEntry {
  id: number
  sampleCode?: string | number
  farmerId?: string
  chillingPlant?: string
  plant?: string
  date?: string
  sampleDate?: string | Date
  routes?: string
  rootCode?: string
  canType?: string
  shift?: number | string
  shiftName?: string
  milkType?: string
  milkStatus?: string
  tipingTime?: string
  vendorCode?: string
  noOfCans?: number | string
  netWeight?: string | number
  grossWeight?: string | number
  fatPercent?: number
  fat?: string | number
  snfPercent?: number
  snf?: string | number
  clrPercent?: number
  clr?: string | number
  weightSystem?: string
}

// interface PaginationState {
//   page: number
//   limit: number
//   total: number
//   totalPages: number
//   hasNextPage: boolean
//   hasPrevPage: boolean
// }

// Set to true while testing; set to false in production with real hardware
const IS_TEST_MODE = true
const DEFAULT_TEST_WEIGHT = '25.5'

export const ProcurementCollection: React.FC = () => {
  const { user } = useAuth()
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

  // Collection metadata fields
  const [shift, setShift] = useState('1')
  const [plant, setPlant] = useState<string>(user?.plant)
  const [weightSystem, setWeightSystem] = useState('WeightBowl')
  const [cansType, setCansType] = useState('Aluminium')
  const [milkType, setMilkType] = useState('cow')
  const [milkStatus, setMilkStatus] = useState('good')
  const [noOfCans, setNoOfCans] = useState('')
  const [weightCans, setWeightCans] = useState('')

  const userCode = 'USR0001'
  const entry = 'MACHINE'

  // Ref for the Save button (for auto-focus when cans are entered)
  const saveButtonRef = useRef<HTMLButtonElement | null>(null)

  // Ref to track if Route was just selected by user
  const shouldFocusVendorRef = useRef(false)

  // 1. When route changes: update state and mark that vendor should be focused once loaded
  const handleRouteChange = (e: any) => {
    const val = e?.target?.value ?? ''
    setSelectedRoute(val)
    if (val) {
      shouldFocusVendorRef.current = true
    }
  }

  // 2. When vendor is selected: auto-focus No. of Cans input
  const handleVendorChange = (e: any) => {
    const val = e?.target?.value ?? ''
    setSelectedVendor(val)
    if (val) {
      setTimeout(() => {
        const cansInput = document.getElementById('no-of-cans-input') as HTMLInputElement | null
        cansInput?.focus()
        cansInput?.select()
      }, 50)
    }
  }

  // Hardware machine serial snapshot (Live Machine Connection)
  const snap = useSerialSnapshot()
  const isScaleConnected = snap.ports.some(
    (p) => p.parserType === 'weight' && p.status === 'connected'
  )
  // const isScaleConnected =
  //   IS_TEST_MODE || snap.ports.some((p) => p.parserType === 'weight' && p.status === 'connected')

  // Pagination and entries state
  // const [pagination, setPagination] = useState<PaginationState>({
  //   page: 1,
  //   limit: 10,
  //   total: 0,
  //   totalPages: 1,
  //   hasNextPage: false,
  //   hasPrevPage: false
  // })
  const [entries, setEntries] = useState<MilkEntry[]>([])

  // Fetch routes from master
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

  // Fetch vendors whenever the selected route changes
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

        const vendorList: VendoreResponseDto[] = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : []

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
        // Focus the Vendor dropdown input as soon as it is enabled & populated
        if (shouldFocusVendorRef.current) {
          shouldFocusVendorRef.current = false
          setTimeout(() => {
            const vendorInput = document.getElementById(
              'vendor-select-input'
            ) as HTMLInputElement | null
            vendorInput?.focus()
          }, 80)
        }
      }
    }

    fetchVendorsBySelectedRoute()
  }, [selectedRoute, routes])

  const fetchCollections = async (page = 1): Promise<void> => {
    try {
      const response = await api.collection.getMilkCollections()
      if (response) {
        if (response) {
          setEntries(response)
        }
      }
    } catch (error) {
      console.error('Failed to fetch milk collections:', error)
    }
  }

  useEffect(() => {
    fetchRoutes()
    // fetchVendors()
    fetchCollections(1)
  }, [])

  // Auto-capture live weight from connected machine scale (Zero manual input)
  // useEffect(() => {
  //   if (isScaleConnected && snap.readings.weight?.value !== undefined) {
  //     const scaleValue = String(snap.readings.weight.value)
  //     if (scaleValue && scaleValue !== '0') {
  //       setWeightCans(scaleValue)
  //     }
  //   }
  // }, [snap.readings.weight, isScaleConnected])
  useEffect(() => {
    if (IS_TEST_MODE) {
      // In test mode, always keep the default test weight loaded
      if (!weightCans) {
        setWeightCans(DEFAULT_TEST_WEIGHT)
      }
      return
    }

    if (isScaleConnected && snap.readings.weight?.value !== undefined) {
      const scaleValue = String(snap.readings.weight.value)
      if (scaleValue && scaleValue !== '0') {
        setWeightCans(scaleValue)
      }
    }
  }, [snap.readings.weight, isScaleConnected, weightCans])
  // Auto-capture live weight from connected machine scale (Zero manual input)
  // useEffect(() => {
  //   if (isScaleConnected && snap.readings.weight?.value !== undefined) {
  //     const scaleValue = String(snap.readings.weight.value)
  //     if (Number(scaleValue) > 0) {
  //       setWeightCans(scaleValue)
  //     }
  //   }
  // }, [snap.readings.weight, isScaleConnected])

  const getCurrentLocalDate = (): string => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${day}-${month}-${year}`
  }

  const getCurrentLocalDateTime = (): string => {
    const now = new Date()
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    return `${hours}:${minutes}:${seconds}`
  }

  const [currentTime, setCurrentTime] = useState(getCurrentLocalDateTime)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentLocalDateTime())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Options configuration
  const shifts = [
    { value: '1', label: 'Morning' },
    { value: '2', label: 'Evening' }
  ]

  // const plantOptions = [
  //   { value: '1102', label: 'Raipur' },
  //   { value: '1103', label: 'Jagatpur' }
  // ]

  const weights = [
    { value: 'WeightBowl', label: 'WeightBowl' },
    { value: 'Container', label: 'Container' }
  ]

  const cans = [
    { value: 'Aluminium', label: 'Aluminium' },
    { value: 'Iron', label: 'Iron' }
  ]

  const mtype = [
    { value: 'mixed', label: 'Mixed' },
    { value: 'cow', label: 'Cow' },
    { value: 'buffalo', label: 'Buffalo' }
  ]

  const mstatus = [
    { value: 'good', label: 'Good' },
    { value: 'better', label: 'Better' },
    { value: 'best', label: 'Best' }
  ]

  // Compute Total no. of cans for the active route until route is changed
  const routeTotalCans = useMemo(() => {
    if (!selectedRoute) return 0

    const currentRoute = routes.find(
      (r) => String(r.id) === selectedRoute || (r as any).routeCode === selectedRoute
    )
    const currentCode = (currentRoute as any)?.routeCode || currentRoute?.routeName || selectedRoute

    return entries
      .filter((item) => {
        // const itemRoute = item.rootCode || item.routes
        // return (
        //   itemRoute === currentCode ||
        //   itemRoute === currentRoute?.routeName ||
        //   String(item.routes) === String(selectedRoute)
        // )
        // 1. Match Route
        const itemRoute = item.rootCode || item.routes
        const isRouteMatch =
          itemRoute === currentCode ||
          itemRoute === currentRoute?.routeName ||
          String(item.routes) === String(selectedRoute)
        // Matches whichever shift is currently active ('1', '2', '3', etc.)
        const isShiftMatch = !shift || String(item.shift) === String(shift)
        return isRouteMatch && isShiftMatch
      })
      .reduce((sum, item) => sum + (Number(item.noOfCans) || 0), 0)
  }, [selectedRoute, entries, routes])

  // Save Collection
  const handleSaveCollection = async () => {
    // Requirement 5: All fields are required
    if (!shift) {
      toast.warn('Please select Shift.')
      return
    }
    if (!plant) {
      toast.warn('Please select Chilling Center.')
      return
    }
    if (!weightSystem) {
      toast.warn('Please select Weight System.')
      return
    }
    if (!cansType) {
      toast.warn('Please select Cans Type.')
      return
    }
    if (!milkType) {
      toast.warn('Please select Milk Type.')
      return
    }
    if (!milkStatus) {
      toast.warn('Please select Milk Status.')
      return
    }
    if (!selectedRoute) {
      toast.warn('Please select Route Name.')
      return
    }
    if (!selectedVendor) {
      toast.warn('Please select Vendor Name.')
      return
    }
    if (!noOfCans || Number(noOfCans) <= 0) {
      toast.warn('Please enter valid No. of Cans (greater than 0).')
      return
    }
    // Machine weight check: Must be calculated by the scale
    if (!weightCans || Number(weightCans) <= 0) {
      toast.error('No weight received from scale! Please wait for scale machine reading.')
      return
    }

    try {
      const currentRoute = routes.find(
        (r) => String(r.id) === selectedRoute || (r as any).routeCode === selectedRoute
      )
      const rootCode =
        (currentRoute as any)?.routeCode || currentRoute?.routeName || selectedRoute || 'ROOT001'

      const currentVendor = vendors.find(
        (v) => String(v.id) === selectedVendor || v.vendorCode === selectedVendor
      )
      const vendorCode = currentVendor?.vendorCode || selectedVendor || 'VEND001'

      const selectedCan = cans.find((c) => c.value === cansType)?.label || cansType || ''
      const selectedWeight =
        weights.find((w) => w.value === weightSystem)?.label || weightSystem || ''
      const selectedMilkType = mtype.find((m) => m.value === milkType)?.label || milkType || ''
      const selectedMilkStatus =
        mstatus.find((m) => m.value === milkStatus)?.label || milkStatus || ''

      const weightNum = Number(weightCans) || 0
      const cansNum = Number(noOfCans) || 0

      const payload = {
        plant: String(user?.plant || plant),
        userCode: userCode,
        rootCode: rootCode,
        vendorCode: vendorCode,
        shift: Number(shift),
        canType: selectedCan,
        weightSystem: selectedWeight,
        milkType: selectedMilkType,
        milkStatus: selectedMilkStatus,
        tipingTime: currentTime,
        noOfCans: cansNum,
        grossWeight: weightNum,
        netWeight: weightNum,
        netLtr: weightNum,
        fat: 0,
        snf: 0,
        clr: 0,
        entry: entry
      }

      if (typeof window !== 'undefined' && (window as any).api?.saveMilkCollection) {
        await (window as any).api.saveMilkCollection(payload)
      }

      toast.success('Milk collection saved successfully!')

      // Requirement 1: DO NOT clear selectedRoute. Only clear vendor name, cans, and weight.
      setSelectedVendor('')
      setNoOfCans('')
      // setWeightCans('')
      setWeightCans(IS_TEST_MODE ? DEFAULT_TEST_WEIGHT : '')

      // Auto-focus Vendor input for the next collection on this route
      setTimeout(() => {
        const vendorInput = document.getElementById(
          'vendor-select-input'
        ) as HTMLInputElement | null
        vendorInput?.focus()
      }, 100)

      // Clear the captured weight reading in serial service so new reading arrives fresh
      if (typeof window !== 'undefined' && (window as any).api?.clearSerialReadings) {
        await (window as any).api.clearSerialReadings(['weight'])
      }

      await fetchCollections(1)
    } catch (error) {
      console.error('Failed to save milk collection:', error)
      toast.error('Failed to save milk collection. Please try again.')
    }
  }

  // Requirement 4: On Enter key in "No. of Cans" field
  const handleNoOfCansKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      // If scale weight is already received from the machine, trigger save immediately!
      if (weightCans && Number(weightCans) > 0) {
        handleSaveCollection()
      } else {
        toast.info('Waiting for scale machine reading...')
        // Focus the save button
        const saveBtn = document.querySelector<HTMLButtonElement>(
          'button[data-action="save-collection"]'
        )
        saveBtn?.focus()
      }
    }
  }

  const handleCancel = () => {
    setSelectedRoute('')
    setSelectedVendor('')
    // setShift('1')
    // setWeightSystem('')
    // setCansType('')
    // setMilkType('')
    // setMilkStatus('')
    setNoOfCans('')
    setWeightCans('')
  }

  return (
    <div className="space-y-3">
      {/* Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageBreadcrumb title="Procurement Collection" 
        // desc="Record real-time machine tipping" 
        />
      </div>

      <div className="mt-2 p-3 sm:p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
        <CustomForm onSubmit={(e) => e.preventDefault()} className="w-full">
          <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-2.5">
            {/* Date (Read-only, skipped in Tab order) */}
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
              <label className="text-xs font-semibold text-slate-700">
                Select Shift <span className="text-rose-500">*</span>
              </label>
              <CustomForm.CustomSelectSearchField
                name="shift"
                value={shift}
                onChange={(e: any) => setShift(e.target.value)}
                options={shifts}
                readOnly={true}
                tabIndex={1}
              />
            </div>

            {/* Chilling Center (Read-only, skipped in Tab order) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Chilling Center</label>
              <CustomForm.CustomTextField
                name="chilling"
                value={user?.plantName || user?.plant || ''}
                readOnly={true}
                tabIndex={-1}
              />
            </div>
            {/* Tipping Time (Read-only, skipped in Tab order) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Tipping Time</label>
              <CustomForm.CustomTextField
                name="time"
                value={currentTime}
                readOnly={true}
                tabIndex={-1}
              />
            </div>

            {/* Weight System (tabIndex: 2) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Weight System <span className="text-rose-500">*</span>
              </label>
              <CustomForm.CustomSelectSearchField
                name="weight"
                value={weightSystem}
                onChange={(e: any) => setWeightSystem(e.target.value)}
                options={weights}
                tabIndex={2}
              />
            </div>

            {/* Cans Type (tabIndex: 3) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Cans Type <span className="text-rose-500">*</span>
              </label>
              <CustomForm.CustomSelectSearchField
                name="cans"
                value={cansType}
                onChange={(e: any) => setCansType(e.target.value)}
                options={cans}
                tabIndex={3}
              />
            </div>

            {/* Milk Type (tabIndex: 4) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Milk Type <span className="text-rose-500">*</span>
              </label>
              <CustomForm.CustomSelectSearchField
                name="milktype"
                value={milkType}
                onChange={(e: any) => setMilkType(e.target.value)}
                options={mtype}
                tabIndex={4}
              />
            </div>

            {/* Milk Status (tabIndex: 5) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Milk Status <span className="text-rose-500">*</span>
              </label>
              <CustomForm.CustomSelectSearchField
                name="milkstatus"
                value={milkStatus}
                onChange={(e: any) => setMilkStatus(e.target.value)}
                options={mstatus}
                tabIndex={5}
              />
            </div>

            {/* Dynamic Routes Dropdown (tabIndex: 6) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Routes Name<span className="text-rose-500">*</span>{' '}
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
                tabIndex={6}
              />
            </div>

            {/* Vendor Name (tabIndex: 7) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Vendor Name <span className="text-rose-500">*</span>{' '}
                {loadingVendors && <span className="text-slate-400 font-normal">(Loading...)</span>}
              </label>
              <CustomForm.CustomSelectSearchField
                name="vendor"
                inputId="vendor-select-input"
                placeholder={
                  !selectedRoute
                    ? 'Please select a route first...'
                    : loadingVendors
                      ? 'Loading vendors...'
                      : vendorOptions.length === 0
                        ? 'No vendors found for this route'
                        : 'Select & search vendor...'
                }
                value={selectedVendor}
                onChange={handleVendorChange}
                options={vendorOptions}
                disabled={loadingVendors || !selectedRoute}
                tabIndex={7}
              />
            </div>

            {/* Number of Cans (tabIndex: 8) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                No. of Cans <span className="text-rose-500">*</span>
              </label>
              <CustomForm.CustomNumberField
                name="noOfCans"
                id="no-of-cans-input"
                value={noOfCans}
                onChange={(e: any) => setNoOfCans(e.target.value)}
                onKeyDown={handleNoOfCansKeyDown}
                placeholder="e.g. 4"
                tabIndex={8}
              />
              <p className="text-xs font-semibold text-slate-700">
                Total no. cans: <span className="text-primary font-bold">{routeTotalCans}</span>
              </p>
            </div>

            {/* Weight (LTR) - Strictly Machine-Calculated & Read-only */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  Weight (LTR) <span className="text-rose-500">*</span>
                </label>
                {isScaleConnected ? (
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Scale Connected
                  </span>
                ) : (
                  <span className="text-[10px] text-rose-500 font-semibold flex items-center gap-1">
                    <WifiOff className="w-3 h-3 text-rose-500" />
                    Scale Disconnected
                  </span>
                )}
              </div>
              <CustomForm.CustomTextField
                name="weight"
                value={weightCans}
                readOnly={true}
                tabIndex={-1}
                placeholder={
                  isScaleConnected ? 'Waiting for scale reading...' : 'Scale not connected'
                }
                className="bg-slate-100 font-bold text-slate-800 cursor-not-allowed select-none"
              />
            </div>
          </div>

          {/* Action Buttons (tabIndex: 9 & 10) */}
          <div className="flex justify-end items-center gap-2.5 mt-3 pt-2 border-t border-slate-100">
            <Button1
              variant="outline"
              icon={<X className="w-3.5 h-3.5 text-primary" />}
              label="Clear"
              onClick={handleCancel}
              tabIndex={9}
            />
            <Button1
              data-action="save-collection"
              variant="primary"
              icon={<Bookmark className="w-3.5 h-3.5 text-white" />}
              label="Save Collection"
              onClick={handleSaveCollection}
              tabIndex={10}
            />
          </div>
        </CustomForm>
      </div>

      {/* Collection Records Table */}
      <div className="mt-2 p-3 sm:p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-500/10 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-2 whitespace-nowrap">Sample Code</th>
                <th className="py-3 px-2 whitespace-nowrap">Date</th>
                <th className="py-3 px-2 whitespace-nowrap">Shift</th>
                <th className="py-3 px-2 whitespace-nowrap">Plant Id</th>
                <th className="py-3 px-2 whitespace-nowrap">Route Name</th>
                <th className="py-3 px-2 whitespace-nowrap">Vendor Name</th>
                <th className="py-3 px-2 whitespace-nowrap">Weight System</th>
                <th className="py-3 px-2 whitespace-nowrap">Cans Type</th>
                <th className="py-3 px-2 whitespace-nowrap">Milk Type</th>
                <th className="py-3 px-2 whitespace-nowrap">Milk Status</th>
                <th className="py-3 px-2 whitespace-nowrap">No. of Cans</th>
                <th className="py-3 px-2 whitespace-nowrap">Gross Weight</th>
                <th className="py-3 px-2 whitespace-nowrap">Net Weight</th>
                <th className="py-3 px-2 whitespace-nowrap">Tipping Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {entries.map((item, index) => (
                <tr key={item.id ?? index} className="hover:bg-slate-50/70 transition">
                  <td className="py-2 px-4 font-semibold text-primary">{item.sampleCode}</td>
                  <td className="py-2 px-4 font-semibold text-primary">
                    {item.sampleDate
                      ? (() => {
                          const d = new Date(item.sampleDate)
                          return isNaN(d.getTime())
                            ? String(item.sampleDate)
                            : d.toLocaleDateString()
                        })()
                      : item.date || ''}
                  </td>
                  <td className="py-2 px-4 font-semibold text-slate-800">{item.shift}</td>
                  {/* <td className="py-2 px-4">
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
                          : item.shiftName || `Shift ${item.shift}`}
                    </span>
                  </td> */}
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
                  <td className="py-2 px-4 font-bold text-emerald-600">{item.netWeight}</td>
                  <td className="py-2 px-4 font-bold text-emerald-600">{item.netWeight}</td>
                  <td className="py-2 px-4 font-semibold text-primary">{item.tipingTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ProcurementCollection
