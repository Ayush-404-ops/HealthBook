import React from 'react';
import * as RadixTabs from '@radix-ui/react-tabs';
import { motion } from 'framer-motion';

export const Tabs = ({ value, onValueChange, tabs = [], children, className = '' }) => {
  return (
    <RadixTabs.Root value={value} onValueChange={onValueChange} className={`w-full ${className}`}>
      <RadixTabs.List className="inline-flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/60 mb-6">
        {tabs.map((tab) => {
          const isActive = value === tab.value;
          return (
            <RadixTabs.Trigger
              key={tab.value}
              value={tab.value}
              className={`relative px-4 py-2 text-xs font-semibold rounded-lg transition-colors select-none focus:outline-none ${
                isActive
                  ? 'text-teal-700 dark:text-teal-300'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabBadge"
                  className="absolute inset-0 bg-white dark:bg-slate-900 rounded-lg shadow-sm"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {tab.icon && <tab.icon className="w-4 h-4" />}
                {tab.label}
                {tab.badge !== undefined && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                    {tab.badge}
                  </span>
                )}
              </span>
            </RadixTabs.Trigger>
          );
        })}
      </RadixTabs.List>
      {children}
    </RadixTabs.Root>
  );
};

export const TabContent = ({ value, children }) => (
  <RadixTabs.Content value={value} className="focus:outline-none">
    {children}
  </RadixTabs.Content>
);
