import React from 'react';
import * as RadixTooltip from '@radix-ui/react-tooltip';

export const TooltipProvider = ({ children }) => (
  <RadixTooltip.Provider delayDuration={200}>{children}</RadixTooltip.Provider>
);

export const Tooltip = ({ children, content, side = 'top', align = 'center' }) => {
  if (!content) return children;

  return (
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side={side}
          align={align}
          className="z-50 px-3 py-1.5 text-xs font-medium text-slate-100 bg-slate-900 dark:bg-slate-800 border border-slate-800 dark:border-slate-700 rounded-lg shadow-lg animate-in fade-in-0 zoom-in-95"
          sideOffset={5}
        >
          {content}
          <RadixTooltip.Arrow className="fill-slate-900 dark:fill-slate-800" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
};
