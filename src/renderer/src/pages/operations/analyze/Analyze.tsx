import React, { useState } from 'react'
import { Search } from 'lucide-react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import PageBreadcrumb from '@renderer/components/breadcrumbs/PageBreadcrumb'
import CustomForm from '@renderer/components/customform/CustomForm'
import Button1 from '@renderer/components/buttons/Button1'

interface AnalyzeArray {
  id: number
  sampleNo: number
  // port: string
  netWeight: string
  fatPercentage: number
  snfPercentage: number
}

const SAMPLE_REPORTS: AnalyzeArray[] = [
  {
    id: 1,
    sampleNo: 1,
    // port: '300',
    netWeight: '200.4',
    fatPercentage: 3,
    snfPercentage: 3
  }
]

export const Analyze: React.FC = () => {
  const [shift, setShift] = useState('1')
  const [plant, setPlant] = useState('1102')
  const [reports] = useState<AnalyzeArray[]>(SAMPLE_REPORTS)
  const [loading, setLoading] = useState<boolean>(false)

  // Current Date
  const getCurrentLocalDate = (): string => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const shifts = [
    { value: '1', label: 'Morning' },
    { value: '2', label: 'Evening' }
  ]

  const plantOptions = [
    { value: '1102', label: 'Raipur' },
    { value: '1103', label: 'Jagatpur' }
  ]

  // Save Analysis on Click of "Find" Button
  const handleSaveAnalysis = async () => {
    try {
      setLoading(true)

      const payload = {
        date: getCurrentLocalDate(),
        shift: Number(shift) || 1,
        plant: plant || '1102',
        samples: reports.map((item) => ({
          sampleNo: String(item.sampleNo),
          // port: String(item.port),
          netweight: Number(item.netWeight) || 0,
          fat: Number(item.fatPercentage) || 0,
          snf: Number(item.snfPercentage) || 0
        }))
      }

      if (typeof window !== 'undefined') {
        const updateFn =
          (window as any).api?.updateMilkAnalysis || (window as any).api?.updateMilkAnalysis

        if (updateFn) {
          await updateFn(payload)
        }
      }

      toast.success('Analysis data saved successfully!')
    } catch (error) {
      console.error('Failed to update analysis:', error)
      toast.error('Failed to save analysis. Please try again. ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Toast Alert Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageBreadcrumb title="Analyze" desc="Connect you macine before collection" />
      </div>

      <div className="mt-2 p-3 sm:p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
        <CustomForm className="w-full">
          <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-2.5">
            {/* Date */}
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
                value={plant}
                onChange={(e: any) => setPlant(e.target.value)}
                options={plantOptions}
                readOnly={true}
              />
            </div>

            {/* Find Button (Saves Analysis) */}
            <div className="flex items-end justify-end">
              <Button1
                variant="primary"
                icon={<Search className="w-3.5 h-3.5 text-white" />}
                label={loading ? 'Saving...' : 'Find'}
                onClick={handleSaveAnalysis}
                disabled={loading}
              />
            </div>
          </div>
        </CustomForm>
      </div>

      <div className="mt-2 p-3 sm:p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-2 whitespace-nowrap">Sample No</th>
                <th className="py-3 px-2 whitespace-nowrap">Port</th>
                <th className="py-3 px-2 whitespace-nowrap">Net Weight</th>
                <th className="py-3 px-2 whitespace-nowrap">FAT Percentage(%)</th>
                <th className="py-3 px-2 whitespace-nowrap">SNF Percentage(%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {reports.map((item, index) => (
                <tr key={item.id ?? index} className="hover:bg-slate-50/70 transition">
                  <td className="py-2 px-4 font-bold text-slate-900">{item.sampleNo}</td>
                  {/* <td className="py-2 px-4 font-semibold text-slate-800">{item.port}</td> */}
                  <td className="py-2 px-4 font-semibold text-primary max-w-[150px] truncate">
                    {item.netWeight}
                  </td>
                  <td className="py-2 px-4 font-semibold text-primary">{item.fatPercentage}</td>
                  <td className="py-2 px-4 font-semibold text-primary">{item.snfPercentage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Analyze
