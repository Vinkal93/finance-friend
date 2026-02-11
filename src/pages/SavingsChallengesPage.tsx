import { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useFinance } from '@/context/FinanceContext';
import { SavingsChallenge } from '@/types/finance';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Flame, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const PRESET_CHALLENGES = [
  { name: '52-Week Challenge', type: '52week', target: 137800, desc: 'Save ₹100 in week 1, ₹200 in week 2... up to ₹5200 in week 52' },
  { name: 'No-Spend Weekend', type: 'nospend', target: 5000, desc: 'Don\'t spend anything this weekend!' },
  { name: '₹500/Day Challenge', type: 'daily500', target: 15000, desc: 'Save ₹500 every day for 30 days' },
  { name: '30-Day Savings Sprint', type: '30day', target: 30000, desc: 'Save ₹1000 every day for a month' },
  { name: 'Coffee Fund Redirect', type: 'coffee', target: 6000, desc: 'Skip daily coffee, save ₹200/day for 30 days' },
];

export default function SavingsChallengesPage() {
  const navigate = useNavigate();
  const { currency } = useFinance();
  const [challenges, setChallenges] = useLocalStorage<SavingsChallenge[]>('finance-challenges', []);

  const joinChallenge = (preset: typeof PRESET_CHALLENGES[0]) => {
    const exists = challenges.find(c => c.type === preset.type && c.savedAmount < c.targetAmount);
    if (exists) { toast.error('You\'re already in this challenge!'); return; }
    const today = new Date().toISOString().split('T')[0];
    const end = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setChallenges(prev => [...prev, {
      id: crypto.randomUUID(), name: preset.name, type: preset.type,
      targetAmount: preset.target, savedAmount: 0, startDate: today, endDate: end, completedDays: [],
    }]);
    toast.success(`Joined "${preset.name}"! 🔥`);
  };

  const logSaving = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    setChallenges(prev => prev.map(c => {
      if (c.id !== id) return c;
      if (c.completedDays.includes(today)) { toast.info('Already logged today!'); return c; }
      const dailyTarget = Math.round(c.targetAmount / 30);
      const updated = { ...c, savedAmount: c.savedAmount + dailyTarget, completedDays: [...c.completedDays, today] };
      if (updated.savedAmount >= updated.targetAmount) {
        toast.success(`🎉 Challenge "${c.name}" completed!`);
      }
      return updated;
    }));
  };

  const getStreak = (days: string[]) => {
    if (days.length === 0) return 0;
    const sorted = [...days].sort().reverse();
    let streak = 1;
    for (let i = 1; i < sorted.length; i++) {
      const diff = (new Date(sorted[i - 1]).getTime() - new Date(sorted[i]).getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) streak++;
      else break;
    }
    return streak;
  };

  const activeChallenges = challenges.filter(c => c.savedAmount < c.targetAmount);
  const completedChallenges = challenges.filter(c => c.savedAmount >= c.targetAmount);

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-xl font-bold">Savings Challenges</h1>
      </div>

      {/* Active Challenges */}
      {activeChallenges.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold mb-3">🔥 Active Challenges</h2>
          <div className="space-y-3">
            {activeChallenges.map(ch => {
              const pct = Math.min((ch.savedAmount / ch.targetAmount) * 100, 100);
              const streak = getStreak(ch.completedDays);
              return (
                <motion.div key={ch.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl p-4 card-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold">{ch.name}</p>
                    <div className="flex items-center gap-1">
                      <Flame className="w-4 h-4 text-warning" />
                      <span className="text-xs font-bold text-warning">{streak} day streak</span>
                    </div>
                  </div>
                  <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden mb-2">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className="h-full bg-primary rounded-full" />
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">{currency}{ch.savedAmount.toLocaleString()} / {currency}{ch.targetAmount.toLocaleString()}</p>
                    <button onClick={() => logSaving(ch.id)} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold active:scale-95">
                      Log Today's Saving
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed */}
      {completedChallenges.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold mb-3">🏆 Completed</h2>
          <div className="space-y-2">
            {completedChallenges.map(ch => (
              <div key={ch.id} className="bg-income/5 border border-income/20 rounded-xl p-3 flex items-center gap-3">
                <Trophy className="w-5 h-5 text-income" />
                <div className="flex-1">
                  <p className="text-sm font-bold">{ch.name}</p>
                  <p className="text-xs text-muted-foreground">Saved {currency}{ch.savedAmount.toLocaleString()}</p>
                </div>
                <span className="text-income text-xs font-bold">✓ Done</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Join a Challenge */}
      <div>
        <h2 className="text-sm font-bold mb-3">🎯 Join a Challenge</h2>
        <div className="space-y-3">
          {PRESET_CHALLENGES.map((preset, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card rounded-xl p-4 card-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">{preset.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{preset.desc}</p>
                  <p className="text-xs font-semibold text-primary mt-1">Target: {currency}{preset.target.toLocaleString()}</p>
                </div>
                <button onClick={() => joinChallenge(preset)} className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
