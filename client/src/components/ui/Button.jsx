import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = React.forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      className = '',
      icon: Icon,
      type = 'button',
      onClick,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

    const variants = {
      primary:
        'bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-500/25 focus:ring-teal-500',
      secondary:
        'bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-500/25 focus:ring-teal-500',
      outline:
        'border border-slate-300 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-teal-950/30 text-slate-700 dark:text-slate-200 focus:ring-teal-400',
      ghost:
        'hover:bg-teal-50/60 dark:hover:bg-teal-950/30 hover:text-teal-700 dark:hover:text-teal-300 text-slate-700 dark:text-slate-300 focus:ring-teal-400',
      danger:
        'bg-rose-600 hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600 text-white shadow-md shadow-rose-500/20 focus:ring-rose-500',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-6 py-3 text-base gap-2.5 rounded-2xl',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        onClick={onClick}
        className={`${baseStyles} ${variants[variant] || variants.primary} ${
          sizes[size] || sizes.md
        } ${className}`}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : Icon ? (
          <Icon className="w-4 h-4 shrink-0" />
        ) : null}
        <span>{children}</span>
      </button>
    );
  }
);

Button.displayName = 'Button';
