import React, { useEffect, useState } from 'react'
import { Bookmark, X, ChevronLeft, ChevronRight } from 'lucide-react'
import Button1 from '@renderer/components/buttons/Button1'
import PageBreadcrumb from '@renderer/components/breadcrumbs/PageBreadcrumb'
import CustomForm from '@renderer/components/customform/CustomForm'
import api from '@renderer/services'
import type { Route } from '@renderer/types/routes/routes.types'
import type { Vendor } from '@renderer/types/vendors/vendors.types'

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

interface PaginationState {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export const ProcurementCollection: React.FC = () => {
  // Routes State
  const [routes, setRoutes] = useState<Route[]>([])
  const [routeOptions, setRouteOptions] = useState<SelectOption[]>([])
  const [selectedRoute, setSelectedRoute] = useState<string>('')
  const [loadingRoutes, setLoadingRoutes] = useState<boolean>(false)

  // Vendor states
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [vendorOptions, setVendorOptions] = useState<SelectOption[]>([])
  const [selectedVendor, setSelectedVendor] = useState<string>('')
  const [loadingVendors, setLoadingVendors] = useState<boolean>(false)

  // Other Form States
  const [shift, setShift] = useState('')
  const [weightSystem, setWeightSystem] = useState('')
  const [cansType, setCansType] = useState('')
  const [milkType, setMilkType] = useState('')
  const [milkStatus, setMilkStatus] = useState('')
  const [noOfCans, setNoOfCans] = useState('')
  const [weightCans, setWeightCans] = useState('')
  const [clrp, setClrp] = useState('2.4')
  const [fatp, setFatp] = useState('24.5')
  const [snfp, setSnfp] = useState('78.5')

  const userCode = 'USR0001'
  const entry = 'MACHINE'

