import React, { useState } from 'react'
import { Search } from 'lucide-react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import PageBreadcrumb from '@renderer/components/breadcrumbs/PageBreadcrumb'
import CustomForm from '@renderer/components/customform/CustomForm'

export const Rejection: React.FC = () => {
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
        <PageBreadcrumb title="Rejection" desc="Connect you macine before collection" />
      </div>

      <div className="mt-2 p-3 sm:p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
        <CustomForm className="w-full">
          <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-2.5">
            {/* Date */}

            {/* Shift */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Select Shift</label>
              <CustomForm.CustomSelectSearchField
                name="shift"
                // value={shift}
                // onChange={(e: any) => setShift(e.target.value)}
                // options={shifts}
              />
            </div>

            {/* Chilling Center */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Chilling Center</label>
              <CustomForm.CustomSelectField
                name="chilling"
                // value={plant}
                // onChange={(e: any) => setPlant(e.target.value)}
                // options={plantOptions}
                // readOnly={true}
              />
            </div>

            {/* Find Button (Saves Analysis) */}
            <div className="flex items-end justify-end">
              {/* <Button1
                variant="primary"
                icon={<Search className="w-3.5 h-3.5 text-white" />}
                label={loading ? 'Saving...' : 'Find'}
                onClick={handleSaveAnalysis}
                disabled={loading}
              /> */}
            </div>
          </div>
        </CustomForm>
      </div>
    </div>
  )
}

export default Rejection
