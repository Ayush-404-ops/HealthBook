import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

export const ThemeToggle = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all focus:outline-none"
          aria-label="Select theme"
        >
          {resolvedTheme === 'dark' ? (
            <Moon className="w-4 h-4 text-teal-400 transition-transform duration-300 rotate-0 dark:rotate-360" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500 transition-transform duration-300 rotate-0" />
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-[130px] p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl animate-in fade-in-0 zoom-in-95"
        >
          <DropdownMenu.Item
            onClick={() => setTheme('light')}
            className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg cursor-pointer outline-none transition-colors ${
              theme === 'light'
                ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Light</span>
          </DropdownMenu.Item>

          <DropdownMenu.Item
            onClick={() => setTheme('dark')}
            className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg cursor-pointer outline-none transition-colors ${
              theme === 'dark'
                ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Dark</span>
          </DropdownMenu.Item>

          <DropdownMenu.Item
            onClick={() => setTheme('system')}
            className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg cursor-pointer outline-none transition-colors ${
              theme === 'system'
                ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>System</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
