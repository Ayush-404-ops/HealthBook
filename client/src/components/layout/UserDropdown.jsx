import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Avatar } from '../ui/Avatar';
import { LogOut, User, Settings, Shield, Activity, ChevronDown } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

export const UserDropdown = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleIcon = () => {
    if (user?.role === 'doctor') return <Activity className="w-3.5 h-3.5 text-blue-500" />;
    if (user?.role === 'admin') return <Shield className="w-3.5 h-3.5 text-purple-500" />;
    return <User className="w-3.5 h-3.5 text-teal-500" />;
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
        >
          <Avatar size="sm" fallback={user?.name || user?.email || 'User'} />
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[100px] truncate leading-tight">
              {user?.name || 'User'}
            </span>
            <span className="text-[10px] text-slate-400 capitalize flex items-center gap-1 -mt-0.5">
              {getRoleIcon()}
              {user?.role || 'patient'}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 w-56 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl animate-in fade-in-0 zoom-in-95"
        >
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{user?.name}</p>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">{user?.email}</p>
          </div>

          <DropdownMenu.Item asChild>
            <Link
              to={user?.role === 'doctor' ? '/doctor' : user?.role === 'admin' ? '/admin' : '/patient'}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer outline-none"
            >
              <User className="w-4 h-4" />
              <span>Dashboard Overview</span>
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Item
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer outline-none mt-1"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
