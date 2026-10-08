import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Flame,
  Zap,
  CheckCircle2,
  Circle,
  Sparkles,
  Droplets,
  HeartPulse,
  Award,
  ChevronRight,
  ShieldCheck,
  CalendarDays
} from 'lucide-react';
import toast from 'react-hot-toast';

// 5-week activity heatmap data (HabitKit style)
const HEATMAP_DAYS = Array.from({ length: 35 }, (_, i) => {
  const intensities = [0, 1, 2, 3, 3, 2, 1, 3, 2, 3, 1, 2, 3, 0, 1, 3, 2, 3, 3, 2, 1, 3, 3, 2, 3, 1, 3, 3, 2, 3, 3, 3, 2, 3, 3];
  const date = new Date();
  date.setDate(date.getDate() - (34 - i));
  return {
    day: i + 1,
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    level: intensities[i] ?? 1,
  };
});

const BADGES = [
  { id: 'streak-7', title: '7-Day Streak', icon: Flame, color: 'text-amber-500 bg-amber-500/10 border-amber-500/30', desc: 'Maintained 7 consecutive wellness check-ins' },
  { id: 'heart-guard', title: 'Cardio Shield', icon: HeartPulse, color: 'text-rose-500 bg-rose-500/10 border-rose-500/30', desc: 'Logged consistent pulse and blood pressure' },
  { id: 'hydrated', title: 'Hydro Pioneer', icon: Droplets, color: 'text-blue-500 bg-blue-500/10 border-blue-500/30', desc: 'Hit 2.5L daily hydration target 5 days straight' },
  { id: 'doc-care', title: 'Consult Ready', icon: ShieldCheck, color: 'text-teal-500 bg-teal-500/10 border-teal-500/30', desc: '100% on-time consultation record' },
];

export const HealthHabitHUD = ({ compact = false, showBadges = true }) => {
  const [xp, setXp] = useState(1420);
  const [streak, setStreak] = useState(12);
  const [quests, setQuests] = useState([
    { id: 'q1', text: 'Log morning vitals & resting pulse', xpReward: 50, done: true },
    { id: 'q2', text: 'Drink 2,000ml water today', xpReward: 40, done: false },
    { id: 'q3', text: 'Complete verified doctor checkup', xpReward: 150, done: true },
    { id: 'q4', text: 'Review prescription & dosages', xpReward: 30, done: false },
  ]);
  const [treeStage, setTreeStage] = useState(3); // 1 = sprout, 2 = sapling, 3 = blooming bonsai

  const nextLevelXp = 2000;
  const currentLevel = Math.floor(xp / 500) + 1;
  const progressPercent = Math.min(100, Math.round(((xp % 500) / 500) * 100));

  const toggleQuest = (id) => {
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === id) {
          const newDone = !q.done;
          if (newDone) {
            setXp((x) => x + q.xpReward);
            toast.success(`+${q.xpReward} XP Earned! Great healthy habit!`, {
              icon: '✨',
              style: { borderRadius: '12px', background: '#0f172a', color: '#38bdf8' },
            });
          } else {
            setXp((x) => Math.max(0, x - q.xpReward));
          }
          return { ...q, done: newDone };
        }
        return q;
      })
    );
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl p-5 shadow-xl transition-all">
      {/* Top Banner / Level HUD */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 via-emerald-400 to-cyan-500 p-0.5 shadow-lg shadow-teal-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-teal-400 font-black text-lg">
                Lvl {currentLevel}
              </div>
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest font-extrabold text-teal-600 dark:text-teal-400">
                Health Level Status
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                Vitality Sentinel
              </span>
            </div>
            <div className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>{xp} XP</span>
              <span className="text-xs font-normal text-slate-400">/ {nextLevelXp} to Next Rank</span>
            </div>
          </div>
        </div>

        {/* Streak HUD Counter */}
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center gap-1.5 text-amber-500">
            <Flame className="w-5 h-5 fill-amber-500 animate-bounce" />
            <span className="text-lg font-black text-slate-900 dark:text-slate-100">{streak}</span>
          </div>
          <div className="text-left">
            <p className="text-[10px] uppercase font-bold text-slate-400">Active Streak</p>
            <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Daily Health Record</p>
          </div>
        </div>
      </div>

      {/* XP Bar Track */}
      <div className="mt-4">
        <div className="flex justify-between items-center text-xs font-semibold mb-1.5 text-slate-500 dark:text-slate-400">
          <span>Rank Progress</span>
          <span className="text-teal-600 dark:text-teal-400">{progressPercent}% Completed</span>
        </div>
        <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 p-0.5 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-teal-500 via-emerald-400 to-cyan-500 shadow-sm"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Main HUD Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {/* HabitKit Heatmap Card */}
        <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-teal-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Health Consistency Heatmap
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Last 35 Days</span>
          </div>

          {/* Grid Squares */}
          <div className="grid grid-flow-col grid-rows-5 gap-1.5 justify-start">
            {HEATMAP_DAYS.map((d) => {
              const bgColors = [
                'bg-slate-200 dark:bg-slate-800/70',
                'bg-emerald-300 dark:bg-emerald-950/70 border border-emerald-400/30',
                'bg-emerald-400 dark:bg-emerald-700/80',
                'bg-emerald-500 dark:bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]',
              ];
              return (
                <div
                  key={d.day}
                  title={`${d.date} • Health Activity Level ${d.level}`}
                  className={`w-3.5 h-3.5 rounded-sm transition-transform hover:scale-125 cursor-pointer ${bgColors[d.level]}`}
                />
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-3 pt-2 text-[10px] text-slate-400 border-t border-slate-200/50 dark:border-slate-800">
            <span>Less Active</span>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-xs bg-slate-200 dark:bg-slate-800" />
              <div className="w-2.5 h-2.5 rounded-xs bg-emerald-300 dark:bg-emerald-950" />
              <div className="w-2.5 h-2.5 rounded-xs bg-emerald-400 dark:bg-emerald-700" />
              <div className="w-2.5 h-2.5 rounded-xs bg-emerald-500 dark:bg-emerald-500" />
            </div>
            <span>High Vitality</span>
          </div>
        </div>

        {/* Forest-inspired Vitality Garden / Daily Quests */}
        <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Daily Vitality Quests
                </span>
              </div>
              <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400">
                {quests.filter((q) => q.done).length}/{quests.length} Done
              </span>
            </div>

            <div className="space-y-2">
              {quests.map((q) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => toggleQuest(q.id)}
                  className={`w-full text-left flex items-center justify-between p-2 rounded-lg text-xs transition-colors border ${
                    q.done
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/40 text-slate-500 line-through'
                      : 'bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 hover:border-teal-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {q.done ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
                    )}
                    <span className="truncate">{q.text}</span>
                  </div>
                  <span className={`text-[10px] font-bold shrink-0 ml-2 px-1.5 py-0.5 rounded ${
                    q.done ? 'text-emerald-500' : 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50'
                  }`}>
                    +{q.xpReward} XP
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Badges Section */}
      {showBadges && (
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Unlocked Milestones & Badges</span>
            </span>
            <span className="text-[10px] text-slate-400">4 of 8 Unlocked</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {BADGES.map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.id}
                  className={`p-2.5 rounded-xl border flex flex-col items-center text-center group cursor-pointer transition-transform hover:-translate-y-0.5 ${b.color}`}
                >
                  <Icon className="w-5 h-5 mb-1.5" />
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100">{b.title}</span>
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{b.desc}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthHabitHUD;