  // Pagination State
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  })

  const [entries, setEntries] = useState<MilkEntry[]>([])

  // Fetch routes from Electron Main Process via api service
  const fetchRoutes = async () => {
    try {
      setLoadingRoutes(true)

      const response = await api.routes.getAll()
      setRoutes(response)

      // Convert routes into { value, label } format for dropdown
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

  const fetchVendors = async (): Promise<void> => {
    try {
      setLoadingVendors(true)

      const response = await api.vendors.getAll()
      setVendors(response)

      // Convert vendors into { value, label } format for dropdown
      const options: SelectOption[] = response.map((vendor) => ({
        value: String(vendor.id),
        label: vendor.vendorCode
      }))

      setVendorOptions(options)
    } catch (error) {
      console.error('Failed to fetch vendors:', error)
    } finally {
      setLoadingVendors(false)
    }
  }

  // Fetch paginated milk collection entries from Electron Main Process
  const fetchCollections = async (page = 1): Promise<void> => {
    try {
      if (typeof window !== 'undefined') {
        const getFn =
          (window as any).api?.getPaginatedMilkCollctions ||
          (window as any).api?.getPaginatedMilkCollections

        if (getFn) {
          const response = await getFn({ page, limit: 10 })
          if (response) {
            if (response.data) {
              setEntries(response.data)
            }
            if (response.pagination) {
              setPagination(response.pagination)
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch milk collections:', error)
    }
  }

  // Load routes, vendors, and table entries when component mounts
  useEffect(() => {
    fetchRoutes()
    fetchVendors()
    fetchCollections(1)
  }, [])

  // Current Date
  const getCurrentLocalDate = (): string => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Current Time
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

  useEffect(() => {
    if (noOfCans !== '') {
      setWeightCans(String(Number(noOfCans) * 20))
    } else {
      setWeightCans('')
    }
  }, [noOfCans])

  // Static Dropdown Options
  const shifts = [
    { value: '1', label: 'Morning' },
    { value: '2', label: 'Evening' }
  ]

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

  // Save Collection Handler
  const handleSaveCollection = async () => {
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

      const weightNum = Number(weightCans)

      const payload = {
        plant: '1102',
        userCode: userCode,
        rootCode: rootCode,
        vendorCode: vendorCode,
        shift: Number(shift),
        canType: selectedCan,
        weightSystem: selectedWeight,
        milkType: selectedMilkType,
        milkStatus: selectedMilkStatus,
        tipingTime: currentTime,
        noOfCans: Number(noOfCans),
        grossWeight: weightNum,
        netWeight: weightNum,
        netLtr: weightNum,
        fat: Number(fatp),
        snf: Number(snfp),
        clr: Number(clrp),
        entry: entry
      }

      if (typeof window !== 'undefined' && (window as any).api?.saveMilkCollection) {
        await (window as any).api.saveMilkCollection(payload)
      }

      // Refresh table from page 1 immediately after save
      await fetchCollections(1)
    } catch (error) {
      console.error('Failed to save milk collection:', error)
    }
  }

  // Cancel Handler
  const handleCancel = () => {
    setSelectedRoute('')
    setSelectedVendor('')
    setShift('')
    setWeightSystem('')
    setCansType('')
    setMilkType('')
    setMilkStatus('')
    setNoOfCans('')
    setWeightCans('')
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageBreadcrumb title="Procurement Collection" desc="collect you milk here" />
      </div>

      <div className="mt-2 p-3 sm:p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
        <CustomForm onSubmit={(e) => e.preventDefault()} className="w-full">
          <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-2.5">
            {/* Shift */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Select Shift</label>
              <CustomForm.CustomSelectSearchField
                name="shift"
                value={shift}
                onChange={(e: any) => setShift(e.target.value)}
                options={shifts}
              />
            </div>

            {/* Chilling Center */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Chilling Center</label>
              <CustomForm.CustomSelectField
                name="chilling"
                value="center1"
                options={[
                  { value: '1102', label: 'Raipur' },
                  { value: '1103', label: 'Jagatpur' }
                ]}
                readOnly={true}
              />
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Date</label>
              <CustomForm.CustomTextField
                name="date"
                value={getCurrentLocalDate()}
                readOnly={true}
              />
            </div>

            {/* Weight System */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Weight System</label>
              <CustomForm.CustomSelectSearchField
                name="weight"
                value={weightSystem}
                onChange={(e: any) => setWeightSystem(e.target.value)}
                options={weights}
              />
            </div>

            {/* Dynamic Routes Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Routes{' '}
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

            {/* Cans Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Cans Type</label>
              <CustomForm.CustomSelectSearchField
                name="cans"
                value={cansType}
                onChange={(e: any) => setCansType(e.target.value)}
                options={cans}
              />
            </div>

            {/* Milk Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Milk Type</label>
              <CustomForm.CustomSelectSearchField
                name="milktype"
                value={milkType}
                onChange={(e: any) => setMilkType(e.target.value)}
                options={mtype}
              />
            </div>

            {/* Milk Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Milk Status</label>
              <CustomForm.CustomSelectSearchField
                name="milkstatus"
                value={milkStatus}
                onChange={(e: any) => setMilkStatus(e.target.value)}
                options={mstatus}
              />
            </div>

            {/* Tipping Time */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Tipping Time</label>
              <CustomForm.CustomTextField
                name="time"
                value={getCurrentLocalDateTime()}
                readOnly={true}
              />
            </div>

            {/* Vendor Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Vendor Name
                {loadingVendors && <span className="text-slate-400 font-normal">(Loading...)</span>}
              </label>
              <CustomForm.CustomSelectSearchField
                name="vendor"
                placeholder={loadingVendors ? 'Loading vendors...' : 'Select & search vendor...'}
                value={selectedVendor}
                onChange={(e: any) => setSelectedVendor(e.target.value)}
                options={vendorOptions}
                disabled={loadingVendors}
              />
            </div>

            {/* Number of Cans */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">No. of Cans</label>
              <CustomForm.CustomNumberField
                name="noOfCans"
                value={noOfCans}
                onChange={(e: any) => setNoOfCans(e.target.value)}
                placeholder="e.g. 4"
              />
            </div>

            {/* Weight */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Weight (LTR)</label>
              <CustomForm.CustomTextField
                name="weight"
                value={weightCans}
                onChange={(e: any) => setWeightCans(e.target.value)}
                placeholder="e.g. 80"
              />
            </div>

            {/* CLR Percentage */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">CLR Percentage (%)</label>
              <CustomForm.CustomTextField
                name="clr"
                value={clrp}
                onChange={(e: any) => setClrp(e.target.value)}
                readOnly={true}
              />
            </div>

            {/* FAT Percentage */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">FAT Percentage (%)</label>
              <CustomForm.CustomTextField
                name="fat"
                value={fatp}
                onChange={(e: any) => setFatp(e.target.value)}
                readOnly={true}
              />
            </div>

            {/* SNF Percentage */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">SNF Percentage (%)</label>
              <CustomForm.CustomTextField
                name="snf"
                value={snfp}
                onChange={(e: any) => setSnfp(e.target.value)}
                readOnly={true}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end items-center gap-2.5 mt-3 pt-2 border-t border-slate-100">
            <Button1
              variant="outline"
              icon={<X className="w-3.5 h-3.5 text-primary" />}
              label="Cancel"
              onClick={handleCancel}
            />
            <Button1
              variant="primary"
              icon={<Bookmark className="w-3.5 h-3.5 text-white" />}
              label="Save Collection"
              onClick={handleSaveCollection}
            />
          </div>
        </CustomForm>
      </div>

      <div className="mt-2 p-3 sm:p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
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
                <th className="py-3 px-2 whitespace-nowrap">CLR(%)</th>
                <th className="py-3 px-2 whitespace-nowrap">FAT(%)</th>
                <th className="py-3 px-2 whitespace-nowrap">SNF(%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {entries.map((item, index) => (
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
                          : item.shiftName || `Shift ${item.shift}`}
                    </span>
                  </td>
                  <td className="py-2 px-4 font-semibold text-slate-800">
                    {item.plant || item.chillingPlant}
                  </td>
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
                  <td className="py-2 px-4 font-bold text-slate-900">
                    {item.weightSystem || item.grossWeight}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-primary max-w-[150px] truncate">
                    {item.rootCode || item.routes}
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
                  <td className="py-2 px-4 font-bold text-emerald-600">{item.netWeight}</td>
                  <td className="py-2 px-4 text-slate-700">
                    {item.clr !== undefined ? item.clr : item.clrPercent}%
                  </td>
                  <td className="py-2 px-4 text-slate-700">
                    {item.fat !== undefined ? item.fat : item.fatPercent}%
                  </td>
                  <td className="py-2 px-4 text-slate-700">
                    {item.snf !== undefined ? item.snf : item.snfPercent}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <div>
            Showing page <span className="font-semibold text-slate-700">{pagination.page}</span> of{' '}
            <span className="font-semibold text-slate-700">{pagination.totalPages || 1}</span> (
            {pagination.total || entries.length} items)
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={!pagination.hasPrevPage}
              onClick={() => fetchCollections(pagination.page - 1)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <button
              type="button"
              disabled={!pagination.hasNextPage}
              onClick={() => fetchCollections(pagination.page + 1)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProcurementCollection
