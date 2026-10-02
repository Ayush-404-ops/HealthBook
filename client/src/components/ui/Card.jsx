import React from 'react';

export const Card = ({ children, className = '', hover = true, glass = false, ...props }) => {
  return (
    <div
      className={`rounded-2xl transition-all duration-200 border ${
        glass
          ? 'glass-panel'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800/80 shadow-sm'
      } ${hover ? 'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700' : ''} ${className}`}
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
