import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, KeyRound, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export const TopbarUserProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    setIsOpen(false);
    logout();
    navigate('/');
  };

  return (
    <div className="relative select-none" ref={dropdownRef}>
      {/* Profile Trigger Pill */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-2xl hover:bg-slate-100/80 border border-transparent hover:border-slate-200/60 transition cursor-pointer group"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center font-bold text-xs shadow-xs group-hover:scale-105 transition-transform">
          {user?.avatar || 'DH'}
        </div>
        <div className="hidden md:block text-left">
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs font-bold text-slate-800 leading-tight">
              {user?.name || 'Dhruv Halbe'}
            </h4>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : 'rotate-0'
              }`}
            />
          </div>
          <p className="text-[10px] text-slate-400 font-medium">
            {user?.roleLabel || 'Super Admin'}
          </p>
        </div>
      </button>

      {/* Profile Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-900">{user?.name || 'Dhruv Halbe'}</p>
            <p className="text-[11px] text-slate-400 truncate">{user?.email || 'admin@pragatimilk.com'}</p>
            <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 text-primary border border-teal-100">
              {user?.roleLabel || 'Super Admin'}
            </span>
          </div>

          {/* Menu Options */}
          <div className="py-1">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                alert('Change Profile modal will connect with user master table.');
              }}
              className="w-full px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition cursor-pointer"
            >
              <User className="w-4 h-4 text-slate-400" />
              <span>Change Profile</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                alert('Change Password modal will connect with user auth API.');
              }}
              className="w-full px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-slate-400" />
              <span>Change Password</span>
            </button>
          </div>

          {/* Divider & Sign Out */}
          <div className="border-t border-slate-100 pt-1">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition cursor-pointer font-medium"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopbarUserProfile;
