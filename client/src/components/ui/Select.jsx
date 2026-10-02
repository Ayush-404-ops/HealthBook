import React from 'react';

export const Select = React.forwardRef(
  ({ label, error, helperText, options = [], className = '', children, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/80 border text-sm rounded-xl text-slate-900 dark:text-slate-100 transition-all duration-200 outline-none focus:ring-2 cursor-pointer ${
            error
              ? 'border-rose-500 focus:ring-rose-500/20'
              : 'border-slate-200 dark:border-slate-800 focus:border-teal-500 dark:focus:border-teal-500 focus:ring-teal-500/20'
          } ${className}`}
          {...props}
        >
          {children ||
            options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              >
                {opt.label}
              </option>
            ))}
        </select>
        {error ? (
          <span className="text-xs font-medium text-rose-500">{error}</span>
        ) : helperText ? (
          <span className="text-xs text-slate-500 dark:text-slate-400">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
