import React from 'react';
import { Milk } from 'lucide-react';

interface SidebarLogoProps {
  isCollapsed: boolean;
  roleLabel?: string;
}

export const SidebarLogo: React.FC<SidebarLogoProps> = ({ isCollapsed, roleLabel }) => {
  return (
    <div className="p-5 flex items-center gap-3 border-b border-slate-50 shrink-0">
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-md shadow-primary/25 shrink-0">
        <Milk className="w-5 h-5 stroke-[2.2]" />
      </div>
      {!isCollapsed && (
        <div className="overflow-hidden">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight whitespace-nowrap">
            Pragati<span className="text-primary">Milk</span>
          </h2>
          <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase truncate">
            {roleLabel || 'Dairy Suite'}
          </p>
        </div>
      )}
    </div>
  );
};

export default SidebarLogo;
