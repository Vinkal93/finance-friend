import { useMemo } from 'react';
import { useFinance } from '@/context/FinanceContext';
import TransactionItem from '@/components/TransactionItem';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, PiggyBank, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { transactions, currency } = useFinance();
  const navigate = useNavigate();

  const { totalIncome, totalExpense, balance } = useMemo(() => {
    const inc = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const exp = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { totalIncome: inc, totalExpense: exp, balance: inc - exp };
  }, [transactions]);

  const recentTx = transactions.slice(0, 5);

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-muted-foreground text-sm font-medium">Good morning 👋</p>
        <h1 className="text-2xl font-bold mt-1">My Finances</h1>
      </motion.div>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-5 rounded-2xl gradient-hero p-5 text-primary-foreground elevated-shadow"
      >
        <p className="text-sm opacity-80 font-medium">Total Balance</p>
        <p className="text-3xl font-extrabold mt-1">{currency}{balance.toLocaleString()}</p>
        <div className="flex gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] opacity-70">Income</p>
              <p className="text-sm font-bold">{currency}{totalIncome.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] opacity-70">Expenses</p>
              <p className="text-sm font-bold">{currency}{totalExpense.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-3 mt-5"
      >
        <div className="bg-card rounded-xl p-4 card-shadow cursor-pointer active:scale-[0.98] transition-transform" onClick={() => navigate('/budget')}>
          <div className="w-9 h-9 rounded-lg bg-accent/20 flex items-center justify-center mb-2">
            <PiggyBank className="w-5 h-5 text-accent" />
          </div>
          <p className="text-xs text-muted-foreground">Savings Rate</p>
          <p className="text-lg font-bold">{totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0}%</p>
        </div>
        <div className="bg-card rounded-xl p-4 card-shadow cursor-pointer active:scale-[0.98] transition-transform" onClick={() => navigate('/analytics')}>
          <div className="w-9 h-9 rounded-lg bg-savings/20 flex items-center justify-center mb-2">
            <TrendingUp className="w-5 h-5 text-savings" />
          </div>
          <p className="text-xs text-muted-foreground">Transactions</p>
          <p className="text-lg font-bold">{transactions.length}</p>
        </div>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold">Recent Transactions</h2>
          <button onClick={() => navigate('/analytics')} className="flex items-center gap-1 text-xs text-primary font-semibold">
            See all <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="bg-card rounded-xl p-3 card-shadow divide-y divide-border">
          {recentTx.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No transactions yet</p>
          ) : (
            recentTx.map(tx => <TransactionItem key={tx.id} transaction={tx} />)
          )}
        </div>
      </motion.div>
    </div>
  );
}
