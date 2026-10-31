
import React from 'react'
import Button1 from '../../../components/buttons/Button1'
import PageBreadcrumb from '../../../components/breadcrumbs/PageBreadcrumb'
import CustomForm from '../../../components/customform/CustomForm';
import { Cable } from 'lucide-react'





export const MacineConnection: React.FC = () => {

  const centerOptions = [
    { value: 'center1', label: 'North Hub' },
    { value: 'center2', label: 'East Hub' }
  ];


  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageBreadcrumb
          title="Macine Connection"
          desc="Connect you macine before collection"
        />

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

      <div className='mt-2'>
        <CustomForm
          onSubmit={(e) => e.preventDefault()}
          className="w-full p-3 bg-white rounded-2xl border border-slate-100"
        >
          <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 mb-2">
                Select Port Name
              </label>
              <CustomForm.CustomSelectSearchField
                name="center"
                value=""
                // onChange=""
                options={centerOptions}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 mb-2">
                Parity <span className="text-rose-500">*</span>
              </label>
              <CustomForm.CustomNumberField
                name="parity"
                value="15"
                // onChange=""
                placeholder=""
                readOnly={true}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 mb-2">
                Braude Rate
              </label>
              <CustomForm.CustomNumberField
                name="braude"
                value="45"
                // onChange=""
                placeholder=""
                readOnly={true}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 mb-2">
                Data Bits
              </label>
              <CustomForm.CustomNumberField
                name="braude"
                value="10"
                // onChange=""
                placeholder=""
                readOnly={true}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 mb-2">
                Stop Bits
              </label>
              <CustomForm.CustomNumberField
                name="stop"
                value="45"
                // onChange=""
                placeholder=""
                readOnly={true}
              />
            </div>

          </div>

          <div className="flex justify-end items-center gap-2.5 mt-6">
            <div className="">
              <Button1
                variant="primary"
                icon={<Cable className="w-3.5 h-3.5 text-white" />}
                label="Connect"
              />
            </div>
          </div>
        </CustomForm>
      </div>
    </div>
  );
};

