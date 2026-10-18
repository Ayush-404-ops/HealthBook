import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, CheckCircle, Calendar, CreditCard, XCircle, RefreshCw } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import api from '../../api/axios';

const POLL_INTERVAL_MS = 30_000; // 30 s

const getIcon = (type) => {
  switch (type) {
    case 'confirmed':
    case 'appointment_confirmed':
      return <CheckCircle className="w-4 h-4 text-teal-500" />;
    case 'payment':
    case 'payment_received':
      return <CreditCard className="w-4 h-4 text-sky-500" />;
    case 'cancelled':
    case 'appointment_cancelled':
      return <XCircle className="w-4 h-4 text-rose-500" />;
    case 'rescheduled':
    case 'appointment_rescheduled':
      return <RefreshCw className="w-4 h-4 text-amber-500" />;
    default:
      return <Calendar className="w-4 h-4 text-sky-500" />;
  }
};

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const pollRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications/mine');
      if (res.data?.success) {
        const payload = res.data.data;
        const items = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.notifications)
            ? payload.notifications
            : [];
        const count = typeof payload?.unreadCount === 'number'
          ? payload.unreadCount
          : items.filter((n) => !n.read).length;
        setNotifications(items);
        setUnreadCount(count);
      }
    } catch {
      // silently fail – notifications are non-critical
    }
  }, []);

  // Poll every 30 s
  useEffect(() => {
    fetchNotifications();
    pollRef.current = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
  }, [fetchNotifications]);

  // When dropdown opens, mark all as read
  const handleOpenChange = async (isOpen) => {
    setOpen(isOpen);
    if (isOpen && unreadCount > 0) {
      try {
        await api.patch('/notifications/read-all');
        setUnreadCount(0);
        setNotifications((prev) => (Array.isArray(prev) ? prev.map((n) => ({ ...n, read: true })) : []));
      } catch {
        // ignore
      }
    }
  };

  const notifList = Array.isArray(notifications) ? notifications : [];

  return (
    <DropdownMenu.Root onOpenChange={handleOpenChange} open={open}>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] text-[10px] font-bold rounded-full bg-rose-500 text-white flex items-center justify-center px-0.5">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 w-80 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg"
        >
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Notifications
            </span>
            {notifList.length > 0 && (
              <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 rounded-full">
                {notifList.length} total
              </span>
            )}
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
            {notifList.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-slate-400">
                No notifications yet
              </div>
            ) : (
              notifList.slice(0, 20).map((item) => (
                <div
                  key={item._id}
                  className={`p-3 rounded-xl transition-colors ${
                    !item.read
                      ? 'bg-sky-50/60 dark:bg-sky-950/20'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                      {getIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {item.title || 'Notification'}
                        </p>
                        <span className="text-[10px] text-slate-400 ml-1 shrink-0">
                          {formatTime(item.createdAt)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                        {item.message || item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
