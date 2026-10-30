import React from 'react';
import { Menu, ChevronLeft, ChevronRight } from 'lucide-react';

interface TopbarToggleProps {
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onOpenMobileSidebar: () => void;
}

export const TopbarToggle: React.FC<TopbarToggleProps> = ({
  isSidebarCollapsed,
  onToggleSidebar,
  onOpenMobileSidebar
}) => {
  return (
    <div className="flex items-center gap-2">
      {/* Mobile Hamburger Button */}
      <button
        type="button"
        onClick={onOpenMobileSidebar}
        className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
        aria-label="Open mobile menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Desktop Collapse Toggle */}
      <button
        type="button"
        onClick={onToggleSidebar}
        className="hidden lg:flex p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
        aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isSidebarCollapsed ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <ChevronLeft className="w-5 h-5" />
        )}
      </button>
    </div>
  );
};

export default TopbarToggle;
