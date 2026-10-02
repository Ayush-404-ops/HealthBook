import React from 'react';
import * as RadixAvatar from '@radix-ui/react-avatar';

export const Avatar = ({ src, alt = 'Avatar', fallback, size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
  };

  const getInitials = (name) => {
    if (!name) return 'HB';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <RadixAvatar.Root
      className={`inline-flex items-center justify-center rounded-full overflow-hidden select-none shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 ${
        sizes[size] || sizes.md
      } ${className}`}
    >
      <RadixAvatar.Image
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
      />
      <RadixAvatar.Fallback
        className="w-full h-full flex items-center justify-center font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40"
      >
        {getInitials(fallback || alt)}
      </RadixAvatar.Fallback>
    </RadixAvatar.Root>
  );
};
