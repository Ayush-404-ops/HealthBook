import React from 'react';

export const Skeleton = ({ className = '', circle = false, ...props }) => {
  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-slate-800/80 ${
        circle ? 'rounded-full' : 'rounded-xl'
      } ${className}`}
      {...props}
    />
  );
};
