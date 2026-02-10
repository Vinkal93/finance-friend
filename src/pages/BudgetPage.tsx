import { useFinance } from '@/context/FinanceContext';
import { EXPENSE_ICONS, ExpenseCategory } from '@/types/finance';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

export default function BudgetPage() {
  const { budgets, currency } = useFinance();

  const totalLimit = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const overallPct = totalLimit > 0 ? Math.min((totalSpent / totalLimit) * 100, 100) : 0;

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Budget</h1>
        <p className="text-sm text-muted-foreground mt-1">February 2026</p>
      </motion.div>

      {/* Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-5 bg-card rounded-2xl p-5 card-shadow"
      >
        <div className="flex justify-between items-end mb-3">
          <div>
            <p className="text-xs text-muted-foreground">Total Spent</p>
            <p className="text-2xl font-extrabold">{currency}{totalSpent.toLocaleString()}</p>
          </div>
          <p className="text-sm text-muted-foreground">of {currency}{totalLimit.toLocaleString()}</p>
        </div>
        <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${overallPct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full ${overallPct > 90 ? 'bg-expense' : overallPct > 70 ? 'bg-warning' : 'bg-primary'}`}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">{Math.round(overallPct)}% of budget used</p>
      </motion.div>

      {/* Category Budgets */}
      <div className="mt-6 space-y-3">
        {budgets.map((budget, i) => {
          const pct = budget.limit > 0 ? Math.min((budget.spent / budget.limit) * 100, 100) : 0;
          const isOver = budget.spent >= budget.limit;

          return (
            <motion.div
              key={budget.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              className={`bg-card rounded-xl p-4 card-shadow ${isOver ? 'ring-2 ring-expense/30' : ''}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">{EXPENSE_ICONS[budget.category as ExpenseCategory]}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-semibold">{budget.category}</p>
                    {isOver && <AlertTriangle className="w-4 h-4 text-expense" />}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {currency}{budget.spent.toLocaleString()} / {currency}{budget.limit.toLocaleString()}
                  </p>
                </div>
                <span className={`text-xs font-bold ${isOver ? 'text-expense' : 'text-primary'}`}>
                  {Math.round(pct)}%
                </span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, delay: 0.2 + i * 0.05 }}
                  className={`h-full rounded-full ${isOver ? 'bg-expense' : pct > 70 ? 'bg-warning' : 'bg-primary'}`}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
