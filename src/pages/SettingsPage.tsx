import { useFinance } from '@/context/FinanceContext';
import { CURRENCY_OPTIONS } from '@/types/finance';
import { ThemeMode } from '@/context/FinanceContext';
import { motion } from 'framer-motion';
import { ArrowLeft, Moon, Sun, Download, User, DollarSign, Palette, RotateCcw, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ConfirmDialog';

const THEMES: { value: ThemeMode; label: string; icon: string; desc: string }[] = [
  { value: 'light', label: 'Light', icon: '☀️', desc: 'Clean & bright' },
  { value: 'dark', label: 'Dark', icon: '🌙', desc: 'Easy on eyes' },
  { value: 'glass', label: 'Glass', icon: '✨', desc: 'Glassmorphism' },
];

export default function SettingsPage() {
  const { currency, setCurrency, userName, setUserName, monthlyIncome, setMonthlyIncome, transactions, theme, setTheme, resetAll } = useFinance();
  const navigate = useNavigate();
  const [editName, setEditName] = useState(userName);
  const [editIncome, setEditIncome] = useState(String(monthlyIncome));
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);

  const exportCSV = () => {
    const headers = 'Date,Type,Category,Amount,Note,Payment Mode\n';
    const rows = transactions.map(t =>
      `${t.date},${t.type},${t.category},${t.amount},"${t.note}",${t.paymentMode || 'N/A'}`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported successfully!');
    setShowExportConfirm(false);
  };

  const saveName = () => { setUserName(editName); toast.success('Name updated!'); };
  const saveIncome = () => { setMonthlyIncome(Number(editIncome) || 0); toast.success('Monthly income updated!'); };

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Settings</h1>
      </div>

      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-5 card-shadow mb-4">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-5 h-5 text-primary" />
          <h2 className="text-sm font-bold">Profile</h2>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Name</label>
            <div className="flex gap-2">
              <input value={editName} onChange={e => setEditName(e.target.value)} className="flex-1 bg-secondary rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <button onClick={saveName} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold">Save</button>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Monthly Income</label>
            <div className="flex gap-2">
              <input type="number" value={editIncome} onChange={e => setEditIncome(e.target.value)} className="flex-1 bg-secondary rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <button onClick={saveIncome} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold">Save</button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Theme */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card rounded-2xl p-5 card-shadow mb-4">
        <div className="flex items-center gap-3 mb-4">
          <Palette className="w-5 h-5 text-primary" />
          <h2 className="text-sm font-bold">Theme</h2>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {THEMES.map(t => (
            <button
              key={t.value}
              onClick={() => setTheme(t.value)}
              className={`p-3 rounded-xl border text-center transition-all ${
                theme === t.value ? 'border-primary bg-primary/10 ring-2 ring-primary/20' : 'border-border'
              }`}
            >
              <span className="text-2xl block mb-1">{t.icon}</span>
              <p className="text-xs font-bold">{t.label}</p>
              <p className="text-[9px] text-muted-foreground">{t.desc}</p>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Currency */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl p-5 card-shadow mb-4">
        <div className="flex items-center gap-3 mb-4">
          <DollarSign className="w-5 h-5 text-primary" />
          <h2 className="text-sm font-bold">Currency</h2>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {CURRENCY_OPTIONS.map(c => (
            <button
              key={c.symbol}
              onClick={() => { setCurrency(c.symbol); toast.success(`Currency set to ${c.name}`); }}
              className={`p-3 rounded-xl border text-center transition-all ${
                currency === c.symbol ? 'border-primary bg-primary/10 ring-2 ring-primary/20' : 'border-border'
              }`}
            >
              <span className="text-lg font-bold">{c.symbol}</span>
              <p className="text-[10px] text-muted-foreground">{c.name}</p>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Export */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card rounded-2xl p-5 card-shadow mb-4">
        <button onClick={() => setShowExportConfirm(true)} className="w-full flex items-center gap-3">
          <Download className="w-5 h-5 text-primary" />
          <div className="text-left">
            <p className="text-sm font-bold">Export Transactions</p>
            <p className="text-xs text-muted-foreground">Download as CSV file</p>
          </div>
        </button>
      </motion.div>

      {/* Reset */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-2xl p-5 card-shadow mb-4 border border-expense/20">
        <button onClick={() => setShowResetConfirm(true)} className="w-full flex items-center gap-3">
          <RotateCcw className="w-5 h-5 text-expense" />
          <div className="text-left">
            <p className="text-sm font-bold text-expense">Reset All Data</p>
            <p className="text-xs text-muted-foreground">Delete everything and start fresh</p>
          </div>
        </button>
      </motion.div>

      {/* Confirm Dialogs */}
      <ConfirmDialog
        open={showResetConfirm}
        title="Reset All Data?"
        message="This will permanently delete all your transactions, budgets, goals, and settings. This action cannot be undone. Are you sure?"
        confirmText="Reset Everything"
        destructive
        onConfirm={() => { resetAll(); setShowResetConfirm(false); }}
        onCancel={() => setShowResetConfirm(false)}
      />
      <ConfirmDialog
        open={showExportConfirm}
        title="Export Transactions?"
        message="This will download all your transactions as a CSV file. Continue?"
        confirmText="Export CSV"
        onConfirm={exportCSV}
        onCancel={() => setShowExportConfirm(false)}
      />
    </div>
  );
}
