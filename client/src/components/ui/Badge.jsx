import React from 'react';

export const Badge = ({ children, status, variant = 'default', className = '' }) => {
  const statusStyles = {
    pending: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400 border-amber-200 dark:border-amber-500/30',
    confirmed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30',
    completed: 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-400 border-blue-200 dark:border-blue-500/30',
    cancelled: 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-400 border-rose-200 dark:border-rose-500/30',
    paid: 'bg-teal-100 text-teal-800 dark:bg-teal-500/15 dark:text-teal-400 border-teal-200 dark:border-teal-500/30',
    unpaid: 'bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-400 border-orange-200 dark:border-orange-500/30',
    refunded: 'bg-purple-100 text-purple-800 dark:bg-purple-500/15 dark:text-purple-400 border-purple-200 dark:border-purple-500/30',
    approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30',
    rejected: 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-400 border-rose-200 dark:border-rose-500/30',
  };

  const variantStyles = {
    default: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    primary: 'bg-teal-100 text-teal-800 dark:bg-teal-500/20 dark:text-teal-300 border-teal-200 dark:border-teal-500/30',
    secondary: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border-blue-200 dark:border-blue-500/30',
  };

  const normalizedStatus = typeof status === 'string' ? status.toLowerCase() : '';
  const style = statusStyles[normalizedStatus] || variantStyles[variant] || variantStyles.default;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors ${style} ${className}`}
    >
      {children || status}
    </span>
  );
};
