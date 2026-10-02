import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../ui/ThemeToggle';
import { NotificationBell } from './NotificationBell';
import { UserDropdown } from './UserDropdown';
import {
  HeartPulse,
  LayoutDashboard,
  Calendar,
  Stethoscope,
  MapPin,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Search,
  AlertCircle,
  Home,
  Bot,
  UserCheck,
  Clock,
  LogOut,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const DashboardLayout = ({ children, title = 'Dashboard', subtitle }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const getMenuItems = () => {
    if (user?.role === 'doctor') {
      return [
        { label: 'Overview', icon: LayoutDashboard, path: '/doctor' },
        { label: 'Appointments Queue', icon: Calendar, path: '/doctor#queue' },
        { label: 'Profile Editor', icon: Stethoscope, path: '/doctor#profile' },
        { label: 'Availability Grid', icon: Clock, path: '/doctor#availability' },
        { label: 'Nearby Hospitals', icon: MapPin, path: '/nearby-hospitals' },
      ];
    }

    if (user?.role === 'admin') {
      return [
        { label: 'Analytics & Overview', icon: LayoutDashboard, path: '/admin' },
        { label: 'Doctor Approvals', icon: UserCheck, path: '/admin#approvals' },
        { label: 'Nearby Hospitals', icon: MapPin, path: '/nearby-hospitals' },
      ];
    }

    // Default Patient
    return [
      { label: 'My Appointments', icon: Calendar, path: '/patient' },
      { label: 'AI Symptom Navigator', icon: Bot, path: '/patient#ai-navigator' },
      { label: 'Find Doctors', icon: Stethoscope, path: '/patient#find-doctors' },
      { label: 'Nearby Hospitals', icon: MapPin, path: '/nearby-hospitals' },
    ];
  };

  const menuItems = getMenuItems();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row font-sans transition-colors duration-250">
      {/* Sidebar - Desktop */}
      <aside
        className={`hidden md:flex flex-col border-r border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl transition-all duration-300 z-30 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
          <Link to="/" className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-teal-500/20">
              <HeartPulse className="w-5 h-5 animate-pulse" />
            </div>
            {!collapsed && (
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-slate-100 truncate">
                Health<span className="text-teal-600 dark:text-teal-400">Book</span>
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Menu Links */}
        <div className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname + location.hash === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-teal-500 text-white shadow-md shadow-teal-500/25 dark:bg-teal-500'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-teal-500'}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/80">
          <button
            type="button"
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors ${
              collapsed ? 'justify-center' : ''
            }`}
            title="Logout"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 px-4 sm:px-6 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl flex items-center justify-between sticky top-0 z-20">
          {/* Mobile Drawer Trigger & Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden p-2 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumbs */}
            <nav className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <Link to="/" className="hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1">
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </Link>
              <span>/</span>
              <span className="capitalize text-teal-600 dark:text-teal-400 font-semibold">
                {user?.role || 'Dashboard'}
              </span>
              {title && (
                <>
                  <span>/</span>
                  <span className="text-slate-700 dark:text-slate-300 font-bold">{title}</span>
                </>
              )}
            </nav>
          </div>

          {/* Top Controls */}
          <div className="flex items-center gap-3">
            {/* Quick Search Ctrl+K Button */}
            <button
              type="button"
              onClick={() => {
                const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
                window.dispatchEvent(event);
              }}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search...</span>
              <kbd className="px-1.5 py-0.5 text-[10px] bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 font-mono">
                Ctrl+K
              </kbd>
            </button>

            <NotificationBell />
            <ThemeToggle />
            <UserDropdown />
          </div>
        </header>

        {/* Dashboard Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Header Banner */}
          {(title || subtitle) && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-800/60">
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          )}

          {children}
        </main>
      </div>

      {/* Floating SOS Emergency Button (visible on all patient dashboard pages) */}
      {(user?.role === 'patient' || !user) && (
        <Link
          to="/nearby-hospitals"
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-full shadow-2xl shadow-rose-600/40 border-2 border-white/20 transition-all hover:scale-105 active:scale-95 group animate-bounce"
          title="Emergency Nearby Hospitals"
        >
          <AlertCircle className="w-5 h-5 text-white animate-pulse" />
          <span className="hidden sm:inline">Emergency SOS</span>
        </Link>
      )}

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileDrawerOpen(false)}
              className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between md:hidden shadow-2xl"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Link to="/" className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white">
                      <HeartPulse className="w-5 h-5" />
                    </div>
                    <span className="text-lg font-black text-slate-900 dark:text-slate-100">
                      Health<span className="text-teal-500">Book</span>
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setMobileDrawerOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.label}
                        to={item.path}
                        onClick={() => setMobileDrawerOpen(false)}
                        className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Icon className="w-5 h-5 text-teal-500" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold text-rose-500 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
