import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Button } from '../ui/Button';
import {
  HeartPulse,
  Menu,
  X,
  MapPin,
  User,
  Activity,
  Shield,
  LogOut,
  Search,
} from 'lucide-react';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'patient') return '/patient';
    if (user.role === 'doctor') return '/doctor';
    if (user.role === 'admin') return '/admin';
    return '/';
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center text-white">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Health<span className="text-teal-600 dark:text-teal-400">Book</span>
            </span>
            <span className="text-[10px] font-medium tracking-wider text-slate-400 uppercase -mt-0.5">
              Care Platform
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/nearby-hospitals"
            className={`text-xs font-semibold flex items-center gap-1.5 ${
              location.pathname === '/nearby-hospitals'
                ? 'text-teal-600 dark:text-teal-400 font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <MapPin className="w-4 h-4 text-rose-500" />
            <span>Emergency Hospitals</span>
          </Link>

          {isAuthenticated ? (
            <Link
              to={getDashboardPath()}
              className={`text-xs font-semibold flex items-center gap-1.5 ${
                location.pathname.startsWith('/patient') ||
                location.pathname.startsWith('/doctor') ||
                location.pathname.startsWith('/admin')
                  ? 'text-teal-600 dark:text-teal-400 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {user?.role === 'doctor' ? (
                <Activity className="w-4 h-4 text-teal-500" />
              ) : user?.role === 'admin' ? (
                <Shield className="w-4 h-4 text-purple-500" />
              ) : (
                <User className="w-4 h-4 text-teal-500" />
              )}
              <span>Dashboard ({user?.name || user?.role})</span>
            </Link>
          ) : null}
        </nav>

        {/* Actions & Controls */}
        <div className="hidden md:flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
              window.dispatchEvent(event);
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:text-slate-600 dark:hover:text-slate-200"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search...</span>
            <kbd className="px-1.5 py-0.5 text-[10px] bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 font-mono">
              Ctrl+K
            </kbd>
          </button>

          <ThemeToggle />

          {isAuthenticated ? (
            <Button variant="ghost" size="sm" onClick={handleLogout} icon={LogOut}>
              Logout
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen((o) => !o)}
            className="p-2 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-6 space-y-4">
          <Link
            to="/nearby-hospitals"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
          >
            <MapPin className="w-5 h-5" />
            <span>Emergency Hospitals</span>
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to={getDashboardPath()}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <User className="w-5 h-5 text-teal-500" />
                <span>Dashboard</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 text-left"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" className="w-full">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
