import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  Home,
  User,
  Activity,
  Shield,
  MapPin,
  LogOut,
  LogIn,
  UserPlus,
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const items = [
    { id: 'home', label: 'Home / Landing', icon: Home, action: () => navigate('/') },
    { id: 'hospitals', label: 'Emergency Nearby Hospitals', icon: MapPin, action: () => navigate('/nearby-hospitals') },
  ];

  if (isAuthenticated) {
    if (user?.role === 'patient') {
      items.push({ id: 'patient', label: 'Patient Dashboard', icon: User, action: () => navigate('/patient') });
    } else if (user?.role === 'doctor') {
      items.push({ id: 'doctor', label: 'Doctor Dashboard', icon: Activity, action: () => navigate('/doctor') });
    } else if (user?.role === 'admin') {
      items.push({ id: 'admin', label: 'Admin Dashboard', icon: Shield, action: () => navigate('/admin') });
    }
    items.push({
      id: 'logout',
      label: 'Logout',
      icon: LogOut,
      action: async () => {
        await logout();
        navigate('/login');
      },
    });
  } else {
    items.push({ id: 'login', label: 'Sign In', icon: LogIn, action: () => navigate('/login') });
    items.push({ id: 'register', label: 'Create Account', icon: UserPlus, action: () => navigate('/register') });
  }

  const filtered = items.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (item) => {
    setOpen(false);
    setQuery('');
    item.action();
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal forceMount>
        {open && (
          <>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm" />
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
              <Dialog.Content className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden focus:outline-none animate-in fade-in-0 zoom-in-95">
                <div className="flex items-center px-4 border-b border-slate-100 dark:border-slate-800">
                  <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Type a command or search... (Esc to exit)"
                    className="w-full py-4 text-sm bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
                    autoFocus
                  />
                  <kbd className="px-2 py-1 text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md">
                    ESC
                  </kbd>
                </div>

                <div className="max-h-72 overflow-y-auto p-2">
                  {filtered.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No results matching &quot;{query}&quot;
                    </div>
                  ) : (
                    filtered.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelect(item)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:text-teal-600 dark:hover:text-teal-400 transition-colors text-left"
                        >
                          <Icon className="w-4 h-4 text-slate-400" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </Dialog.Content>
            </div>
          </>
        )}
      </Dialog.Portal>
    </Dialog.Root>
  );
};
