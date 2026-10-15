import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative p-2 rounded-lg border focus:outline-none select-none cursor-pointer ${
        isDark
          ? 'bg-slate-900 border-slate-700 text-amber-300 hover:bg-slate-800'
          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-teal-600'
      } ${className}`}
      title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
      aria-label="Toggle theme mode"
    >
      <div className="w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Moon className="w-4 h-4 text-amber-300" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500" />
        )}
      </div>
    </button>
  );
};

export default ThemeToggle;
