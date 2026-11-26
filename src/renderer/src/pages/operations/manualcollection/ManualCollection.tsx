import React, { useEffect, useState, useRef, useMemo } from 'react'
import { Bookmark, X, Clock } from 'lucide-react'
import Button1 from '@renderer/components/buttons/Button1'
import PageBreadcrumb from '@renderer/components/breadcrumbs/PageBreadcrumb'
import CustomForm from '@renderer/components/customform/CustomForm'
import api from '@renderer/services'
import { toast } from 'react-toastify'
import { useAuth } from '@renderer/context/AuthContext'
import { RouteResponseDto } from '@shared/dtos/route/route-response.dto'
import { VendoreResponseDto } from '@shared/dtos/vendor/vendor.dto'
import { MilkCollectionDto } from '@shared/dtos/milk-collection/milk-collection.dto'
import { useShift } from '@renderer/hooks/useShift'

interface SelectOption {
  value: string
  label: string
}

export const ManualCollection: React.FC = () => {
  const { user } = useAuth()
  const { shiftOptions, currentShiftId } = useShift(user?.plant)
  const shifts = shiftOptions

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
  const [shift, setShift] = useState(currentShiftId)
  const [plant, setPlant] = useState<string>(user?.plant)

  // Manual entry fields (one decimal precision)
  const [noOfCans, setNoOfCans] = useState('')
  const [weightCans, setWeightCans] = useState('')
  const [fat, setFat] = useState('')
  const [snf, setSnf] = useState('')
  const [clr, setClr] = useState('')

  const userCode = user?.userCode
  const entry = 'MANUAL'

  const [lastSampleDate, setLastSampleDate] = useState<string>('')
  const [loadingLastSampleDate, setLoadingLastSampleDate] = useState<boolean>(false)

  // Ref to track if Route was just selected by user
  const shouldFocusVendorRef = useRef(false)

  // Helper: allows empty string or numbers with at most one decimal place (e.g. 3, 3.5)
  const handleOneDecimalChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const regex = /^\d*\.?\d{0,1}$/
      const val = e.target.value
      if (val === '' || regex.test(val)) {
        setter(val)
      }
    }

  // 1. When route changes: update state and reset downstream inputs
  const handleRouteChange = (e: any) => {
    const val = e?.target?.value ?? ''
    setSelectedRoute(val)
    setWeightCans('')
    setFat('')
    setSnf('')
    // setClr('')

    if (val) {
      shouldFocusVendorRef.current = true
    }
  }

  // 2. When vendor is selected: auto-focus No. of Cans input
  const handleVendorChange = (e: any) => {
    const val = e?.target?.value ?? ''
    setSelectedVendor(val)
    setWeightCans('')
    setFat('')
    setSnf('')
    // setClr('')

    if (val) {
      setTimeout(() => {
        const cansInput = document.getElementById('no-of-cans-input') as HTMLInputElement | null
        cansInput?.focus()
        cansInput?.select?.()
      }, 50)
    }
  }

  // 3. Handle No. of Cans change: updates cans and clears subsequent manual fields
  const handleNoOfCansChange = (e: any) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 2)
    if (val === '' || Number(val) <= 16) {
      setNoOfCans(val)
      setWeightCans('')
      setFat('')
      setSnf('')
      //   setClr('')
    }
  }

  const [entries, setEntries] = useState<MilkCollectionDto[]>([])

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

  useEffect(() => {
    if (currentShiftId) {
      setShift(currentShiftId)
      fetchCollections(getCurrentDateISO(), currentShiftId)
    }
  }, [currentShiftId])

  // Fetch vendors whenever the selected route changes
  useEffect(() => {
    if (!selectedRoute) {
      setVendors([])
      setVendorOptions([])
      setSelectedVendor('')
      return
    }

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

  // Current date formatted as YYYY-MM-DD
  const getCurrentDateISO = (): string => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const fetchCollections = async (
    dateVal = getCurrentDateISO(),
    shiftVal = shift
  ): Promise<void> => {
    try {
      const shiftNum = shiftVal ? Number(shiftVal) : undefined
      if (!shiftNum || isNaN(shiftNum) || shiftNum <= 0) {
        return
      }
      const response = await api.collection.getMilkCollections(dateVal, shiftNum)
      if (response) {
        setEntries(response)
      }
    } catch (error) {
      console.error('Failed to fetch milk collections:', error)
    }
  }

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

  // Hotkeys: 'r' for route, 'v' for vendor, 'c' for cans
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) return

      const key = e.key.toLowerCase()

      if (key === 'r') {
        const routeInput = document.getElementById('route-select-input') as HTMLInputElement | null
        if (routeInput && (e.altKey || document.activeElement !== routeInput)) {
          e.preventDefault()
          routeInput.focus()
          routeInput.select?.()
        }
      } else if (key === 'v') {
        const vendorInput = document.getElementById(
          'vendor-select-input'
        ) as HTMLInputElement | null
        if (vendorInput && (e.altKey || document.activeElement !== vendorInput)) {
          e.preventDefault()
          vendorInput.focus()
          vendorInput.select?.()
        }
      } else if (key === 'c') {
        const cansInput = (document.getElementById('no-of-cans-input') ||
          document.querySelector('input[name="noOfCans"]')) as HTMLInputElement | null
        if (cansInput && (e.altKey || document.activeElement !== cansInput)) {
          e.preventDefault()
          cansInput.focus()
          cansInput.select?.()
        }
      } else if (key === 'w') {
        const weightInput = document.getElementById('weight-input') as HTMLInputElement | null
        if (weightInput && (e.altKey || document.activeElement !== weightInput)) {
          e.preventDefault()
          weightInput.focus()
          weightInput.select?.()
        }
      } else if (key === 'f') {
        const fatInput = document.getElementById('fat-input') as HTMLInputElement | null
        if (fatInput && (e.altKey || document.activeElement !== fatInput)) {
          e.preventDefault()
          fatInput.focus()
          fatInput.select?.()
        }
      } else if (key === 's') {
        const snfInput = document.getElementById('snf-input') as HTMLInputElement | null
        if (snfInput && (e.altKey || document.activeElement !== snfInput)) {
          e.preventDefault()
          snfInput.focus()
          snfInput.select?.()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // Weight Systems state
  const [weights, setWeights] = useState<SelectOption[]>([])
  const [weightSystem, setWeightSystem] = useState<string>('')
  const [loadingWeights, setLoadingWeights] = useState<boolean>(false)

  const fetchWeightSystems = async (): Promise<void> => {
    try {
      setLoadingWeights(true)
      const response = await window.api.getWeightSystems()
      const dataList = Array.isArray(response)
        ? response
        : Array.isArray((response as any)?.data)
          ? (response as any).data
          : []

      const options: SelectOption[] = dataList.map((item: any) => {
        const rawName = String(item.systemList ?? item.system_list ?? '').trim()
        const formattedLabel = rawName ? rawName.charAt(0).toUpperCase() + rawName.slice(1) : ''
        return {
          value: rawName,
          label: formattedLabel
        }
      })

      setWeights(options)
      if (options.length > 0) {
        setWeightSystem((prev) => prev || options[0].value)
      }
    } catch (error) {
      console.error('Failed to fetch weight systems:', error)
    } finally {
      setLoadingWeights(false)
    }
  }

  // Can Types state
  const [cans, setCans] = useState<SelectOption[]>([])
  const [cansType, setCansType] = useState<string>('')
  const [loadingCansType, setLoadingCansType] = useState<boolean>(false)

  const fetchCanTypes = async (): Promise<void> => {
    try {
      setLoadingCansType(true)
      const response = await window.api.getCanTypes()
      const dataList = Array.isArray(response)
        ? response
        : Array.isArray((response as any)?.data)
          ? (response as any).data
          : []

      const options: SelectOption[] = dataList.map((item: any) => ({
        value: String(item.id),
        label: String(item.cansType ?? item.canType ?? item.cans_type ?? '')
      }))

      setCans(options)
      if (options.length > 0) {
        setCansType((prev) => prev || options[0].value)
      }
    } catch (error) {
      console.error('Failed to fetch can types:', error)
    } finally {
      setLoadingCansType(false)
    }
  }

  // Milk Type state
  const [mtype, setMtype] = useState<SelectOption[]>([])
  const [milkType, setMilkType] = useState<string>('')
  const [loadingMilkType, setLoadingMilkType] = useState<boolean>(false)

  const fetchMilkTypes = async (): Promise<void> => {
    try {
      setLoadingMilkType(true)
      const response = await window.api.getMilkType()
      const dataList = Array.isArray(response)
        ? response
        : Array.isArray((response as any)?.data)
          ? (response as any).data
          : []

      const options: SelectOption[] = dataList.map((item: any) => ({
        value: String(item.id),
        label: String(item.milkType ?? item.milk_type ?? '')
      }))

      setMtype(options)
      if (options.length > 0) {
        setMilkType((prev) => prev || options[0].value)
      }
    } catch (error) {
      console.error('Failed to fetch milk types:', error)
    } finally {
      setLoadingMilkType(false)
    }
  }

  // Milk Status state
  const [mstatus, setMstatus] = useState<SelectOption[]>([])
  const [milkStatus, setMilkStatus] = useState<string>('')
  const [loadingMilkStatus, setLoadingMilkStatus] = useState<boolean>(false)

  const fetchMilkStatus = async (): Promise<void> => {
    try {
      setLoadingMilkStatus(true)
      const response = await window.api.getMilkStatus()
      const dataList = Array.isArray(response)
        ? response
        : Array.isArray((response as any)?.data)
          ? (response as any).data
          : []

      const options: SelectOption[] = dataList.map((item: any) => ({
        value: String(item.id),
        label: String(item.milkStatus ?? item.milk_status ?? '')
      }))

      setMstatus(options)
      if (options.length > 0) {
        setMilkStatus((prev) => prev || options[0].value)
      }
    } catch (error) {
      console.error('Failed to fetch milk status:', error)
    } finally {
      setLoadingMilkStatus(false)
    }
  }

  // Fetch Last Sample Date & Time dynamically
  const fetchLastSampleDate = async (): Promise<void> => {
    try {
      setLoadingLastSampleDate(true)
      if (typeof window !== 'undefined' && (window.api as any)?.getLastSampleDate) {
        const response = await (window.api as any).getLastSampleDate()
        const rawDate = Array.isArray(response)
          ? response[0]?.last_sample_date
          : response?.last_sample_date

        if (rawDate) {
          const d = new Date(rawDate)
          if (!isNaN(d.getTime())) {
            const day = String(d.getDate()).padStart(2, '0')
            const month = String(d.getMonth() + 1).padStart(2, '0')
            const year = d.getFullYear()
            const hours = String(d.getHours()).padStart(2, '0')
            const minutes = String(d.getMinutes()).padStart(2, '0')
            const seconds = String(d.getSeconds()).padStart(2, '0')

            setLastSampleDate(`${day}-${month}-${year} ${hours}:${minutes}:${seconds}`)
          } else {
            setLastSampleDate(String(rawDate))
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch last sample date:', error)
    } finally {
      setLoadingLastSampleDate(false)
    }
  }

  useEffect(() => {
    fetchRoutes()
    fetchWeightSystems()
    fetchMilkStatus()
    fetchMilkTypes()
    fetchCanTypes()
    fetchLastSampleDate()
  }, [])

  // Total cans for the active route
  const routeTotalCans = useMemo(() => {
    if (!selectedRoute) return 0

    const currentRoute = routes.find(
      (r) => String(r.id) === selectedRoute || (r as any).routeCode === selectedRoute
    )
    const currentCode = (currentRoute as any)?.routeCode || currentRoute?.routeName || selectedRoute

    return entries
      .filter((item) => {
        const itemRoute = item.rootCode || item.rootName
        const isRouteMatch =
          itemRoute === currentCode ||
          itemRoute === currentRoute?.routeName ||
          String(item.rootName) === String(selectedRoute)
        const isShiftMatch = !shift || String(item.shift) === String(shift)
        return isRouteMatch && isShiftMatch
      })
      .reduce((sum, item) => sum + (Number(item.noOfCans) || 0), 0)
  }, [selectedRoute, entries, routes, shift])

  // Save Collection
  const handleSaveCollection = async () => {
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
    if (!weightCans || Number(weightCans) <= 0) {
      toast.warn('Please enter valid Weight (greater than 0).')
      return
    }
    if (!fat || Number(fat) <= 0) {
      toast.warn('Please enter valid FAT.')
      return
    }
    if (!snf || Number(snf) <= 0) {
      toast.warn('Please enter valid SNF.')
      return
    }
    // if (!clr || Number(clr) <= 0) {
    //   toast.warn('Please enter valid CLR.')
    //   return
    // }

    try {
      const currentRoute = routes.find(
        (r) => String(r.id) === selectedRoute || (r as any).routeCode === selectedRoute
      )
      const rootCode =
        (currentRoute as any)?.routeCode || currentRoute?.routeName || selectedRoute || 'ROOT001'

      const currentVendor = vendors.find(
        (v) => String(v.id) === selectedVendor || v.vendorCode === selectedVendor
      )
      const vendorCode = currentVendor?.vendorCode || selectedVendor

      const selectedCan =
        cans.find((c) => String(c.value) === String(cansType))?.label || cansType || ''
      const selectedWeight =
        weights.find((w) => w.value === weightSystem)?.label || weightSystem || ''

      const weightNum = Number(Number(weightCans).toFixed(1)) || 0
      const cansNum = Number(noOfCans) || 0
      const fatNum = Number(Number(fat).toFixed(1)) || 0
      const snfNum = Number(Number(snf).toFixed(1)) || 0
      //   const clrNum = Number(Number(clr).toFixed(1)) || 0

      const payload = {
        plant: String(user?.plant || plant),
        userCode: userCode,
        rootCode: rootCode,
        vendorCode: vendorCode,
        shift: Number(shift),
        canType: selectedCan,
        weightSystem: selectedWeight,
        milkType: String(milkType),
        milkStatus: String(milkStatus),
        tipingTime: currentTime,
        noOfCans: cansNum,
        grossWeight: weightNum,
        netWeight: weightNum,
        netLtr: weightNum,
        fat: fatNum,
        snf: snfNum,
        clr: 0,
        entry: entry
      }

      if (typeof window !== 'undefined' && (window as any).api?.saveMilkCollection) {
        await (window as any).api.saveMilkCollection(payload)
      }

      toast.success('Manual milk collection saved successfully!')

      // Reset entry fields (Keep selectedRoute active)
      setSelectedVendor('')
      setNoOfCans('')
      setWeightCans('')
      setFat('')
      setSnf('')
      //   setClr('')

      // Auto-focus Vendor input for the next entry
      setTimeout(() => {
        const vendorInput = document.getElementById(
          'vendor-select-input'
        ) as HTMLInputElement | null
        vendorInput?.focus()
      }, 100)

      await fetchCollections()
      await fetchLastSampleDate()
    } catch (error: any) {
      console.error('Failed to save manual milk collection:', error)
      toast.error(error?.message || String(error))
    } finally {
      await fetchCollections()
    }
  }

  // Keyboard Navigation: Enter moves to the next logical field
  const handleNoOfCansKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const weightInput = document.getElementById('weight-input') as HTMLInputElement | null
      weightInput?.focus()
      weightInput?.select?.()
    }
  }

  const handleWeightKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const fatInput = document.getElementById('fat-input') as HTMLInputElement | null
      fatInput?.focus()
      fatInput?.select?.()
    }
  }

  const handleFatKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const snfInput = document.getElementById('snf-input') as HTMLInputElement | null
      snfInput?.focus()
      snfInput?.select?.()
    }
  }

  const handleSnfKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // if (e.key === 'Enter') {
    //   e.preventDefault()
    //   const clrInput = document.getElementById('clr-input') as HTMLInputElement | null
    //   clrInput?.focus()
    //   clrInput?.select?.()
    // }
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSaveCollection()
    }
  }

  //   const handleClrKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  //     if (e.key === 'Enter') {
  //       e.preventDefault()
  //       handleSaveCollection()
  //     }
  //   }

  const handleCancel = () => {
    setSelectedRoute('')
    setSelectedVendor('')
    setNoOfCans('')
    setWeightCans('')
    setFat('')
    setSnf('')
    // setClr('')
  }

  return (
    <div className="space-y-3">
      {/* Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageBreadcrumb title="Manual Collection" />

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white text-secondary border border-secondary/30">
            <Clock className="w-3.5 h-3.5 text-secondary" />
            Last Collected: {loadingLastSampleDate ? 'Loading...' : lastSampleDate || '-'}
          </span>
        </div>
      </div>

      {/* Manual Collection Form */}
      <div className="mt-2 p-3 sm:p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
        <CustomForm onSubmit={(e) => e.preventDefault()} className="w-full">
          <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-2.5">
            {/* Date (Read-only) */}
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
              <CustomForm.CustomSelectField
                name="shift"
                value={shift}
                onChange={(e: any) => {
                  const val = e.target.value
                  setShift(val)
                  if (val) {
                    fetchCollections(getCurrentDateISO(), val)
                  }
                }}
                options={shifts}
                tabIndex={1}
                readOnly={true}
              />
            </div>

            {/* Chilling Center (Read-only) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Chilling Center</label>
              <CustomForm.CustomTextField
                name="chilling"
                value={`${user?.plant || ''}, ${user?.plantName || ''}`}
                readOnly={true}
                tabIndex={-1}
              />
            </div>

            {/* Tipping Time (Read-only) */}
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
                Weight System <span className="text-rose-500">*</span>{' '}
                {loadingWeights && <span className="text-slate-400 font-normal">(Loading...)</span>}
              </label>
              <CustomForm.CustomSelectField
                name="weight"
                value={weightSystem}
                onChange={(e: any) => setWeightSystem(e.target.value)}
                options={weights}
                placeholder={
                  loadingWeights ? 'Loading weight systems...' : 'Select weight system...'
                }
                disabled={loadingWeights}
                tabIndex={2}
              />
            </div>

            {/* Cans Type (tabIndex: 3) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Cans Type <span className="text-rose-500">*</span>{' '}
                {loadingCansType && (
                  <span className="text-slate-400 font-normal">(Loading...)</span>
                )}
              </label>
              <CustomForm.CustomSelectField
                name="cans"
                value={cansType}
                onChange={(e: any) => setCansType(e.target.value)}
                options={cans}
                placeholder={loadingCansType ? 'Loading can types...' : 'Select can type...'}
                disabled={loadingCansType}
                tabIndex={3}
              />
            </div>

            {/* Milk Type (tabIndex: 4) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Milk Type <span className="text-rose-500">*</span>{' '}
                {loadingMilkType && (
                  <span className="text-slate-400 font-normal">(Loading...)</span>
                )}
              </label>
              <CustomForm.CustomSelectField
                name="milktype"
                value={milkType}
                onChange={(e: any) => setMilkType(e.target.value)}
                options={mtype}
                placeholder={loadingMilkType ? 'Loading milk types...' : 'Select milk type...'}
                disabled={loadingMilkType}
                tabIndex={4}
              />
            </div>

            {/* Milk Status (tabIndex: 5) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Milk Status <span className="text-rose-500">*</span>{' '}
                {loadingMilkStatus && (
                  <span className="text-slate-400 font-normal">(Loading...)</span>
                )}
              </label>
              <CustomForm.CustomSelectField
                name="milkstatus"
                value={milkStatus}
                onChange={(e: any) => setMilkStatus(e.target.value)}
                options={mstatus}
                placeholder={loadingMilkStatus ? 'Loading milk status...' : 'Select milk status...'}
                disabled={loadingMilkStatus}
                tabIndex={5}
              />
            </div>

            {/* Route Name (Hotkey: r, tabIndex: 6) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                <u>R</u>outes Name <span className="text-rose-500">*</span>{' '}
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

            {/* Vendor Name (Hotkey: v, tabIndex: 7) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                <u>V</u>endor Name <span className="text-rose-500">*</span>{' '}
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

            {/* Number of Cans (Hotkey: c, tabIndex: 8) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                No. of <u>C</u>ans <span className="text-rose-500">*</span>
              </label>
              <CustomForm.CustomNumberField
                name="noOfCans"
                id="no-of-cans-input"
                value={noOfCans}
                onChange={handleNoOfCansChange}
                onInput={(e: any) => {
                  if (e.target.value.length > 2) {
                    e.target.value = e.target.value.slice(0, 2)
                  }
                }}
                max={16}
                min={1}
                maxLength={2}
                onKeyDown={handleNoOfCansKeyDown}
                placeholder="e.g. 4"
                tabIndex={8}
                className="font-semibold text-slate-800"
              />
              <p className="text-xs font-semibold text-slate-700">
                Total no. cans: <span className="text-primary font-bold">{routeTotalCans}</span>
              </p>
            </div>

            {/* Weight (Gross / Net / Ltr - tabIndex: 9) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                <u>W</u>eight <span className="text-rose-500">*</span>
              </label>
              <CustomForm.CustomTextField
                name="weight"
                id="weight-input"
                value={weightCans}
                onChange={handleOneDecimalChange(setWeightCans)}
                onKeyDown={handleWeightKeyDown}
                tabIndex={9}
                placeholder="e.g. 25.5"
                className="font-semibold text-slate-800"
              />
            </div>

            {/* FAT (1 decimal - tabIndex: 10) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                <u>F</u>AT % <span className="text-rose-500">*</span>
              </label>
              <CustomForm.CustomTextField
                name="fat"
                id="fat-input"
                value={fat}
                onChange={handleOneDecimalChange(setFat)}
                onKeyDown={handleFatKeyDown}
                tabIndex={10}
                placeholder="e.g. 3.5"
                className="font-semibold text-slate-800"
              />
            </div>

            {/* SNF (1 decimal - tabIndex: 11) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                <u>S</u>NF % <span className="text-rose-500">*</span>
              </label>
              <CustomForm.CustomNumberField
                name="snf"
                id="snf-input"
                value={snf}
                onChange={handleOneDecimalChange(setSnf)}
                onKeyDown={handleSnfKeyDown}
                tabIndex={11}
                placeholder="e.g. 8.5"
                className="font-semibold text-slate-800"
              />
            </div>

            {/* CLR (1 decimal - tabIndex: 12) */}
            {/* <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                CLR <span className="text-rose-500">*</span>
              </label>
              <CustomForm.CustomTextField
                name="clr"
                id="clr-input"
                value={clr}
                onChange={handleOneDecimalChange(setClr)}
                onKeyDown={handleClrKeyDown}
                tabIndex={12}
                placeholder="e.g. 28.5"
                className="font-bold text-slate-800"
              />
            </div> */}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end items-center gap-2.5 mt-3 pt-2 border-t border-slate-100">
            <Button1
              variant="outline"
              icon={<X className="w-3.5 h-3.5 text-primary" />}
              label="Clear"
              onClick={handleCancel}
              tabIndex={-1}
            />
            <Button1
              data-action="save-collection"
              variant="primary"
              icon={<Bookmark className="w-3.5 h-3.5 text-white" />}
              label="Save Collection"
              onClick={handleSaveCollection}
              tabIndex={13}
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
                <th className="py-2 px-2 whitespace-nowrap">Net Ltr</th>
                <th className="py-2 px-2 whitespace-nowrap">FAT</th>
                <th className="py-2 px-2 whitespace-nowrap">SNF</th>
                <th className="py-2 px-2 whitespace-nowrap">CLR</th>
                <th className="py-2 px-2 whitespace-nowrap">Tipping Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {entries.map((item, index) => (
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
                  <td className="py-2 px-2 font-semibold text-slate-800">{item.plant}</td>
                  <td className="py-2 px-2 font-semibold text-primary max-w-40 truncate">
                    {item.rootName}
                  </td>
                  <td className="py-2 px-2 font-semibold whitespace-nowrap text-primary">
                    {item.vendorCode} - {item.dskName}
                  </td>
                  <td className="py-2 px-2 font-bold text-slate-900">{item.weightSystem}</td>
                  <td className="py-2 px-2 font-semibold text-primary">{item.canType}</td>
                  <td className="py-2 px-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                        String(item.milkTypeName).toLowerCase() === 'cow'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : String(item.milkTypeName).toLowerCase() === 'buffalo'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : String(item.milkTypeName).toLowerCase() === 'mixed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}
                    >
                      {item.milkTypeName}
                    </span>
                  </td>
                  <td className="py-2 px-2 font-semibold text-primary">
                    {item.milkStatus}. {item.milkStatusName}
                  </td>
                  <td className="py-2 px-2 font-semibold text-primary">{item.noOfCans}</td>
                  <td className="py-2 px-2 font-bold text-emerald-600">
                    {Number(item.grossWeight ?? item.netWeight ?? 0).toFixed(1)}
                  </td>
                  <td className="py-2 px-2 font-bold text-emerald-600">
                    {Number(item.netWeight ?? 0).toFixed(1)}
                  </td>
                  <td className="py-2 px-2 font-bold text-emerald-600">
                    {Number(item.netLtr ?? item.netWeight ?? 0).toFixed(1)}
                  </td>
                  <td className="py-2 px-2 font-bold text-slate-800">
                    {Number(item.fat ?? 0).toFixed(1)}
                  </td>
                  <td className="py-2 px-2 font-bold text-slate-800">
                    {Number(item.snf ?? 0).toFixed(1)}
                  </td>
                  <td className="py-2 px-2 font-bold text-slate-800">
                    {Number(item.clr ?? 0).toFixed(1)}
                  </td>
                  <td className="py-2 px-2 font-semibold text-primary">{item.tipingTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ManualCollection
