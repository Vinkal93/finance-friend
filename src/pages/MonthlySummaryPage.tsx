import { useMemo } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { EXPENSE_ICONS } from '@/types/finance';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, TrendingUp, TrendingDown, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function MonthlySummaryPage() {
  const navigate = useNavigate();
  const { transactions, budgets, goals, currency } = useFinance();
  const [showExport, setShowExport] = useState(false);

  const summary = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const savings = income - expense;
    const savingsRate = income > 0 ? Math.round((savings / income) * 100) : 0;

    const catMap: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + t.amount; });
    const topCategories = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const budgetsExceeded = budgets.filter(b => b.spent > b.limit).length;
    const goalsProgress = goals.length > 0 ? Math.round(goals.reduce((s, g) => s + Math.min(g.savedAmount / g.targetAmount, 1), 0) / goals.length * 100) : 0;

    return { income, expense, savings, savingsRate, topCategories, budgetsExceeded, goalsProgress, totalTx: transactions.length };
  }, [transactions, budgets, goals]);

  const exportSummary = () => {
    const text = `Monthly Summary - February 2026\n\nIncome: ${currency}${summary.income.toLocaleString()}\nExpenses: ${currency}${summary.expense.toLocaleString()}\nSavings: ${currency}${summary.savings.toLocaleString()}\nSavings Rate: ${summary.savingsRate}%\n\nTop Categories:\n${summary.topCategories.map(([cat, amt]) => `  ${cat}: ${currency}${amt.toLocaleString()}`).join('\n')}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'monthly-summary-feb-2026.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Summary exported!');
    setShowExport(false);
  };

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center"><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="text-xl font-bold">Monthly Summary</h1>
        </div>
        <button onClick={() => setShowExport(true)} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
          <Download className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-6 card-shadow text-center mb-4">
        <p className="text-xs text-muted-foreground">February 2026</p>
        <p className="text-sm font-bold mt-1">Total Savings</p>
        <p className={`text-3xl font-extrabold mt-1 ${summary.savings >= 0 ? 'text-income' : 'text-expense'}`}>{currency}{summary.savings.toLocaleString()}</p>
        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${summary.savingsRate >= 20 ? 'bg-income/10 text-income' : 'bg-warning/10 text-warning'}`}>
          {summary.savingsRate}% saved
        </span>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card rounded-xl p-4 card-shadow">
          <TrendingUp className="w-5 h-5 text-income mb-2" />
          <p className="text-xs text-muted-foreground">Total Income</p>
          <p className="text-lg font-bold text-income">{currency}{summary.income.toLocaleString()}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl p-4 card-shadow">
          <TrendingDown className="w-5 h-5 text-expense mb-2" />
          <p className="text-xs text-muted-foreground">Total Expense</p>
          <p className="text-lg font-bold text-expense">{currency}{summary.expense.toLocaleString()}</p>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card rounded-2xl p-5 card-shadow mb-4">
        <h2 className="text-sm font-bold mb-3">Top Spending Categories</h2>
        <div className="space-y-3">
          {summary.topCategories.map(([cat, amt], i) => {
            const pct = summary.expense > 0 ? Math.round((amt / summary.expense) * 100) : 0;
            return (
              <div key={cat} className="flex items-center gap-3">
                <span className="text-lg">{EXPENSE_ICONS[cat] || '📌'}</span>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="text-xs font-medium">{cat}</p>
                    <p className="text-xs font-bold">{currency}{amt.toLocaleString()}</p>
                  </div>
                  <div className="w-full h-1.5 bg-secondary rounded-full mt-1">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground">{pct}%</span>
              </div>
            );
          })}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-card rounded-xl p-3 card-shadow text-center">
          <p className="text-2xl font-extrabold">{summary.totalTx}</p>
          <p className="text-[10px] text-muted-foreground">Transactions</p>
        </div>
        <div className="bg-card rounded-xl p-3 card-shadow text-center">
          <p className="text-2xl font-extrabold">{budgets.length - summary.budgetsExceeded}</p>
          <p className="text-[10px] text-muted-foreground">On Budget</p>
        </div>
        <div className="bg-card rounded-xl p-3 card-shadow text-center">
          <p className="text-2xl font-extrabold">{summary.goalsProgress}%</p>
          <p className="text-[10px] text-muted-foreground">Goal Progress</p>
        </div>
      </motion.div>

      {summary.budgetsExceeded > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-expense/5 border border-expense/20 rounded-2xl p-4 mb-4">
          <p className="text-xs font-bold text-expense">⚠️ {summary.budgetsExceeded} budget(s) exceeded this month</p>
        </motion.div>
      )}

      <ConfirmDialog open={showExport} title="Export Summary?" message="Download this monthly summary as a text file." confirmText="Export" onConfirm={exportSummary} onCancel={() => setShowExport(false)} />
    </div>
  );
}
