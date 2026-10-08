import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

export const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative p-2.5 rounded-xl border transition-all duration-300 focus:outline-none select-none group cursor-pointer ${
        isDark
          ? 'bg-slate-900 border-slate-700/80 text-amber-300 hover:border-amber-400/50 shadow-[0_0_15px_-3px_rgba(251,191,36,0.2)]'
          : 'bg-white border-slate-200 text-slate-700 hover:text-emerald-600 hover:border-emerald-400/50 shadow-sm'
      } ${className}`}
      title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
      aria-label="Toggle theme mode"
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Moon className="w-4 h-4 text-amber-300 fill-amber-300/30" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ rotate: 90, scale: 0.5, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: -90, scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Sun className="w-4 h-4 text-amber-500 fill-amber-500/20" />
          </motion.div>
        )}
      </div>
    </button>
  );
};

export default ThemeToggle;
