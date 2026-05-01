import { useMemo } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, AlertTriangle, Target, Calendar, Download, FileText } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { downloadFile } from '@/lib/download';

export default function PredictiveAnalyticsPage() {
  const { transactions, currency, monthlyIncome, budgets } = useFinance();
  const navigate = useNavigate();

  const analytics = useMemo(() => {
    // Group expenses by month
    const byMonth: Record<string, number> = {};
    const byMonthIncome: Record<string, number> = {};
    transactions.forEach(t => {
      const m = t.date.slice(0, 7);
      if (t.type === 'expense') byMonth[m] = (byMonth[m] || 0) + t.amount;
      else byMonthIncome[m] = (byMonthIncome[m] || 0) + t.amount;
    });

    const sortedMonths = Object.keys(byMonth).sort();
    const expenses = sortedMonths.map(m => byMonth[m]);
    const avgMonthly = expenses.length > 0 ? expenses.reduce((a, b) => a + b, 0) / expenses.length : 0;

    // Linear trend (last 3 months)
    const recent = expenses.slice(-3);
    const trend = recent.length >= 2 ? (recent[recent.length - 1] - recent[0]) / Math.max(recent.length - 1, 1) : 0;
    const nextMonthPredicted = Math.max(0, avgMonthly + trend);

    // 6-month savings projection
    const avgIncome = monthlyIncome > 0 ? monthlyIncome : (Object.values(byMonthIncome).reduce((a, b) => a + b, 0) / Math.max(Object.keys(byMonthIncome).length, 1));
    const monthlySaving = avgIncome - avgMonthly;
    const projection = Array.from({ length: 6 }, (_, i) => ({
      month: `M+${i + 1}`,
      saved: Math.round(Math.max(0, monthlySaving) * (i + 1)),
      expense: Math.round(avgMonthly + trend * (i + 1)),
    }));

    // Anomaly detection — categories with current spend > 1.5x average
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentByCat: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense' && t.date.startsWith(currentMonth)).forEach(t => {
      currentByCat[t.category] = (currentByCat[t.category] || 0) + t.amount;
    });
    const histByCat: Record<string, number[]> = {};
    sortedMonths.filter(m => m !== currentMonth).forEach(m => {
      transactions.filter(t => t.type === 'expense' && t.date.startsWith(m)).forEach(t => {
        if (!histByCat[t.category]) histByCat[t.category] = [];
        histByCat[t.category].push(t.amount);
      });
    });
    const anomalies: { category: string; current: number; avg: number; ratio: number }[] = [];
    Object.entries(currentByCat).forEach(([cat, current]) => {
      const hist = histByCat[cat] || [];
      const avg = hist.length > 0 ? hist.reduce((a, b) => a + b, 0) / Math.max(sortedMonths.length - 1, 1) : 0;
      if (avg > 0 && current > avg * 1.5) {
        anomalies.push({ category: cat, current, avg, ratio: current / avg });
      }
    });

    // Budget breach forecast (days remaining vs spend rate)
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const dayOfMonth = today.getDate();
    const budgetForecasts = budgets.map(b => {
      const dailyRate = b.spent / Math.max(dayOfMonth, 1);
      const projected = dailyRate * daysInMonth;
      const breachDay = dailyRate > 0 ? Math.ceil(b.limit / dailyRate) : null;
      return {
        ...b,
        projected: Math.round(projected),
        willBreach: projected > b.limit,
        breachDay: breachDay && breachDay <= daysInMonth ? breachDay : null,
      };
    });

    const chartData = sortedMonths.slice(-6).map(m => ({
      month: m.slice(5),
      expense: byMonth[m],
    }));
    chartData.push({ month: 'Next', expense: Math.round(nextMonthPredicted) });

    return { avgMonthly, nextMonthPredicted, projection, anomalies, budgetForecasts, chartData, monthlySaving };
  }, [transactions, monthlyIncome, budgets]);

  const exportCSV = () => {
    const lines: string[] = [];
    lines.push('Forecast Report');
    lines.push(`Generated,${new Date().toLocaleString()}`);
    lines.push('');
    lines.push('Next Month Prediction');
    lines.push(`Predicted Expense,${currency}${Math.round(analytics.nextMonthPredicted)}`);
    lines.push(`Avg Monthly Expense,${currency}${Math.round(analytics.avgMonthly)}`);
    lines.push(`Estimated Monthly Saving,${currency}${Math.round(analytics.monthlySaving)}`);
    lines.push('');
    lines.push('6-Month Savings Projection');
    lines.push('Month,Cumulative Saved,Projected Expense');
    analytics.projection.forEach(p => lines.push(`${p.month},${currency}${p.saved},${currency}${p.expense}`));
    lines.push('');
    lines.push('Budget Breach Forecast');
    lines.push('Category,Limit,Projected,Status,Breach Day');
    analytics.budgetForecasts.forEach(b =>
      lines.push(`${b.category},${currency}${b.limit},${currency}${b.projected},${b.willBreach ? 'WILL BREACH' : 'On Track'},${b.breachDay || '-'}`)
    );
    if (analytics.anomalies.length > 0) {
      lines.push('');
      lines.push('Anomalies (Unusual Spending)');
      lines.push('Category,This Month,Average,Ratio');
      analytics.anomalies.forEach(a =>
        lines.push(`${a.category},${currency}${Math.round(a.current)},${currency}${Math.round(a.avg)},${a.ratio.toFixed(2)}x`)
      );
    }
    downloadFile(`forecast-${new Date().toISOString().slice(0, 10)}.csv`, lines.join('\n'), 'text/csv');
  };

  const exportHTML = () => {
    const projRows = analytics.projection.map(p => `<tr><td>${p.month}</td><td>${currency}${p.saved.toLocaleString()}</td><td>${currency}${p.expense.toLocaleString()}</td></tr>`).join('');
    const budRows = analytics.budgetForecasts.map(b => `<tr><td>${b.category}</td><td>${currency}${b.limit.toLocaleString()}</td><td>${currency}${b.projected.toLocaleString()}</td><td style="color:${b.willBreach ? '#dc2626' : '#16a34a'}">${b.willBreach ? `Breach by day ${b.breachDay}` : 'On track'}</td></tr>`).join('');
    const anomRows = analytics.anomalies.map(a => `<tr><td>${a.category}</td><td>${currency}${Math.round(a.current).toLocaleString()}</td><td>${currency}${Math.round(a.avg).toLocaleString()}</td><td>${Math.round(a.ratio * 100)}%</td></tr>`).join('');
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Forecast Report</title><style>
body{font-family:-apple-system,sans-serif;max-width:800px;margin:24px auto;padding:0 20px;color:#1a1a1a}
h1{color:#1a7a4e}h2{margin-top:28px;border-bottom:2px solid #eee;padding-bottom:6px}
table{width:100%;border-collapse:collapse;margin-top:8px}th,td{padding:8px;text-align:left;border-bottom:1px solid #eee;font-size:13px}
th{background:#f5f7f5}.hero{background:linear-gradient(135deg,#1a7a4e,#0f5e3a);color:#fff;padding:20px;border-radius:12px;margin:16px 0}
.hero p{margin:4px 0}.big{font-size:28px;font-weight:800}.muted{color:#666;font-size:12px}
@media print{body{margin:0}}
</style></head><body>
<h1>📊 Forecast Report</h1>
<p class="muted">Generated ${new Date().toLocaleString()}</p>
<div class="hero">
  <p>Next Month Predicted Expense</p>
  <p class="big">${currency}${Math.round(analytics.nextMonthPredicted).toLocaleString()}</p>
  <p>Avg monthly: ${currency}${Math.round(analytics.avgMonthly).toLocaleString()} • Est. monthly saving: ${currency}${Math.round(analytics.monthlySaving).toLocaleString()}</p>
</div>
<h2>6-Month Savings Projection</h2>
<table><tr><th>Month</th><th>Cumulative Saved</th><th>Projected Expense</th></tr>${projRows}</table>
<h2>Budget Breach Forecast</h2>
<table><tr><th>Category</th><th>Limit</th><th>Projected</th><th>Status</th></tr>${budRows || '<tr><td colspan="4" class="muted">No budgets set</td></tr>'}</table>
${analytics.anomalies.length > 0 ? `<h2>⚠️ Unusual Spending Alerts</h2>
<table><tr><th>Category</th><th>This Month</th><th>Average</th><th>vs Normal</th></tr>${anomRows}</table>` : ''}
<p class="muted" style="margin-top:32px">Tip: Open this file and use your browser's "Print → Save as PDF" option to get a PDF.</p>
</body></html>`;
    downloadFile(`forecast-${new Date().toISOString().slice(0, 10)}.html`, html, 'text/html');
  };

  return (
    <div className="pb-28 px-4 pt-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold flex-1">📊 Predictive Analytics</h1>
      </div>

      {/* Export buttons */}
      <div className="grid grid-cols-2 gap-2 mb-5">
        <button onClick={exportCSV} className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-card card-shadow text-xs font-bold active:scale-95 transition-transform">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
        <button onClick={exportHTML} className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl gradient-primary text-primary-foreground text-xs font-bold active:scale-95 transition-transform">
          <FileText className="w-3.5 h-3.5" /> Export PDF
        </button>
      </div>


      {/* Next month prediction */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl gradient-hero p-5 text-primary-foreground elevated-shadow mb-4">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-4 h-4" />
          <p className="text-xs opacity-80 font-medium">Next Month Predicted Expense</p>
        </div>
        <p className="text-3xl font-extrabold mt-1">{currency}{Math.round(analytics.nextMonthPredicted).toLocaleString()}</p>
        <p className="text-[11px] opacity-80 mt-1">Based on your last {analytics.chartData.length - 1} months trend</p>
      </motion.div>

      {/* Trend chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card rounded-2xl p-4 card-shadow mb-4">
        <h3 className="text-sm font-bold mb-3">📈 Monthly Trend + Forecast</h3>
        {analytics.chartData.length > 1 ? (
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => `${currency}${v.toLocaleString()}`} />
                <Line type="monotone" dataKey="expense" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-6">Need more data to show trend</p>
        )}
      </motion.div>

      {/* 6-month projection */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl p-4 card-shadow mb-4">
        <h3 className="text-sm font-bold mb-1">🎯 6-Month Savings Projection</h3>
        <p className="text-[11px] text-muted-foreground mb-3">If you save {currency}{Math.round(analytics.monthlySaving).toLocaleString()}/month</p>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.projection}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => `${currency}${v.toLocaleString()}`} />
              <Bar dataKey="saved" radius={[6, 6, 0, 0]} fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3 text-center">
          <div className="bg-secondary rounded-lg p-2">
            <p className="text-[10px] text-muted-foreground">In 3 months</p>
            <p className="text-sm font-bold text-primary">{currency}{analytics.projection[2]?.saved.toLocaleString()}</p>
          </div>
          <div className="bg-secondary rounded-lg p-2">
            <p className="text-[10px] text-muted-foreground">In 6 months</p>
            <p className="text-sm font-bold text-primary">{currency}{analytics.projection[5]?.saved.toLocaleString()}</p>
          </div>
        </div>
      </motion.div>

      {/* Budget breach forecast */}
      {analytics.budgetForecasts.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card rounded-2xl p-4 card-shadow mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold">Budget Breach Forecast</h3>
          </div>
          <div className="space-y-3">
            {analytics.budgetForecasts.map(b => (
              <div key={b.id}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium">{b.category}</span>
                  <span className={`font-bold ${b.willBreach ? 'text-expense' : 'text-income'}`}>
                    {b.willBreach ? `Will breach by day ${b.breachDay}` : '✓ On track'}
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground mb-1">
                  Projected: {currency}{b.projected.toLocaleString()} / {currency}{b.limit.toLocaleString()}
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className={`h-full ${b.willBreach ? 'bg-expense' : 'bg-primary'}`}
                    style={{ width: `${Math.min((b.projected / b.limit) * 100, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Anomalies */}
      {analytics.anomalies.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-expense/5 border border-expense/20 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-expense" />
            <h3 className="text-sm font-bold text-expense">⚠️ Unusual Spending Detected</h3>
          </div>
          <div className="space-y-2">
            {analytics.anomalies.map(a => (
              <div key={a.category} className="bg-card rounded-lg p-3 text-xs">
                <p className="font-bold mb-1">{a.category} <span className="text-expense">({Math.round(a.ratio * 100)}% of normal)</span></p>
                <p className="text-muted-foreground">
                  This month: <b>{currency}{Math.round(a.current).toLocaleString()}</b> vs avg {currency}{Math.round(a.avg).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {analytics.chartData.length <= 1 && (
        <div className="text-center py-8">
          <span className="text-4xl block mb-2">📅</span>
          <p className="text-xs text-muted-foreground">Add transactions across multiple months to unlock predictive insights</p>
        </div>
      )}
    </div>
  );
}
