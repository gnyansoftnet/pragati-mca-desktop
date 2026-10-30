import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

interface SidebarSignOutProps {
  isCollapsed: boolean;
}

export const SidebarSignOut: React.FC<SidebarSignOutProps> = ({ isCollapsed }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="p-3 border-t border-slate-100 shrink-0">
      <button
        type="button"
        onClick={handleSignOut}
        title={isCollapsed ? 'Sign out' : undefined}
        className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all duration-200 cursor-pointer ${
          isCollapsed ? 'justify-center' : ''
        }`}
      >
        <LogOut className="w-5 h-5 shrink-0 stroke-[2]" />
        {!isCollapsed && <span className="truncate font-medium">Sign out</span>}
      </button>
    </div>
  );
};

export default SidebarSignOut;
