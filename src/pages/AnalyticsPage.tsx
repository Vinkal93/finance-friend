import { useMemo } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { EXPENSE_ICONS, ExpenseCategory } from '@/types/finance';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import TransactionItem from '@/components/TransactionItem';

const COLORS = ['#2d9d6f', '#e8553a', '#e89c3a', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#6366f1'];

export default function AnalyticsPage() {
  const { transactions, currency } = useFinance();

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  const weeklyData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, i) => ({
      day,
      income: Math.round(Math.random() * 5000 + 1000),
      expense: Math.round(Math.random() * 3000 + 500),
    }));
  }, []);

  const totalExpense = categoryData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">February 2026</p>
      </motion.div>

      {/* Pie Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-5 bg-card rounded-2xl p-5 card-shadow"
      >
        <h2 className="text-sm font-bold mb-3">Expense Breakdown</h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => `${currency}${v.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {categoryData.map((d, i) => (
            <div key={d.name} className="flex items-center gap-1.5 text-xs">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              <span className="text-muted-foreground">{d.name}</span>
              <span className="font-semibold">{Math.round((d.value / totalExpense) * 100)}%</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-4 bg-card rounded-2xl p-5 card-shadow"
      >
        <h2 className="text-sm font-bold mb-3">Weekly Overview</h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(140 10% 90%)" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(160 10% 45%)" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(160 10% 45%)" />
              <Tooltip formatter={(v: number) => `${currency}${v.toLocaleString()}`} />
              <Bar dataKey="income" fill="#2d9d6f" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="#e8553a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* All Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6"
      >
        <h2 className="text-base font-bold mb-3">All Transactions</h2>
        <div className="bg-card rounded-xl p-3 card-shadow divide-y divide-border">
          {transactions.map(tx => (
            <TransactionItem key={tx.id} transaction={tx} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
