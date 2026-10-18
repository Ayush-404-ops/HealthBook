import React from 'react';

export const Card = ({ children, className = '', hover = false, glass = false, ...props }) => {
  const hoverStyles = hover ? 'transition-all duration-200 hover:shadow-md hover:-translate-y-0.5' : '';
  const bgStyles = glass ? 'backdrop-blur-md bg-white/80 dark:bg-slate-900/80' : 'bg-white dark:bg-slate-900';
  return (
    <div
      className={`rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm ${bgStyles} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`p-6 pb-4 border-b border-slate-100 dark:border-slate-800/60 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight ${className}`}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className = '' }) => (
  <p className={`text-xs text-slate-500 dark:text-slate-400 mt-1 ${className}`}>{children}</p>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`p-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between ${className}`}>
    {children}
  </div>
);
