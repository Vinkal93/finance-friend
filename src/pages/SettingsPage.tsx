import { useFinance } from '@/context/FinanceContext';
import { CURRENCY_OPTIONS } from '@/types/finance';
import { motion } from 'framer-motion';
import { ArrowLeft, Moon, Sun, Download, User, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { currency, setCurrency, userName, setUserName, monthlyIncome, setMonthlyIncome, transactions } = useFinance();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
  const [editName, setEditName] = useState(userName);
  const [editIncome, setEditIncome] = useState(String(monthlyIncome));

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('finance-dark-mode', String(next));
  };

  useEffect(() => {
    const saved = localStorage.getItem('finance-dark-mode') === 'true';
    setDarkMode(saved);
    document.documentElement.classList.toggle('dark', saved);
  }, []);

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

      {/* Currency */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card rounded-2xl p-5 card-shadow mb-4">
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

      {/* Dark Mode */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl p-5 card-shadow mb-4">
        <button onClick={toggleDark} className="w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            {darkMode ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
            <div className="text-left">
              <p className="text-sm font-bold">Dark Mode</p>
              <p className="text-xs text-muted-foreground">{darkMode ? 'On' : 'Off'}</p>
            </div>
          </div>
          <div className={`w-12 h-7 rounded-full p-1 transition-colors ${darkMode ? 'bg-primary' : 'bg-secondary'}`}>
            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${darkMode ? 'translate-x-5' : ''}`} />
          </div>
        </button>
      </motion.div>

      {/* Export */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card rounded-2xl p-5 card-shadow mb-4">
        <button onClick={exportCSV} className="w-full flex items-center gap-3">
          <Download className="w-5 h-5 text-primary" />
          <div className="text-left">
            <p className="text-sm font-bold">Export Transactions</p>
            <p className="text-xs text-muted-foreground">Download as CSV file</p>
          </div>
        </button>
      </motion.div>
    </div>
  );
}
