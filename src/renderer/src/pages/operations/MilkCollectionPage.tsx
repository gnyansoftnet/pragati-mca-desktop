import React, { useState } from 'react';
import { Milk, Plus, CheckCircle, Calendar, Download } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface MilkEntry {
  id: string;
  farmerId: string;
  farmerName: string;
  shift: 'Morning' | 'Evening';
  milkType: 'Cow' | 'Buffalo';
  quantityLtr: number;
  fatPercent: number;
  snfPercent: number;
  ratePerLtr: number;
  totalAmount: number;
  timestamp: string;
}

const SAMPLE_ENTRIES: MilkEntry[] = [
  {
    id: 'ENT-201',
    farmerId: 'FAR-1043',
    farmerName: 'Biren Dhal',
    shift: 'Morning',
    milkType: 'Cow',
    quantityLtr: 12.5,
    fatPercent: 4.2,
    snfPercent: 8.6,
    ratePerLtr: 38.5,
    totalAmount: 481.25,
    timestamp: '07:45 AM'
  },
  {
    id: 'ENT-202',
    farmerId: 'FAR-1042',
    farmerName: 'Aarav Sharma',
    shift: 'Morning',
    milkType: 'Buffalo',
    quantityLtr: 18.0,
    fatPercent: 6.8,
    snfPercent: 9.1,
    ratePerLtr: 54.0,
    totalAmount: 972.0,
    timestamp: '07:52 AM'
  },
  {
    id: 'ENT-203',
    farmerId: 'FAR-1041',
    farmerName: 'Priya Patel',
    shift: 'Morning',
    milkType: 'Cow',
    quantityLtr: 9.0,
    fatPercent: 4.0,
    snfPercent: 8.5,
    ratePerLtr: 37.0,
    totalAmount: 333.0,
    timestamp: '08:10 AM'
  }
];

export const MilkCollectionPage: React.FC = () => {
  const { user } = useAuth();
  const [entries] = useState<MilkEntry[]>(SAMPLE_ENTRIES);
  const [shift, setShift] = useState<'Morning' | 'Evening'>('Morning');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Daily Milk Collection
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time dairy procurement, automatic fat/SNF rate calculation, and weighing scale recording.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Shift Switcher */}
          <div className="p-1 bg-white border border-slate-200/90 rounded-xl flex items-center text-xs font-semibold">
            <button
              type="button"
              onClick={() => setShift('Morning')}
              className={`px-3 py-1.5 rounded-lg transition ${
                shift === 'Morning'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ☀️ Morning
            </button>
            <button
              type="button"
              onClick={() => setShift('Evening')}
              className={`px-3 py-1.5 rounded-lg transition ${
                shift === 'Evening'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🌙 Evening
            </button>
          </div>

          {user?.role !== 'farmer' && (
            <button
              type="button"
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-primary to-secondary hover:opacity-95 text-white rounded-xl text-xs font-semibold shadow-xs shadow-primary/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ Record Milk Entry</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Shift Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              TOTAL COLLECTED
            </p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">39.5 Liters</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-500 text-white flex items-center justify-center shadow-md shadow-teal-500/20">
            <Milk className="w-6 h-6 stroke-[2]" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              AVG FAT & SNF
            </p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">5.0% / 8.7</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <CheckCircle className="w-6 h-6 stroke-[2]" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              TOTAL SHIFT PAYABLE
            </p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">₹ 1,786.25</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Calendar className="w-6 h-6 stroke-[2]" />
          </div>
        </div>
      </div>

      {/* Collection Data Table */}
      <div className="bg-white rounded-2xl border border-slate-100/90 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">
            Recent {shift} Pouring Logs
          </h3>
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-lg text-xs font-medium text-slate-600 transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Entry ID</th>
                <th className="py-3.5 px-4">Farmer</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Qty (Ltr)</th>
                <th className="py-3.5 px-4">Fat %</th>
                <th className="py-3.5 px-4">SNF %</th>
                <th className="py-3.5 px-4">Rate (₹/L)</th>
                <th className="py-3.5 px-4">Total (₹)</th>
                <th className="py-3.5 px-4">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {entries.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-4 font-semibold text-primary">{item.id}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {item.farmerName} ({item.farmerId})
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        item.milkType === 'Cow'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}
                    >
                      {item.milkType}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{item.quantityLtr.toFixed(1)}</td>
                  <td className="py-3.5 px-4 text-slate-700">{item.fatPercent.toFixed(1)}%</td>
                  <td className="py-3.5 px-4 text-slate-700">{item.snfPercent.toFixed(1)}%</td>
                  <td className="py-3.5 px-4 text-slate-700">₹{item.ratePerLtr.toFixed(2)}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-600">₹{item.totalAmount.toFixed(2)}</td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">{item.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
