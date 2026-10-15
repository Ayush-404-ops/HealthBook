import React, { useState } from 'react';
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
  { id: 'hydrated', title: 'Hydro Pioneer', icon: Droplets, color: 'text-sky-500 bg-sky-500/10 border-sky-500/30', desc: 'Hit 2.5L daily hydration target 5 days straight' },
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
              style: { borderRadius: '8px', background: '#0f172a', color: '#38bdf8' },
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
    <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
      {/* Top Banner / Level HUD */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-base">
            Lvl {currentLevel}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-bold text-teal-700 dark:text-teal-400">
                Health Level Status
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
                Vitality Sentinel
              </span>
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>{xp} XP</span>
              <span className="text-xs font-normal text-slate-400">/ {nextLevelXp} to Next Rank</span>
            </div>
          </div>
        </div>

        {/* Streak HUD Counter */}
        <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-1 text-amber-500">
            <Flame className="w-4 h-4 fill-amber-500" />
            <span className="text-base font-bold text-slate-900 dark:text-slate-100">{streak}</span>
          </div>
          <div className="text-left">
            <p className="text-[10px] uppercase font-bold text-slate-400">Active Streak</p>
            <p className="text-[11px] font-medium text-teal-600 dark:text-teal-400">Daily Health Record</p>
          </div>
        </div>
      </div>

      {/* XP Bar Track */}
      <div className="mt-4">
        <div className="flex justify-between items-center text-xs font-medium mb-1.5 text-slate-500 dark:text-slate-400">
          <span>Rank Progress</span>
          <span className="text-teal-600 dark:text-teal-400 font-semibold">{progressPercent}% Completed</span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-teal-600"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main HUD Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
        {/* HabitKit Heatmap Card */}
        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-teal-600" />
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
                'bg-slate-200 dark:bg-slate-800',
                'bg-teal-200 dark:bg-teal-950',
                'bg-teal-400 dark:bg-teal-700',
                'bg-teal-600 dark:bg-teal-500',
              ];
              return (
                <div
                  key={d.day}
                  title={`${d.date} • Health Activity Level ${d.level}`}
                  className={`w-3.5 h-3.5 rounded-xs ${bgColors[d.level]}`}
                />
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-3 pt-2 text-[10px] text-slate-400 border-t border-slate-200 dark:border-slate-800">
            <span>Less Active</span>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-xs bg-slate-200 dark:bg-slate-800" />
              <div className="w-2.5 h-2.5 rounded-xs bg-teal-200 dark:bg-teal-950" />
              <div className="w-2.5 h-2.5 rounded-xs bg-teal-400 dark:bg-teal-700" />
              <div className="w-2.5 h-2.5 rounded-xs bg-teal-600 dark:bg-teal-500" />
            </div>
            <span>High Vitality</span>
          </div>
        </div>

        {/* Daily Quests */}
        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
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
                  className={`w-full text-left flex items-center justify-between p-2 rounded-md text-xs border ${
                    q.done
                      ? 'bg-teal-50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800/40 text-slate-500 line-through'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {q.done ? (
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
                    )}
                    <span className="truncate">{q.text}</span>
                  </div>
                  <span className={`text-[10px] font-bold shrink-0 ml-2 px-1.5 py-0.5 rounded ${
                    q.done ? 'text-teal-600' : 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950'
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
                  className={`p-2.5 rounded-lg border flex flex-col items-center text-center ${b.color}`}
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
