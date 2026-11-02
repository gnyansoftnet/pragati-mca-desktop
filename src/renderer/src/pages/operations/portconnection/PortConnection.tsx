import React, { useEffect,  useState } from 'react'
import { Milk, Plus, CheckCircle, Calendar, Download, Search, X } from 'lucide-react'
import PageBreadcrumb from '@renderer/components/breadcrumbs/PageBreadcrumb';
import CustomForm from '@renderer/components/customform/CustomForm';
import Button1 from '@renderer/components/buttons/Button1';



export const PortConnection: React.FC = () => {
    const [shift, setShift] = useState('1');
    const [plant, setPlant] = useState('1102');
   // Current Date
    const getCurrentLocalDate = (): string => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };



     const shifts = [
      { value: '1', label: 'Morning' },
      { value: '2', label: 'Evening' }
    ];
    const plantOptions = [
      { value: '1102', label: 'Raipur' },
      { value: '1103', label: 'Jagatpur' }
    ];
  return (
    <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <PageBreadcrumb
              title="Analyze"
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
    
          <div className="mt-2 p-3 sm:p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
                <CustomForm
                //   onSubmit={(e) => e.preventDefault()}
                    className="w-full"
                >
                    <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-2.5">
                    {/* Date */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                        Date
                        </label>
                        <CustomForm.CustomTextField
                        name="date"
                        value={getCurrentLocalDate()}
                        readOnly={true}
                        />
                    </div>
                    {/* Shift */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                                Select Shift
                        </label>
                        <CustomForm.CustomSelectSearchField
                        name="shift"
                        value={shift}
                        onChange={(e: any) => setShift(e.target.value)}
                        options={shifts}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                        Chilling Center
                        </label>
                        <CustomForm.CustomSelectField
                        name="chilling"
                        value={plant}
                        onChange={(e: any) => setPlant(e.target.value)}
                        options={plantOptions}
                        readOnly={true}
                        />
                    </div>
                    <div className='flex items-end justify-end'>
                        <Button1
                        variant="primary"
                        icon={<Search className="w-3.5 h-3.5 text-white" />}
                        label="Find"
                      //   onClick={handleSaveCollection}
                      />
                    </div>
                    </div>
            </CustomForm>
          </div>
          
    </div>
    
  )
}
