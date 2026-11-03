import React, { useEffect, useState } from 'react'
import { Milk, Plus, CheckCircle, Calendar, Download, Search, X, Cable } from 'lucide-react'
import PageBreadcrumb from '@renderer/components/breadcrumbs/PageBreadcrumb'
import CustomForm from '@renderer/components/customform/CustomForm'
import Button1 from '@renderer/components/buttons/Button1'

export const PortConnection: React.FC = () => {
  const [port, setPort] = useState('1')
  const [braud, setBraud] = useState('11')
  const [parity, setParity] = useState('1')
  const [bit, setBit] = useState('12')
  const [sbit, setSbit] = useState('12')
  const [plant, setPlant] = useState('1102')

  const ports = [
    { value: '1', label: 'COM1' },
    { value: '2', label: 'COM2' },
    { value: '3', label: 'COM3' },
    { value: '4', label: 'COM4' }
  ]
  const parityOptions = [
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    { value: '3', label: '3' }
  ]
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageBreadcrumb title="Port Connection" desc="Connect you macine before collection" />

        {/* <div className="flex items-center gap-2.5">
              <Button1
                variant="outline"
                icon={<Download className="w-3.5 h-3.5 text-primary" />}
                label="Export"
              />
    
              <Button1
                variant="outline"
                icon={<Upload className="w-3.5 h-3.5 text-primary" />}
                label="Import"
              />
    
              <Button1
                variant="primary"
                icon={<Plus className="w-3.5 h-3.5 text-white" />}
                label="Add Collection"
              />
            </div> */}
      </div>

      <div className="mt-2 p-3 sm:p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
        <CustomForm
          //   onSubmit={(e) => e.preventDefault()}
          className="w-full"
        >
          <div className="grid lg:grid-cols-6 md:grid-cols-2 grid-cols-1 gap-2.5">
            {/* Port */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Port Name</label>
              <CustomForm.CustomSelectSearchField
                name="port"
                value={port}
                onChange={(e: any) => setPort(e.target.value)}
                options={ports}
                readOnly={true}
              />
            </div>
            {/* braud */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Braud Rate</label>
              <CustomForm.CustomNumberField
                name="braud"
                value={braud}
                onChange={(e: any) => setBraud(e.target.value)}
                placeholder=""
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Parity</label>
              <CustomForm.CustomSelectSearchField
                name="parity"
                value={parity}
                onChange={(e: any) => setParity(e.target.value)}
                options={parityOptions}
                readOnly={true}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Data Bits</label>
              <CustomForm.CustomNumberField
                name="bits"
                value={bit}
                onChange={(e: any) => setBit(e.target.value)}
                placeholder=""
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Stop Bits</label>
              <CustomForm.CustomNumberField
                name="sbits"
                value={sbit}
                onChange={(e: any) => setSbit(e.target.value)}
                placeholder=""
                readOnly={true}
              />
            </div>
            <div className="flex items-end justify-end">
              <Button1
                variant="primary"
                icon={<Cable className="w-3.5 h-3.5 text-white" />}
                label="Open Port"
                //   onClick={handleSaveCollection}
              />
            </div>
          </div>
        </CustomForm>
      </div>
      <div className="mt-2 p-3 sm:p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
        <CustomForm
          //   onSubmit={(e) => e.preventDefault()}
          className="w-full"
        >
          <div className="grid lg:grid-cols-6 md:grid-cols-2 grid-cols-1 gap-2.5">
            {/* Port */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Port Name</label>
              <CustomForm.CustomSelectSearchField
                name="port"
                value={port}
                onChange={(e: any) => setPort(e.target.value)}
                options={ports}
                readOnly={true}
              />
            </div>
            {/* braud */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Braud Rate</label>
              <CustomForm.CustomNumberField
                name="braud"
                value={braud}
                onChange={(e: any) => setBraud(e.target.value)}
                placeholder=""
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Parity</label>
              <CustomForm.CustomSelectSearchField
                name="parity"
                value={parity}
                onChange={(e: any) => setParity(e.target.value)}
                options={parityOptions}
                readOnly={true}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Data Bits</label>
              <CustomForm.CustomNumberField
                name="bits"
                value={bit}
                onChange={(e: any) => setBit(e.target.value)}
                placeholder=""
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Stop Bits</label>
              <CustomForm.CustomNumberField
                name="sbits"
                value={sbit}
                onChange={(e: any) => setSbit(e.target.value)}
                placeholder=""
                readOnly={true}
              />
            </div>
            <div className="flex items-end justify-end">
              <Button1
                variant="primary"
                icon={<Cable className="w-3.5 h-3.5 text-white" />}
                label="Open Port"
                //   onClick={handleSaveCollection}
              />
            </div>
          </div>
        </CustomForm>
      </div>
      <div className="mt-2 p-3 sm:p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
        <CustomForm
          //   onSubmit={(e) => e.preventDefault()}
          className="w-full"
        >
          <div className="grid lg:grid-cols-6 md:grid-cols-2 grid-cols-1 gap-2.5">
            {/* Port */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Port Name</label>
              <CustomForm.CustomSelectSearchField
                name="port"
                value={port}
                onChange={(e: any) => setPort(e.target.value)}
                options={ports}
                readOnly={true}
              />
            </div>
            {/* braud */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Braud Rate</label>
              <CustomForm.CustomNumberField
                name="braud"
                value={braud}
                onChange={(e: any) => setBraud(e.target.value)}
                placeholder=""
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Parity</label>
              <CustomForm.CustomSelectSearchField
                name="parity"
                value={parity}
                onChange={(e: any) => setParity(e.target.value)}
                options={parityOptions}
                readOnly={true}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Data Bits</label>
              <CustomForm.CustomNumberField
                name="bits"
                value={bit}
                onChange={(e: any) => setBit(e.target.value)}
                placeholder=""
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Stop Bits</label>
              <CustomForm.CustomNumberField
                name="sbits"
                value={sbit}
                onChange={(e: any) => setSbit(e.target.value)}
                placeholder=""
                readOnly={true}
              />
            </div>
            <div className="flex items-end justify-end">
              <Button1
                variant="primary"
                icon={<Cable className="w-3.5 h-3.5 text-white" />}
                label="Open Port"
                //   onClick={handleSaveCollection}
              />
            </div>
          </div>
        </CustomForm>
      </div>
      <div className="mt-2 p-3 sm:p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
        <CustomForm
          //   onSubmit={(e) => e.preventDefault()}
          className="w-full"
        >
          <div className="grid lg:grid-cols-6 md:grid-cols-2 grid-cols-1 gap-2.5">
            {/* Port */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Port Name</label>
              <CustomForm.CustomSelectSearchField
                name="port"
                value={port}
                onChange={(e: any) => setPort(e.target.value)}
                options={ports}
                readOnly={true}
              />
            </div>
            {/* braud */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Braud Rate</label>
              <CustomForm.CustomNumberField
                name="braud"
                value={braud}
                onChange={(e: any) => setBraud(e.target.value)}
                placeholder=""
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Parity</label>
              <CustomForm.CustomSelectSearchField
                name="parity"
                value={parity}
                onChange={(e: any) => setParity(e.target.value)}
                options={parityOptions}
                readOnly={true}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Data Bits</label>
              <CustomForm.CustomNumberField
                name="bits"
                value={bit}
                onChange={(e: any) => setBit(e.target.value)}
                placeholder=""
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Stop Bits</label>
              <CustomForm.CustomNumberField
                name="sbits"
                value={sbit}
                onChange={(e: any) => setSbit(e.target.value)}
                placeholder=""
                readOnly={true}
              />
            </div>
            <div className="flex items-end justify-end">
              <Button1
                variant="primary"
                icon={<Cable className="w-3.5 h-3.5 text-white" />}
                label="Open Port"
                //   onClick={handleSaveCollection}
              />
            </div>
          </div>
        </CustomForm>
      </div>
    </div>
  )
}
