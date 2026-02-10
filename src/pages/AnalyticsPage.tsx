import { useMemo, useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { EXPENSE_ICONS, ExpenseCategory } from '@/types/finance';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';
import TransactionItem from '@/components/TransactionItem';
import { Search, Filter, TrendingUp, TrendingDown } from 'lucide-react';

const COLORS = ['#2d9d6f', '#e8553a', '#e89c3a', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#6366f1'];

type ViewPeriod = 'daily' | 'weekly' | 'monthly';

export default function AnalyticsPage() {
  const { transactions, currency } = useFinance();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [viewPeriod, setViewPeriod] = useState<ViewPeriod>('weekly');
  const [showFilters, setShowFilters] = useState(false);

  // Filtered transactions
  const filtered = useMemo(() => {
    return transactions.filter(t => {
      if (search && !t.note.toLowerCase().includes(search.toLowerCase()) && !t.category.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterCategory !== 'all' && t.category !== filterCategory) return false;
      if (filterType !== 'all' && t.type !== filterType) return false;
      return true;
    });
  }, [transactions, search, filterCategory, filterType]);

  // Category breakdown
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.filter(t => t.type === 'expense').forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filtered]);

  // Income vs Expense comparison
  const comparisonData = useMemo(() => {
    const income = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return [
      { name: 'Income', amount: income, fill: '#2d9d6f' },
      { name: 'Expense', amount: expense, fill: '#e8553a' },
    ];
  }, [filtered]);

  // Weekly trend data
  const weeklyData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayMap: Record<string, { income: number; expense: number }> = {};
    days.forEach(d => { dayMap[d] = { income: 0, expense: 0 }; });
    filtered.forEach(t => {
      const dayIdx = new Date(t.date).getDay();
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayIdx];
      if (dayMap[dayName]) {
        dayMap[dayName][t.type] += t.amount;
      }
    });
    return days.map(day => ({ day, ...dayMap[day] }));
  }, [filtered]);

  // Savings trend (monthly)
  const savingsData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
    return months.map((month, i) => ({
      month,
      savings: Math.round(Math.random() * 15000 + 5000 + i * 2000),
    }));
  }, []);

  // Smart insights
  const insights = useMemo(() => {
    const tips: string[] = [];
    const expenses = filtered.filter(t => t.type === 'expense');
    const totalExpense = expenses.reduce((s, t) => s + t.amount, 0);
    const catMap: Record<string, number> = {};
    expenses.forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + t.amount; });

    const topCat = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0];
    if (topCat) {
      const pct = Math.round((topCat[1] / totalExpense) * 100);
      tips.push(`${EXPENSE_ICONS[topCat[0] as ExpenseCategory] || '📊'} You spent ${pct}% on ${topCat[0]} (${currency}${topCat[1].toLocaleString()})`);
    }

    const income = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    if (income > 0 && totalExpense > 0) {
      const savingsRate = Math.round(((income - totalExpense) / income) * 100);
      tips.push(`💡 Your savings rate is ${savingsRate}%. ${savingsRate < 20 ? 'Try to save at least 20%!' : 'Great job saving!'}`);
    }

    if (catMap['Shopping'] && catMap['Shopping'] > 3000) {
      tips.push(`🛒 You can save ${currency}${Math.round(catMap['Shopping'] * 0.3).toLocaleString()} by reducing Shopping by 30%`);
    }

    return tips;
  }, [filtered, currency]);

  const totalExpense = categoryData.reduce((s, d) => s + d.value, 0);
  const allCategories = [...new Set(transactions.map(t => t.category))];

  // Expense heatmap data
  const heatmapData = useMemo(() => {
    const days: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      const day = t.date;
      days[day] = (days[day] || 0) + t.amount;
    });
    return Object.entries(days).map(([date, amount]) => ({ date, amount })).sort((a, b) => a.date.localeCompare(b.date));
  }, [transactions]);

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">February 2026</p>
      </motion.div>

      {/* Search & Filter */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mt-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search transactions..."
              className="w-full bg-card border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm card-shadow focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`w-10 h-10 rounded-xl border flex items-center justify-center ${showFilters ? 'bg-primary text-primary-foreground border-primary' : 'border-border bg-card'}`}>
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {showFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-3 space-y-3">
            <div className="flex gap-2">
              {['all', 'income', 'expense'].map(t => (
                <button key={t} onClick={() => setFilterType(t)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${filterType === t ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                  {t === 'all' ? 'All Types' : t === 'income' ? '💰 Income' : '💸 Expense'}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setFilterCategory('all')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${filterCategory === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>All</button>
              {allCategories.map(cat => (
                <button key={cat} onClick={() => setFilterCategory(cat)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${filterCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>{cat}</button>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* AI Smart Insights */}
      {insights.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-4 bg-primary/5 border border-primary/20 rounded-2xl p-4">
          <h2 className="text-sm font-bold mb-2 flex items-center gap-2">🧠 Smart Insights</h2>
          <div className="space-y-2">
            {insights.map((tip, i) => (
              <p key={i} className="text-xs text-foreground/80">{tip}</p>
            ))}
          </div>
        </motion.div>
      )}

      {/* Income vs Expense */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-4 bg-card rounded-2xl p-5 card-shadow">
        <h2 className="text-sm font-bold mb-3">Income vs Expense</h2>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(140 10% 90%)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => `${currency}${v.toLocaleString()}`} />
              <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                {comparisonData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Pie Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-4 bg-card rounded-2xl p-5 card-shadow">
        <h2 className="text-sm font-bold mb-3">Expense Breakdown</h2>
        {categoryData.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No expense data</p>
        ) : (
          <>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
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
          </>
        )}
      </motion.div>

      {/* Weekly Overview */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-4 bg-card rounded-2xl p-5 card-shadow">
        <h2 className="text-sm font-bold mb-3">Weekly Overview</h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(140 10% 90%)" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => `${currency}${v.toLocaleString()}`} />
              <Bar dataKey="income" fill="#2d9d6f" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="#e8553a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Savings Trend */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-4 bg-card rounded-2xl p-5 card-shadow">
        <h2 className="text-sm font-bold mb-3">Savings Trend</h2>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={savingsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(140 10% 90%)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => `${currency}${v.toLocaleString()}`} />
              <Line type="monotone" dataKey="savings" stroke="#2d9d6f" strokeWidth={2.5} dot={{ fill: '#2d9d6f', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Expense Heatmap */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mt-4 bg-card rounded-2xl p-5 card-shadow">
        <h2 className="text-sm font-bold mb-3">Expense Heatmap</h2>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 28 }, (_, i) => {
            const day = i + 1;
            const dateStr = `2026-02-${String(day).padStart(2, '0')}`;
            const entry = heatmapData.find(d => d.date === dateStr);
            const intensity = entry ? Math.min(entry.amount / 15000, 1) : 0;
            return (
              <div key={i} className="aspect-square rounded-sm relative group cursor-pointer" title={entry ? `${currency}${entry.amount.toLocaleString()}` : 'No expense'}
                style={{ backgroundColor: intensity > 0 ? `hsl(0, 72%, ${85 - intensity * 40}%)` : 'hsl(140, 10%, 94%)' }}>
                <span className="text-[8px] text-center block pt-0.5 font-medium">{day}</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground">
          <span>Less</span>
          {[0, 0.25, 0.5, 0.75, 1].map(v => (
            <div key={v} className="w-3 h-3 rounded-sm" style={{ backgroundColor: v > 0 ? `hsl(0, 72%, ${85 - v * 40}%)` : 'hsl(140, 10%, 94%)' }} />
          ))}
          <span>More</span>
        </div>
      </motion.div>

      {/* View Period Toggle */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold">All Transactions</h2>
          <div className="flex bg-secondary rounded-lg p-0.5">
            {(['daily', 'weekly', 'monthly'] as const).map(p => (
              <button key={p} onClick={() => setViewPeriod(p)} className={`px-2.5 py-1 rounded-md text-[10px] font-semibold ${viewPeriod === p ? 'bg-card text-foreground card-shadow' : 'text-muted-foreground'}`}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-card rounded-xl p-3 card-shadow divide-y divide-border">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-4xl mb-3 block">🔍</span>
              <p className="text-sm text-muted-foreground">No transactions found</p>
            </div>
          ) : (
            filtered.map(tx => <TransactionItem key={tx.id} transaction={tx} showActions />)
          )}
        </div>
      </motion.div>
    </div>
  );
}
