import { useMemo } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

const DAY_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function ForecastCalendarPage() {
  const { transactions, currency } = useFinance();
  const navigate = useNavigate();

  const data = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    // Compute average daily spend by day-of-week
    const byDow: Record<number, number[]> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      const d = new Date(t.date);
      const dow = d.getDay();
      const dayKey = t.date;
      // group by date first, then dow
      byDow[dow] = byDow[dow] || [];
      byDow[dow].push(t.amount);
    });
    // dailyByDate
    const dailyByDate: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      dailyByDate[t.date] = (dailyByDate[t.date] || 0) + t.amount;
    });
    // avg by dow
    const dowDailyAvg: Record<number, number> = {};
    for (let dow = 0; dow < 7; dow++) {
      const dates = Object.keys(dailyByDate).filter(d => new Date(d).getDay() === dow);
      const sum = dates.reduce((s, d) => s + dailyByDate[d], 0);
      dowDailyAvg[dow] = dates.length > 0 ? sum / dates.length : 0;
    }

    const cells: { day: number | null; date?: string; actual?: number; forecast?: number; isToday?: boolean; isPast?: boolean }[] = [];
    for (let i = 0; i < firstDay; i++) cells.push({ day: null });

    let totalForecast = 0;
    let totalActual = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dow = new Date(year, month, d).getDay();
      const isPast = d < today.getDate();
      const isToday = d === today.getDate();
      const actual = dailyByDate[dateStr] || 0;
      const forecast = Math.round(dowDailyAvg[dow] || 0);
      if (isPast || isToday) totalActual += actual;
      if (!isPast) totalForecast += forecast;
      cells.push({ day: d, date: dateStr, actual, forecast, isToday, isPast });
    }

    const monthName = today.toLocaleString('default', { month: 'long', year: 'numeric' });
    return { cells, monthName, totalForecast, totalActual, projected: totalActual + totalForecast };
  }, [transactions]);

  const exportPDF = async () => {
    try {
      const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
      pdf.setFontSize(20);
      pdf.text('Forecast Calendar', 40, 50);
      pdf.setFontSize(12);
      pdf.setTextColor(100);
      pdf.text(data.monthName, 40, 70);
      pdf.text(`Generated: ${new Date().toLocaleString()}`, 40, 88);

      pdf.setFontSize(14);
      pdf.setTextColor(0);
      pdf.text(`Actual so far: ${currency}${data.totalActual.toLocaleString()}`, 40, 120);
      pdf.text(`Forecast remaining: ${currency}${data.totalForecast.toLocaleString()}`, 40, 140);
      pdf.text(`Projected month total: ${currency}${data.projected.toLocaleString()}`, 40, 160);

      // Calendar grid
      const startY = 200;
      const cellW = 70;
      const cellH = 60;
      const startX = 40;

      // Day headers
      pdf.setFontSize(10);
      pdf.setTextColor(120);
      DAY_NAMES.forEach((d, i) => {
        pdf.text(d, startX + i * cellW + cellW / 2 - 3, startY - 6);
      });

      pdf.setDrawColor(220);
      data.cells.forEach((cell, i) => {
        const col = i % 7;
        const row = Math.floor(i / 7);
        const x = startX + col * cellW;
        const y = startY + row * cellH;
        pdf.rect(x, y, cellW, cellH);
        if (cell.day) {
          pdf.setFontSize(11);
          pdf.setTextColor(0);
          pdf.text(String(cell.day), x + 6, y + 14);
          if (cell.isPast || cell.isToday) {
            if ((cell.actual || 0) > 0) {
              pdf.setFontSize(8);
              pdf.setTextColor(180, 30, 30);
              pdf.text(`${currency}${(cell.actual || 0).toLocaleString()}`, x + 4, y + 30);
            }
          } else if ((cell.forecast || 0) > 0) {
            pdf.setFontSize(8);
            pdf.setTextColor(80, 80, 200);
            pdf.text(`~${currency}${(cell.forecast || 0).toLocaleString()}`, x + 4, y + 30);
          }
        }
      });

      pdf.setFontSize(9);
      pdf.setTextColor(120);
      pdf.text('Red = actual spend | Blue = forecast based on day-of-week average', 40, startY + 6 * cellH + 30);

      const filename = `forecast-calendar-${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(filename);
      toast.success('PDF exported!');
    } catch (e) {
      console.error(e);
      toast.error('PDF export failed');
    }
  };

  return (
    <div className="pb-28 px-4 pt-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold flex-1">📅 Forecast Calendar</h1>
        <button onClick={exportPDF} className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground">
          <FileText className="w-4 h-4" />
        </button>
      </div>

      {/* Summary */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl gradient-hero p-5 text-primary-foreground elevated-shadow mb-4">
        <p className="text-xs opacity-80">{data.monthName}</p>
        <p className="text-3xl font-extrabold mt-1">{currency}{data.projected.toLocaleString()}</p>
        <p className="text-[11px] opacity-80 mt-1">Projected month total</p>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="bg-primary-foreground/10 rounded-lg p-2">
            <p className="text-[10px] opacity-70">Actual so far</p>
            <p className="text-sm font-bold">{currency}{data.totalActual.toLocaleString()}</p>
          </div>
          <div className="bg-primary-foreground/10 rounded-lg p-2">
            <p className="text-[10px] opacity-70">Forecast remaining</p>
            <p className="text-sm font-bold">{currency}{data.totalForecast.toLocaleString()}</p>
          </div>
        </div>
      </motion.div>

      {/* Calendar */}
      <div className="bg-card rounded-2xl p-3 card-shadow">
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAY_NAMES.map((d, i) => (
            <div key={i} className="text-center text-[10px] font-bold text-muted-foreground py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {data.cells.map((c, i) => {
            if (!c.day) return <div key={i} className="aspect-square" />;
            const isPast = c.isPast || c.isToday;
            const value = isPast ? c.actual : c.forecast;
            const showValue = (value || 0) > 0;
            return (
              <div key={i} className={`aspect-square rounded-lg p-1 flex flex-col text-[9px] ${
                c.isToday ? 'bg-primary/15 border-2 border-primary' :
                isPast ? 'bg-secondary' : 'bg-card border border-dashed border-border'
              }`}>
                <span className={`font-bold text-[10px] ${c.isToday ? 'text-primary' : ''}`}>{c.day}</span>
                {showValue && (
                  <span className={`mt-auto truncate font-semibold ${
                    isPast ? 'text-expense' : 'text-savings opacity-70'
                  }`}>
                    {currency}{(value as number) > 999 ? `${Math.round((value as number) / 1000)}k` : value}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3 mt-4 text-[10px]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-expense" /> <span className="text-muted-foreground">Actual</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-savings opacity-70" /> <span className="text-muted-foreground">Forecast</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-primary/20 border border-primary" /> <span className="text-muted-foreground">Today</span>
        </div>
      </div>
    </div>
  );
}
