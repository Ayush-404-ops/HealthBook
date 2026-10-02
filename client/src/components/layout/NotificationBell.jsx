import React, { useState } from 'react';
import { Bell, CheckCircle, Calendar, CreditCard, XCircle } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

export const NotificationBell = ({ notifications = [] }) => {
  const [read, setRead] = useState(false);

  const defaultNotifications = [
    {
      id: 1,
      title: 'Appointment Confirmed',
      desc: 'Your consultation with Dr. Sharma is scheduled.',
      time: '10m ago',
      type: 'confirmed',
    },
    {
      id: 2,
      title: 'Payment Received',
      desc: 'Razorpay payment ₹500 verified successfully.',
      time: '1h ago',
      type: 'payment',
    },
    {
      id: 3,
      title: 'Health Tip',
      desc: 'Remember to stay hydrated and complete your profile.',
      time: '1d ago',
      type: 'info',
    },
  ];

  const items = notifications.length > 0 ? notifications : defaultNotifications;

  const getIcon = (type) => {
    switch (type) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'payment':
        return <CreditCard className="w-4 h-4 text-teal-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-rose-500" />;
      default:
        return <Calendar className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <DropdownMenu.Root onOpenChange={(open) => open && setRead(true)}>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {!read && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          )}
          {!read && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 w-80 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl animate-in fade-in-0 zoom-in-95"
        >
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Notifications
            </span>
            <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded-full">
              {items.length} New
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-64 overflow-y-auto">
            {items.map((item) => (
              <div key={item.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {item.title}
                      </p>
                      <span className="text-[10px] text-slate-400 ml-1 shrink-0">{item.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
