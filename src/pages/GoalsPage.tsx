import { useFinance } from '@/context/FinanceContext';
import { motion } from 'framer-motion';
import { Plus, Target } from 'lucide-react';

export default function GoalsPage() {
  const { goals, currency } = useFinance();

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Goals</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your savings goals</p>
        </div>
        <button className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
          <Plus className="w-5 h-5" />
        </button>
      </motion.div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-5 bg-card rounded-2xl p-5 card-shadow"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
            <Target className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Saved</p>
            <p className="text-xl font-extrabold">
              {currency}{goals.reduce((s, g) => s + g.savedAmount, 0).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              of {currency}{goals.reduce((s, g) => s + g.targetAmount, 0).toLocaleString()} target
            </p>
          </div>
        </div>
      </motion.div>

      {/* Goals List */}
      <div className="mt-6 space-y-3">
        {goals.map((goal, i) => {
          const pct = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
          const remaining = goal.targetAmount - goal.savedAmount;
          const deadlineDate = new Date(goal.deadline);
          const daysLeft = Math.max(0, Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              className="bg-card rounded-xl p-4 card-shadow"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{goal.icon}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold">{goal.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {daysLeft} days left
                      </p>
                    </div>
                    <span className="text-xs font-bold text-primary">{Math.round(pct)}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden mt-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                      className="h-full rounded-full bg-primary"
                    />
                  </div>
                  <div className="flex justify-between mt-2">
                    <p className="text-xs text-muted-foreground">
                      {currency}{goal.savedAmount.toLocaleString()} saved
                    </p>
                    <p className="text-xs font-medium">
                      {currency}{remaining.toLocaleString()} to go
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
