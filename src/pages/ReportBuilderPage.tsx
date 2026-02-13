import { useState, useMemo, useRef } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { PAYMENT_MODES } from '@/types/finance';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, FileText, Calendar, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ConfirmDialog';

const COLORS = ['#2d9d6f', '#e8553a', '#e89c3a', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#6366f1'];
type ChartType = 'pie' | 'bar' | 'line';

export default function ReportBuilderPage() {
  const { transactions, currency } = useFinance();
  const navigate = useNavigate();
  const reportRef = useRef<HTMLDivElement>(null);

  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedModes, setSelectedModes] = useState<string[]>([]);
  const [chartType, setChartType] = useState<ChartType>('pie');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [showDownloadConfirm, setShowDownloadConfirm] = useState(false);

  const allCategories = useMemo(() => [...new Set(transactions.map(t => t.category))].sort(), [transactions]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };
  const toggleMode = (mode: string) => {
    setSelectedModes(prev => prev.includes(mode) ? prev.filter(m => m !== mode) : [...prev, mode]);
  };

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      if (t.date < startDate || t.date > endDate) return false;
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (selectedCategories.length > 0 && !selectedCategories.includes(t.category)) return false;
      if (selectedModes.length > 0 && !selectedModes.includes(t.paymentMode || '')) return false;
      return true;
    });
  }, [transactions, startDate, endDate, filterType, selectedCategories, selectedModes]);

  const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(t => { map[t.category] = (map[t.category] || 0) + t.amount; });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filtered]);

  const dailyData = useMemo(() => {
    const map: Record<string, { income: number; expense: number }> = {};
    filtered.forEach(t => {
      if (!map[t.date]) map[t.date] = { income: 0, expense: 0 };
      map[t.date][t.type] += t.amount;
    });
    return Object.entries(map).sort().map(([date, data]) => ({
      date: date.slice(5),
      ...data,
    }));
  }, [filtered]);

  const paymentData = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(t => {
      const mode = t.paymentMode || 'Unknown';
      map[mode] = (map[mode] || 0) + t.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filtered]);

  const downloadCSV = () => {
    const headers = 'Date,Type,Category,Amount,Note,Payment Mode\n';
    const rows = filtered.map(t => `${t.date},${t.type},${t.category},${t.amount},"${t.note}",${t.paymentMode || 'N/A'}`).join('\n');
    const summary = `\n\nSummary\nTotal Income,${totalIncome}\nTotal Expense,${totalExpense}\nNet,${totalIncome - totalExpense}\nPeriod,${startDate} to ${endDate}\nTransactions,${filtered.length}`;
    const blob = new Blob([headers + rows + summary], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${startDate}-to-${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report downloaded!');
    setShowDownloadConfirm(false);
  };

  // Image download removed - using CSV only

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold flex-1">Report Builder</h1>
        <button onClick={() => setShowDownloadConfirm(true)} className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
          <Download className="w-5 h-5" />
        </button>
      </div>

      {/* Date Range */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-4 card-shadow mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold">Date Range</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-muted-foreground mb-1 block">From</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
              className="w-full bg-secondary rounded-lg py-2 px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground mb-1 block">To</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
              className="w-full bg-secondary rounded-lg py-2 px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card rounded-2xl p-4 card-shadow mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold">Filters</h3>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-muted-foreground mb-1 block">Type</label>
            <div className="flex gap-2">
              {(['all', 'income', 'expense'] as const).map(t => (
                <button key={t} onClick={() => setFilterType(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${filterType === t ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                  {t === 'all' ? 'All' : t === 'income' ? '💰 Income' : '💸 Expense'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground mb-1 block">Categories</label>
            <div className="flex flex-wrap gap-1.5">
              {allCategories.map(cat => (
                <button key={cat} onClick={() => toggleCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold ${selectedCategories.includes(cat) ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground mb-1 block">Payment Mode</label>
            <div className="flex flex-wrap gap-1.5">
              {PAYMENT_MODES.map(mode => (
                <button key={mode} onClick={() => toggleMode(mode)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold ${selectedModes.includes(mode) ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Chart Type */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex gap-2 mb-4">
        {([{ value: 'pie', label: '🥧 Pie' }, { value: 'bar', label: '📊 Bar' }, { value: 'line', label: '📈 Line' }] as { value: ChartType; label: string }[]).map(ct => (
          <button key={ct.value} onClick={() => setChartType(ct.value)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${chartType === ct.value ? 'bg-primary text-primary-foreground' : 'bg-card card-shadow text-muted-foreground'}`}>
            {ct.label}
          </button>
        ))}
      </motion.div>

      {/* Report Content */}
      <div ref={reportRef}>
        {/* Summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card rounded-2xl p-4 card-shadow mb-4">
          <h3 className="text-sm font-bold mb-3">📋 Report Summary</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-[10px] text-muted-foreground">Income</p>
              <p className="text-sm font-bold text-income">{currency}{totalIncome.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Expense</p>
              <p className="text-sm font-bold text-expense">{currency}{totalExpense.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Net</p>
              <p className={`text-sm font-bold ${totalIncome - totalExpense >= 0 ? 'text-income' : 'text-expense'}`}>
                {currency}{(totalIncome - totalExpense).toLocaleString()}
              </p>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2">{filtered.length} transactions • {startDate} to {endDate}</p>
        </motion.div>

        {/* Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-2xl p-5 card-shadow mb-4">
          <h3 className="text-sm font-bold mb-3">
            {chartType === 'pie' ? 'Category Breakdown' : chartType === 'bar' ? 'Category Comparison' : 'Daily Trend'}
          </h3>
          {categoryData.length === 0 && dailyData.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">No data for selected filters</p>
          ) : (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'pie' ? (
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                      {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => `${currency}${v.toLocaleString()}`} />
                  </PieChart>
                ) : chartType === 'bar' ? (
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: number) => `${currency}${v.toLocaleString()}`} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                ) : (
                  <LineChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: number) => `${currency}${v.toLocaleString()}`} />
                    <Line type="monotone" dataKey="income" stroke="#2d9d6f" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="expense" stroke="#e8553a" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          )}
          {chartType !== 'line' && categoryData.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {categoryData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1 text-[10px]">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="font-bold">{currency}{d.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Payment Mode Breakdown */}
        {paymentData.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-card rounded-2xl p-5 card-shadow mb-4">
            <h3 className="text-sm font-bold mb-3">💳 Payment Mode</h3>
            <div className="space-y-2">
              {paymentData.map(d => {
                const total = paymentData.reduce((s, p) => s + p.value, 0);
                const pct = Math.round((d.value / total) * 100);
                return (
                  <div key={d.name}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium">{d.name}</span>
                      <span className="font-bold">{currency}{d.value.toLocaleString()} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      <ConfirmDialog
        open={showDownloadConfirm}
        title="Download Report?"
        message={`Download report for ${startDate} to ${endDate} (${filtered.length} transactions)?`}
        confirmText="Download CSV"
        onConfirm={downloadCSV}
        onCancel={() => setShowDownloadConfirm(false)}
      />
    </div>
  );
}
