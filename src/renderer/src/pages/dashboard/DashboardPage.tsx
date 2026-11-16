import React, { useState } from 'react'
import {
  Users,
  UserPlus,
  Calendar,
  CheckCircle2,
  UploadCloud
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Button1 from '../../components/buttons/Button1'
import PageBreadcrumb from '../../components/breadcrumbs/PageBreadcrumb'
// import CustomForm from '../../components/customform/CustomForm';

interface FarmerRecord {
  id: string
  name: string
  initials: string
  avatarBg: string
  cattleCount: number
  gender: string
  mobile: string
  routeCode: string
  lastVisit: string
  totalTests: number
  status: 'Active' | 'Inactive'
}

const SAMPLE_FARMERS: FarmerRecord[] = [
  {
    id: 'FAR-1043',
    name: 'Biren Dhal',
    initials: 'BD',
    avatarBg: 'bg-linear-to-br from-primary to-secondary',
    cattleCount: 8,
    gender: 'Male',
    mobile: '9583722800',
    routeCode: 'R-North',
    lastVisit: '09 Aug 2026',
    totalTests: 0,
    status: 'Active'
  },
  {
    id: 'FAR-1042',
    name: 'Aarav Sharma',
    initials: 'AS',
    avatarBg: 'bg-teal-500',
    cattleCount: 14,
    gender: 'Male',
    mobile: '9876501042',
    routeCode: 'R-East',
    lastVisit: '09 Aug 2026',
    totalTests: 8,
    status: 'Active'
  },
  {
    id: 'FAR-1041',
    name: 'Priya Patel',
    initials: 'PP',
    avatarBg: 'bg-emerald-500',
    cattleCount: 6,
    gender: 'Female',
    mobile: '9876501041',
    routeCode: 'R-Central',
    lastVisit: '09 Aug 2026',
    totalTests: 12,
    status: 'Active'
  },
  {
    id: 'FAR-1040',
    name: 'Rohan Mehta',
    initials: 'RM',
    avatarBg: 'bg-cyan-600',
    cattleCount: 22,
    gender: 'Male',
    mobile: '9876501039',
    routeCode: 'R-South',
    lastVisit: '08 Aug 2026',
    totalTests: 21,
    status: 'Active'
  },
  {
    id: 'FAR-1039',
    name: 'Sneha Iyer',
    initials: 'SI',
    avatarBg: 'bg-teal-600',
    cattleCount: 10,
    gender: 'Female',
    mobile: '9876501037',
    routeCode: 'R-North',
    lastVisit: '06 Aug 2026',
    totalTests: 34,
    status: 'Active'
  }
]

export const DashboardPage: React.FC = () => {
  const { user } = useAuth()
  const [filterQuery, setFilterQuery] = useState('')
  const [farmers] = useState<FarmerRecord[]>(SAMPLE_FARMERS)

  const filteredFarmers = farmers.filter(
    (f) =>
      f.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      f.id.toLowerCase().includes(filterQuery.toLowerCase()) ||
      f.mobile.includes(filterQuery)
  )


  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <PageBreadcrumb
          title="Dashboard"
          // desc="View your personal daily milk pouring logs"
        />

        <div className="flex items-center gap-2.5">
          
          {/* <Button1
            variant="primary"
            icon={<UploadCloud className="w-3.5 h-3.5 text-white" />}
            label="Sync Analyzed Data"
          />
          <Button1
            variant="primary"
            icon={<UploadCloud className="w-3.5 h-3.5 text-white" />}
            label="Sync Rejected Data"
          /> */}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-start justify-between">
          <div>
            <div className="flex items-center ">
              <p className="text-[13px] font-semibold text-slate-400  tracking-wider">
                Total Routes:
              </p>
              <p className="text-[13px] font-bold text-slate-800 uppercase">40</p>
            </div>
            <div className="flex items-center">
              <p className="text-[13px] font-semibold text-slate-400  tracking-wider">
                Total Vendors:
              </p>
              <p className="text-[13px] font-bold text-slate-800 uppercase">399</p>
            </div>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-primary to-secondary text-white flex items-center justify-center shadow-md shadow-primary/25">
            <Users className="w-6 h-6 strokeWidth={2}" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex justify-between">
          <div>
            <div className="flex items-center ">
              <p className="text-[13px] font-semibold text-slate-400  tracking-wider">
                Milk Collected:
              </p>
              <p className="text-[13px] font-bold text-slate-800 uppercase">150</p>
            </div>
            <div className="flex items-center">
              <p className="text-[13px] font-semibold text-slate-400  tracking-wider">
                Milk Analyzed:
              </p>
              <p className="text-[13px] font-bold text-slate-800 uppercase">45</p>
            </div>
            <div className="flex items-center">
              <p className="text-[13px] font-semibold text-slate-400  tracking-wider">
                Milk Rejected:
              </p>
              <p className="text-[13px] font-bold text-slate-800 uppercase">1</p>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-pink-600 to-pink-300 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <UserPlus className="w-6 h-6 strokeWidth={2}" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex justify-between">
          <div>
            <div className="flex items-center ">
              <p className="text-[13px] font-semibold text-slate-400  tracking-wider">
                Total Supervisors:
              </p>
              <p className="text-[13px] font-bold text-slate-800 uppercase">4</p>
            </div>
            <div className="flex items-center">
              <p className="text-[13px] font-semibold text-slate-400  tracking-wider">
                Total Users:
              </p>
              <p className="text-[13px] font-bold text-slate-800 uppercase">4</p>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-emerald-600 to-emerald-300 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
            <Calendar className="w-6 h-6 strokeWidth={2}" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex justify-between">
          <div>
            <div className="flex items-center ">
              <p className="text-[13px] font-semibold text-slate-400  tracking-wider">
                Weight Scale:
              </p>
              <p className="text-[13px] font-bold text-slate-800 uppercase">0/1</p>
            </div>
            <div className="flex items-center">
              <p className="text-[13px] font-semibold text-slate-400  tracking-wider">
                Milk Analyzer:
              </p>
              <p className="text-[13px] font-bold text-slate-800 uppercase">0/4</p>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-orange-600 to-orange-300 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <CheckCircle2 className="w-6 h-6 strokeWidth={2}" />
          </div>
        </div>
      </div>

      {/* <div className="bg-white rounded-2xl border border-slate-100/90 shadow-xs overflow-hidden">
        
      </div> */}
    </div>
  )
}
