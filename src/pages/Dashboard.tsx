import { useMemo, useState, useEffect } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import TransactionItem from '@/components/TransactionItem';
import { SkeletonCard, SkeletonTransaction } from '@/components/SkeletonCard';
import PullToRefresh from '@/components/PullToRefresh';
import { motion, animate } from 'framer-motion';
import { TrendingUp, TrendingDown, PiggyBank, ArrowRight, Settings, LayoutGrid } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_WIDGETS, type DashboardWidget } from '@/pages/DashboardCustomizePage';

function AnimatedNumber({ value, currency }: { value: number; currency: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const controls = animate(display, value, {
      duration: 0.8,
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return controls.stop;
  }, [value]);
  return <>{currency}{display.toLocaleString()}</>;
}

const TOOLS = [
  { path: '/summary', icon: '📊', label: 'Summary' },
  { path: '/health-score', icon: '💯', label: 'Score' },
  { path: '/bills', icon: '📋', label: 'Bills' },
  { path: '/split', icon: '✂️', label: 'Split' },
  { path: '/subscriptions', icon: '📺', label: 'Subs' },
  { path: '/emi', icon: '🏦', label: 'EMI' },
  { path: '/cash-flow', icon: '📈', label: 'Forecast' },
  { path: '/net-worth', icon: '💰', label: 'Net Worth' },
  { path: '/challenges', icon: '🎯', label: 'Challenge' },
  { path: '/templates', icon: '⚡', label: 'Templates' },
  { path: '/smart-tags', icon: '🏷️', label: 'Tags' },
  { path: '/reports', icon: '📑', label: 'Reports' },
];

export default function Dashboard() {
  const { transactions, currency, userName, budgets, goals } = useFinance();
  const navigate = useNavigate();
  // Skeleton only on first load per session
  const [loading, setLoading] = useState(() => !sessionStorage.getItem('dashboard-loaded'));
  const [widgets] = useLocalStorage<DashboardWidget[]>('finance-dashboard-widgets', DEFAULT_WIDGETS);

  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => {
      setLoading(false);
      sessionStorage.setItem('dashboard-loaded', '1');
    }, 500);
    return () => clearTimeout(timer);
  }, [loading]);

  const { totalIncome, totalExpense, balance } = useMemo(() => {
    const inc = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const exp = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { totalIncome: inc, totalExpense: exp, balance: inc - exp };
  }, [transactions]);

  const recentTx = transactions.slice(0, 5);
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const handleRefresh = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    setLoading(false);
  };

  const isVisible = (id: string) => {
    const w = widgets.find(w => w.id === id);
    return w ? w.visible : true;
  };

  const getOrder = (id: string) => {
    const idx = widgets.findIndex(w => w.id === id);
    return idx >= 0 ? idx : 99;
  };

  // Sort widget sections by user order
  const sections = [
    { id: 'balance', order: getOrder('balance') },
    { id: 'quick-stats', order: getOrder('quick-stats') },
    { id: 'tools', order: getOrder('tools') },
    { id: 'monthly-summary', order: getOrder('monthly-summary') },
    { id: 'goals-progress', order: getOrder('goals-progress') },
    { id: 'budget-overview', order: getOrder('budget-overview') },
    { id: 'savings-tip', order: getOrder('savings-tip') },
    { id: 'recent-tx', order: getOrder('recent-tx') },
  ].sort((a, b) => a.order - b.order);

  if (loading) {
    return (
      <div className="pb-32 px-4 pt-6 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="h-4 w-32 bg-muted rounded-full mb-2 animate-pulse" />
            <div className="h-6 w-40 bg-muted rounded-full animate-pulse" />
          </div>
          <div className="w-9 h-9 rounded-xl bg-muted animate-pulse" />
        </div>
        <SkeletonCard className="mb-4" />
        <div className="grid grid-cols-2 gap-3 mb-5"><SkeletonCard /><SkeletonCard /></div>
        <SkeletonCard className="mb-4" />
        <div className="bg-card rounded-xl p-3 card-shadow">
          {[1, 2, 3].map(i => <SkeletonTransaction key={i} />)}
        </div>
      </div>
    );
  }

  const renderSection = (id: string, delay: number) => {
    if (!isVisible(id)) return null;

    switch (id) {
      case 'balance':
        return (
          <motion.div key={id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="rounded-2xl gradient-hero p-5 text-primary-foreground elevated-shadow">
            <p className="text-sm opacity-80 font-medium">Total Balance</p>
            <p className="text-3xl font-extrabold mt-1"><AnimatedNumber value={balance} currency={currency} /></p>
            <div className="flex gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-foreground/20 flex items-center justify-center"><TrendingUp className="w-4 h-4" /></div>
                <div><p className="text-[10px] opacity-70">Income</p><p className="text-sm font-bold"><AnimatedNumber value={totalIncome} currency={currency} /></p></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-foreground/20 flex items-center justify-center"><TrendingDown className="w-4 h-4" /></div>
                <div><p className="text-[10px] opacity-70">Expenses</p><p className="text-sm font-bold"><AnimatedNumber value={totalExpense} currency={currency} /></p></div>
              </div>
            </div>
          </motion.div>
        );

      case 'quick-stats':
        return (
          <motion.div key={id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="grid grid-cols-2 gap-3">
            <div className="bg-card rounded-xl p-4 card-shadow cursor-pointer active:scale-[0.98] transition-transform" onClick={() => navigate('/budget')}>
              <div className="w-9 h-9 rounded-lg bg-accent/20 flex items-center justify-center mb-2"><PiggyBank className="w-5 h-5 text-accent" /></div>
              <p className="text-xs text-muted-foreground">Savings Rate</p>
              <p className="text-lg font-bold">{totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0}%</p>
            </div>
            <div className="bg-card rounded-xl p-4 card-shadow cursor-pointer active:scale-[0.98] transition-transform" onClick={() => navigate('/analytics')}>
              <div className="w-9 h-9 rounded-lg bg-savings/20 flex items-center justify-center mb-2"><TrendingUp className="w-5 h-5 text-savings" /></div>
              <p className="text-xs text-muted-foreground">Transactions</p>
              <p className="text-lg font-bold">{transactions.length}</p>
            </div>
          </motion.div>
        );

      case 'tools':
        return (
          <motion.div key={id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
            <h2 className="text-base font-bold mb-3">Financial Tools</h2>
            <div className="grid grid-cols-4 gap-2">
              {TOOLS.map(tool => (
                <button key={tool.path} onClick={() => navigate(tool.path)}
                  className="bg-card rounded-xl p-2.5 card-shadow flex flex-col items-center gap-1 active:scale-[0.97] transition-transform">
                  <span className="text-xl">{tool.icon}</span>
                  <span className="text-[9px] font-semibold text-muted-foreground leading-tight text-center">{tool.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        );

      case 'monthly-summary':
        return (
          <motion.div key={id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
            <h2 className="text-sm font-bold mb-2">📊 Monthly Summary</h2>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div><p className="text-xs text-muted-foreground">Income</p><p className="text-sm font-bold text-income">{currency}{totalIncome.toLocaleString()}</p></div>
              <div><p className="text-xs text-muted-foreground">Expense</p><p className="text-sm font-bold text-expense">{currency}{totalExpense.toLocaleString()}</p></div>
              <div><p className="text-xs text-muted-foreground">Saved</p><p className="text-sm font-bold text-primary">{currency}{balance.toLocaleString()}</p></div>
            </div>
          </motion.div>
        );

      case 'goals-progress':
        return goals.length > 0 ? (
          <motion.div key={id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="bg-card rounded-2xl p-4 card-shadow">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold">🎯 Goals Progress</h2>
              <button onClick={() => navigate('/goals')} className="text-xs text-primary font-semibold flex items-center gap-1">View <ArrowRight className="w-3 h-3" /></button>
            </div>
            <div className="space-y-3">
              {goals.slice(0, 3).map(g => {
                const pct = Math.min(Math.round((g.savedAmount / g.targetAmount) * 100), 100);
                return (
                  <div key={g.id}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium">{g.icon} {g.name}</span>
                      <span className="font-bold">{pct}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} className="h-full bg-primary rounded-full" />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ) : null;

      case 'budget-overview':
        return budgets.length > 0 ? (
          <motion.div key={id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="bg-card rounded-2xl p-4 card-shadow">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold">💳 Budget Overview</h2>
              <button onClick={() => navigate('/budget')} className="text-xs text-primary font-semibold flex items-center gap-1">View <ArrowRight className="w-3 h-3" /></button>
            </div>
            <div className="space-y-2">
              {budgets.slice(0, 3).map(b => {
                const pct = Math.min(Math.round((b.spent / b.limit) * 100), 100);
                const isOver = pct >= 100;
                return (
                  <div key={b.id}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium">{b.category}</span>
                      <span className={`font-bold ${isOver ? 'text-expense' : ''}`}>{currency}{b.spent.toLocaleString()} / {currency}{b.limit.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${isOver ? 'bg-expense' : 'bg-primary'}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ) : null;

      case 'savings-tip':
        return (
          <motion.div key={id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="bg-accent/10 border border-accent/20 rounded-2xl p-4">
            <p className="text-xs font-bold mb-1">💡 Savings Tip</p>
            <p className="text-[11px] text-muted-foreground">
              {totalExpense > totalIncome * 0.7
                ? "You're spending over 70% of income. Try the 50-30-20 rule: 50% needs, 30% wants, 20% savings."
                : balance > 0
                ? `Great job! You saved ${currency}${balance.toLocaleString()} this month. Keep it up! 🎉`
                : "Track every expense to find hidden savings. Even small amounts add up over time!"}
            </p>
          </motion.div>
        );

      case 'recent-tx':
        return (
          <motion.div key={id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold">Recent Transactions</h2>
              <button onClick={() => navigate('/analytics')} className="flex items-center gap-1 text-xs text-primary font-semibold">
                See all <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="bg-card rounded-xl p-3 card-shadow divide-y divide-border">
              {recentTx.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-5xl mb-3 block">📝</span>
                  <p className="text-sm font-semibold mb-1">No transactions yet</p>
                  <p className="text-xs text-muted-foreground">Tap + to add your first one</p>
                </div>
              ) : (
                recentTx.map(tx => <TransactionItem key={tx.id} transaction={tx} />)
              )}
            </div>
          </motion.div>
        );

      default: return null;
    }
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="pb-32 px-4 pt-6 max-w-lg mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-5">
          <div>
            <p className="text-muted-foreground text-sm font-medium">{greeting} 👋</p>
            <h1 className="text-2xl font-bold mt-1">{userName || 'My Finances'}</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/customize-dashboard')} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
              <LayoutGrid className="w-5 h-5 text-muted-foreground" />
            </button>
            <button onClick={() => navigate('/settings')} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </motion.div>

        {/* Dynamic sections based on widget order */}
        <div className="space-y-4">
          {sections.map((s, i) => renderSection(s.id, 0.05 + i * 0.05))}
        </div>
      </div>
    </PullToRefresh>
  );
}
