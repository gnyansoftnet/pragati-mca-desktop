import React from 'react'
import { Download, Upload, Plus } from 'lucide-react'
import Button1 from '../../../components/buttons/Button1'
import PageBreadcrumb from '../../../components/breadcrumbs/PageBreadcrumb'
import CustomForm from '../../../components/customform/CustomForm';
import { Bookmark, X } from 'lucide-react'




export const ProcurementCollection: React.FC = () => {
  //current date
  const getCurrentLocalDate = (): string => {
    const today = new Date()

    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  }
  //current time
  const getCurrentLocalDateTime = (): string => {
    const now = new Date()

    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')

    return `${year}-${month}-${day} ${hours}:${minutes}`
  }


  const shifts = [
    { value: 'morning', label: 'Morning' },
    { value: 'evening', label: 'Evening' }
  ];
  const weights = [
    { value: 'w1', label: 'Weight Bowl' },
    { value: 'w2', label: 'Container' }
  ];
  const routes = [
    { value: 'r1', label: 'jajpur' },
    { value: 'r2', label: 'cuttack' }
  ];
  const cans = [
    { value: 'k1', label: 'Aluminium' },
    { value: 'k2', label: 'Iron' }
  ];
  const mtype = [
    { value: 'm1', label: 'Mixed' },
    { value: 'm2', label: 'Cow' },
    { value: 'm3', label: 'Bufalo' },
  ];
  const mstatus = [
    { value: '1grid', label: '1 Grid' },
    { value: '2grid', label: '2 Grid' },
    { value: '3grid', label: '3 Grid' },
  ];
  const vendors = [
    { value: 'v1', label: 'Rajesh' },
    { value: 'v2', label: 'Ajay' },
    { value: 'v3', label: 'Gyana' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageBreadcrumb
          title="Macine Connection"
          desc="Connect with macine before collection"
        />

      </div>

      <div className='mt-2'>
        <CustomForm
          onSubmit={(e) => e.preventDefault()}
          className="w-full p-3 bg-white rounded-2xl border border-slate-100"
        >
          <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 mb-2">
                Select Shift
              </label>
              <CustomForm.CustomSelectSearchField
                name="shift"
                value="morning"
                onChange=""
                options={shifts}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 mb-2">
                Chilling Center
              </label>
              <CustomForm.CustomSelectField
                name="chilling"
                value="Raipur"
                options={[
                  { value: 'center1', label: 'Raipur' },
                  { value: 'center2', label: 'Jagatpur' }
                ]}
                readOnly={true}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 mb-2">
                Date
              </label>
              <CustomForm.CustomTextField
                name="date"
                value={getCurrentLocalDate()}
                readOnly={true}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 mb-2">
                Weight System
              </label>
              <CustomForm.CustomSelectSearchField
                name="weight"
                value="w1"
                onChange=""
                options={weights}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 mb-2">
                Routes
              </label>
              <CustomForm.CustomSelectSearchField
                name="route"
                value=""
                onChange=""
                options={routes}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 mb-2">
                Cans Type
              </label>
              <CustomForm.CustomSelectSearchField
                name="cans"
                value=""
                onChange=""
                options={cans}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 mb-2">
                Milk Type
              </label>
              <CustomForm.CustomSelectSearchField
                name="milktype"
                value=""
                onChange=""
                options={mtype}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 mb-2">
                Milk Status
              </label>
              <CustomForm.CustomSelectSearchField
                name="milkstatus"
                value="1grid"
                onChange=""
                options={mstatus}
                readOnly={true}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 mb-2">
                Tipping Time
              </label>
              <CustomForm.CustomTextField
                name="time"
                value={getCurrentLocalDateTime()}
                readOnly={true}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 mb-2">
                Vendor Name
              </label>
              <CustomForm.CustomSelectSearchField
                name="route"
                value=""
                onChange=""
                options={vendors}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 mb-2">
                No. of Cans
              </label>
              <CustomForm.CustomNumberField
                name="no of cans"
                value=""
                placeholder="e.g.: 8"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 mb-2">
                Weight (LTR)
              </label>
              <CustomForm.CustomTextField
                name="weight"
                value="80"
                readOnly={true}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 mb-2">
                CLR Percentage(%)
              </label>
              <CustomForm.CustomTextField
                name="clr"
                value="2.4"
                readOnly={true}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 mb-2">
                FAT Percentage(%)
              </label>
              <CustomForm.CustomTextField
                name="fat"
                value="4.5"
                readOnly={true}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 mb-2">
                SNF Percentage(%)
              </label>
              <CustomForm.CustomTextField
                name="snf"
                value="78.5"
                readOnly={true}
              />
            </div>
          </div>
          <div className="flex justify-end items-center gap-2.5 mt-6">
            <Button1
              variant="outline"
              icon={<X className="w-3.5 h-3.5 text-primary" />}
              label="Cancel"
            />
            <Button1
              variant="primary"
              icon={<Bookmark className="w-3.5 h-3.5 text-white" />}
              label="Save"
            />
          </div>
          <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4">

          </div>
        </CustomForm>
      </div>
    </div>
  )
}
