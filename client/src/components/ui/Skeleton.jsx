import React from 'react';

export const Skeleton = ({ className = '', circle = false, ...props }) => {
  return (
    <div
      className={`bg-slate-200 dark:bg-slate-800 ${
        circle ? 'rounded-full' : 'rounded-lg'
      } ${className}`}
      {...props}
    />
  );
};
