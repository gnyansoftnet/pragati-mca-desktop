import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Calendar,
  CheckCircle2,
  Download,
  Upload,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface FarmerRecord {
  id: string;
  name: string;
  initials: string;
  avatarBg: string;
  cattleCount: number;
  gender: string;
  mobile: string;
  routeCode: string;
  lastVisit: string;
  totalTests: number;
  status: 'Active' | 'Inactive';
}

const SAMPLE_FARMERS: FarmerRecord[] = [
  {
    id: 'FAR-1043',
    name: 'Biren Dhal',
    initials: 'BD',
    avatarBg: 'bg-gradient-to-br from-primary to-secondary',
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
];

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [filterQuery, setFilterQuery] = useState('');
  const [farmers] = useState<FarmerRecord[]>(SAMPLE_FARMERS);

  const filteredFarmers = farmers.filter(
    (f) =>
      f.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      f.id.toLowerCase().includes(filterQuery.toLowerCase()) ||
      f.mobile.includes(filterQuery)
  );

  return (
    <div className="space-y-6">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {user?.role === 'farmer' ? 'My Milk Passbook' : 'Farmers & Members'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {user?.role === 'farmer'
              ? 'View your personal daily milk pouring logs, fat percentage, and payment details.'
              : 'Manage farmer records, cattle registration, route allocations and milk history.'}
          </p>
        </div>

        {/* Action Buttons matching Reference Image 2 */}
        {user?.role !== 'farmer' && (
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-700 shadow-xs transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-700 shadow-xs transition cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Import</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-primary to-secondary hover:opacity-95 text-white rounded-xl text-xs font-semibold shadow-xs shadow-primary/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ Add Farmer</span>
            </button>
          </div>
        )}
      </div>

      {/* 4 Stat Metric Cards matching Reference Image 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Farmers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {user?.role === 'farmer' ? 'TOTAL POURS' : 'TOTAL FARMERS'}
            </p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">13</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center shadow-md shadow-primary/25">
            <Users className="w-6 h-6 stroke-[2]" />
          </div>
        </div>

        {/* Card 2: New Farmers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {user?.role === 'farmer' ? 'THIS MONTH' : 'NEW FARMERS'}
            </p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">0</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <UserPlus className="w-6 h-6 stroke-[2]" />
          </div>
        </div>

        {/* Card 3: Today's Farmers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {user?.role === 'farmer' ? "TODAY'S MILK" : "TODAY'S POURING"}
            </p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">
              {user?.role === 'farmer' ? '18.5 L' : '0'}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
            <Calendar className="w-6 h-6 stroke-[2]" />
          </div>
        </div>

        {/* Card 4: Active Farmers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {user?.role === 'farmer' ? 'AVG FAT %' : 'ACTIVE FARMERS'}
            </p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">
              {user?.role === 'farmer' ? '4.2 %' : '11'}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <CheckCircle2 className="w-6 h-6 stroke-[2]" />
          </div>
        </div>
      </div>

      {/* Main Data Table Card matching Reference Image 2 */}
      <div className="bg-white rounded-2xl border border-slate-100/90 shadow-xs overflow-hidden">
        {/* Table Filter Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search by name, ID, mobile..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-primary outline-none transition"
            />
          </div>

          <div className="text-xs font-medium text-slate-400">
            Showing {filteredFarmers.length} of {farmers.length} farmers
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Farmer ID</th>
                <th className="py-3.5 px-4">Farmer Name</th>
                <th className="py-3.5 px-4">Cattle</th>
                <th className="py-3.5 px-4">Gender</th>
                <th className="py-3.5 px-4">Mobile</th>
                <th className="py-3.5 px-4">Route</th>
                <th className="py-3.5 px-4">Last Visit</th>
                <th className="py-3.5 px-4">Total Tests</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredFarmers.map((farmer) => (
                <tr
                  key={farmer.id}
                  className="hover:bg-slate-50/70 transition-colors duration-150"
                >
                  {/* Farmer ID */}
                  <td className="py-3.5 px-4 font-semibold text-primary">
                    {farmer.id}
                  </td>

                  {/* Farmer Name with Avatar Initials */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-full ${farmer.avatarBg} text-white flex items-center justify-center font-bold text-[10px] shadow-2xs`}
                      >
                        {farmer.initials}
                      </div>
                      <span className="font-semibold text-slate-800">
                        {farmer.name}
                      </span>
                    </div>
                  </td>

                  {/* Cattle Count */}
                  <td className="py-3.5 px-4 text-slate-600">
                    {farmer.cattleCount}
                  </td>

                  {/* Gender */}
                  <td className="py-3.5 px-4 text-slate-600">
                    {farmer.gender}
                  </td>

                  {/* Mobile */}
                  <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                    {farmer.mobile}
                  </td>

                  {/* Route Badge */}
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 font-semibold text-[10px] border border-rose-100">
                      {farmer.routeCode}
                    </span>
                  </td>

                  {/* Last Visit */}
                  <td className="py-3.5 px-4 text-slate-600">
                    {farmer.lastVisit}
                  </td>

                  {/* Total Tests */}
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {farmer.totalTests}
                  </td>

                  {/* Status Pill */}
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200/80">
                      {farmer.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-center gap-2 text-slate-400">
                      <button
                        type="button"
                        className="p-1 hover:text-primary transition cursor-pointer"
                        title="View details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        className="p-1 hover:text-blue-600 transition cursor-pointer"
                        title="Edit farmer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        className="p-1 hover:text-rose-600 transition cursor-pointer"
                        title="Delete farmer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
