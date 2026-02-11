import { useMemo } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CashFlowPage() {
  const navigate = useNavigate();
  const { transactions, currency } = useFinance();

  const forecast = useMemo(() => {
    const recurringIncome = transactions.filter(t => t.type === 'income' && t.recurring).reduce((s, t) => s + t.amount, 0);
    const recurringExpense = transactions.filter(t => t.type === 'expense' && t.recurring).reduce((s, t) => s + t.amount, 0);
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const currentBalance = totalIncome - totalExpense;

    const days: { day: number; balance: number; warning: boolean }[] = [];
    let runningBalance = currentBalance;
    const today = new Date().getDate();
    const dailyExpense = totalExpense / Math.max(today, 1);

    for (let d = today + 1; d <= 28; d++) {
      runningBalance -= dailyExpense;
      if (d === 1 || d === 15) runningBalance += recurringIncome / 2;
      days.push({ day: d, balance: Math.round(runningBalance), warning: runningBalance < totalExpense * 0.1 });
    }

    return { currentBalance, recurringIncome, recurringExpense, netRecurring: recurringIncome - recurringExpense, days, dailyExpense: Math.round(dailyExpense) };
  }, [transactions]);

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-xl font-bold">Cash Flow Forecast</h1>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-5 card-shadow mb-4">
        <p className="text-xs text-muted-foreground">Current Balance</p>
        <p className="text-2xl font-extrabold">{currency}{forecast.currentBalance.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground mt-1">Avg. daily spend: {currency}{forecast.dailyExpense.toLocaleString()}</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-card rounded-xl p-4 card-shadow">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-income" />
            <p className="text-xs text-muted-foreground">Recurring Income</p>
          </div>
          <p className="text-lg font-bold text-income">{currency}{forecast.recurringIncome.toLocaleString()}</p>
        </div>
        <div className="bg-card rounded-xl p-4 card-shadow">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-expense" />
            <p className="text-xs text-muted-foreground">Recurring Expense</p>
          </div>
          <p className="text-lg font-bold text-expense">{currency}{forecast.recurringExpense.toLocaleString()}</p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-2xl p-5 card-shadow mb-4">
        <h2 className="text-sm font-bold mb-3">Projected Balance (Rest of Month)</h2>
        <div className="space-y-2">
          {forecast.days.map((d, i) => (
            <div key={i} className={`flex items-center justify-between py-1.5 px-3 rounded-lg ${d.warning ? 'bg-expense/10' : ''}`}>
              <span className="text-xs font-medium">Feb {d.day}</span>
              <div className="flex items-center gap-2">
                {d.warning && <AlertTriangle className="w-3 h-3 text-expense" />}
                <span className={`text-xs font-bold ${d.balance < 0 ? 'text-expense' : d.warning ? 'text-warning' : 'text-foreground'}`}>
                  {currency}{d.balance.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {forecast.days.some(d => d.warning) && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-expense/5 border border-expense/20 rounded-2xl p-4">
          <p className="text-xs font-bold text-expense mb-1">⚠️ Low Balance Warning</p>
          <p className="text-xs text-foreground/80">Your projected balance may run low. Consider reducing discretionary spending.</p>
        </motion.div>
      )}
    </div>
  );
}
