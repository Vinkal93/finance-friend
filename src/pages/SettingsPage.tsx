import { useFinance } from '@/context/FinanceContext';
import { CURRENCY_OPTIONS } from '@/types/finance';
import { ThemeMode, AccentColor, FontSize } from '@/context/FinanceContext';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, User, DollarSign, Palette, RotateCcw, Lock, Type, Paintbrush, Phone, Zap, Sparkles, Package, CalendarDays, Info, ShieldCheck, FileText, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ConfirmDialog';
import ResetConfirmDialog from '@/components/ResetConfirmDialog';
import { downloadFile } from '@/lib/download';

const THEMES: { value: ThemeMode; label: string; icon: string; desc: string }[] = [
  { value: 'light', label: 'Light', icon: '☀️', desc: 'Clean & bright' },
  { value: 'dark', label: 'Dark', icon: '🌙', desc: 'Easy on eyes' },
  { value: 'glass', label: 'Glass', icon: '✨', desc: 'Glassmorphism' },
];

const ACCENTS: { value: AccentColor; label: string; color: string }[] = [
  { value: 'green', label: 'Green', color: 'bg-[hsl(152,58%,38%)]' },
  { value: 'blue', label: 'Blue', color: 'bg-[hsl(217,91%,60%)]' },
  { value: 'purple', label: 'Purple', color: 'bg-[hsl(270,70%,60%)]' },
  { value: 'orange', label: 'Orange', color: 'bg-[hsl(25,95%,55%)]' },
  { value: 'red', label: 'Red', color: 'bg-[hsl(0,72%,55%)]' },
  { value: 'teal', label: 'Teal', color: 'bg-[hsl(180,60%,40%)]' },
];

const FONT_SIZES: { value: FontSize; label: string; desc: string }[] = [
  { value: 'small', label: 'A', desc: 'Small' },
  { value: 'medium', label: 'A', desc: 'Medium' },
  { value: 'large', label: 'A', desc: 'Large' },
];

export default function SettingsPage() {
  const { currency, setCurrency, userName, setUserName, monthlyIncome, setMonthlyIncome, transactions, theme, setTheme, accentColor, setAccentColor, fontSize, setFontSize, resetAll } = useFinance();
  const navigate = useNavigate();
  const [editName, setEditName] = useState(userName);
  const [editIncome, setEditIncome] = useState(String(monthlyIncome));
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [phoneInput, setPhoneInput] = useState(localStorage.getItem('finance-recovery-phone') || '');
  const hasPin = !!localStorage.getItem('finance-pin');
  const recoveryPhone = localStorage.getItem('finance-recovery-phone') || '';

  const exportCSV = async () => {
    const headers = 'Date,Type,Category,Amount,Note,Payment Mode\n';
    const rows = transactions.map(t =>
      `${t.date},${t.type},${t.category},${t.amount},"${t.note}",${t.paymentMode || 'N/A'}`
    ).join('\n');
    await downloadFile(`transactions-${new Date().toISOString().split('T')[0]}.csv`, headers + rows, 'text/csv');
    setShowExportConfirm(false);
  };

  const saveName = () => { setUserName(editName); toast.success('Name updated!'); };
  const saveIncome = () => { setMonthlyIncome(Number(editIncome) || 0); toast.success('Monthly income updated!'); };

  const handlePinSave = () => {
    if (pinInput.length !== 4) {
      toast.error('PIN must be 4 digits');
      return;
    }
    localStorage.setItem('finance-pin', pinInput);
    if (phoneInput.trim()) {
      localStorage.setItem('finance-recovery-phone', phoneInput.trim());
      toast.success('PIN set with phone recovery!');
    } else {
      toast.success('PIN set (no recovery phone — add one for safety)');
    }
    setShowPinSetup(false);
    setPinInput('');
  };

  const removePin = () => {
    localStorage.removeItem('finance-pin');
    toast.success('PIN removed');
  };

  const savePhone = () => {
    if (phoneInput.trim()) {
      localStorage.setItem('finance-recovery-phone', phoneInput.trim());
      toast.success('Recovery phone updated');
    } else {
      localStorage.removeItem('finance-recovery-phone');
      toast.success('Recovery phone removed');
    }
  };

  return (
    <div className="pb-28 px-4 pt-6 max-w-lg mx-auto">
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
            <button key={t.value} onClick={() => setTheme(t.value)}
              className={`p-3 rounded-xl border text-center transition-all ${theme === t.value ? 'border-primary bg-primary/10 ring-2 ring-primary/20' : 'border-border'}`}>
              <span className="text-2xl block mb-1">{t.icon}</span>
              <p className="text-xs font-bold">{t.label}</p>
              <p className="text-[9px] text-muted-foreground">{t.desc}</p>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Accent Color */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="bg-card rounded-2xl p-5 card-shadow mb-4">
        <div className="flex items-center gap-3 mb-4">
          <Paintbrush className="w-5 h-5 text-primary" />
          <h2 className="text-sm font-bold">Accent Color</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {ACCENTS.map(a => (
            <button key={a.value} onClick={() => setAccentColor(a.value)}
              className={`flex flex-col items-center gap-1.5 transition-all`}>
              <div className={`w-10 h-10 rounded-full ${a.color} transition-all ${accentColor === a.value ? 'ring-4 ring-primary/30 scale-110' : ''}`} />
              <span className="text-[10px] font-semibold">{a.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Font Size */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl p-5 card-shadow mb-4">
        <div className="flex items-center gap-3 mb-4">
          <Type className="w-5 h-5 text-primary" />
          <h2 className="text-sm font-bold">Font Size</h2>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {FONT_SIZES.map((f, i) => (
            <button key={f.value} onClick={() => setFontSize(f.value)}
              className={`p-3 rounded-xl border text-center transition-all ${fontSize === f.value ? 'border-primary bg-primary/10 ring-2 ring-primary/20' : 'border-border'}`}>
              <span className={`block mb-1 font-bold ${i === 0 ? 'text-sm' : i === 1 ? 'text-lg' : 'text-2xl'}`}>{f.label}</span>
              <p className="text-[10px] text-muted-foreground">{f.desc}</p>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Currency */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="bg-card rounded-2xl p-5 card-shadow mb-4">
        <div className="flex items-center gap-3 mb-4">
          <DollarSign className="w-5 h-5 text-primary" />
          <h2 className="text-sm font-bold">Currency</h2>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {CURRENCY_OPTIONS.map(c => (
            <button key={c.symbol} onClick={() => { setCurrency(c.symbol); toast.success(`Currency set to ${c.name}`); }}
              className={`p-3 rounded-xl border text-center transition-all ${currency === c.symbol ? 'border-primary bg-primary/10 ring-2 ring-primary/20' : 'border-border'}`}>
              <span className="text-lg font-bold">{c.symbol}</span>
              <p className="text-[10px] text-muted-foreground">{c.name}</p>
            </button>
          ))}
        </div>
      </motion.div>

      {/* App Lock & Recovery Phone */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card rounded-2xl p-5 card-shadow mb-4">
        <div className="flex items-center gap-3 mb-4">
          <Lock className="w-5 h-5 text-primary" />
          <h2 className="text-sm font-bold">App Lock & Recovery</h2>
        </div>

        {/* Recovery phone */}
        <div className="mb-4">
          <label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
            <Phone className="w-3 h-3" /> Recovery Phone (optional)
          </label>
          <div className="flex gap-2">
            <input type="tel" value={phoneInput} onChange={e => setPhoneInput(e.target.value)}
              placeholder="e.g. 9876543210"
              className="flex-1 bg-secondary rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <button onClick={savePhone} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold">Save</button>
          </div>
          {recoveryPhone && (
            <p className="text-[10px] text-muted-foreground mt-1.5">
              Currently set: ••••••{recoveryPhone.slice(-2)} — used to recover access if you forget PIN
            </p>
          )}
        </div>

        {hasPin ? (
          <div className="flex gap-2">
            <button onClick={removePin} className="flex-1 py-2.5 rounded-xl bg-expense/10 text-expense text-xs font-semibold">Remove PIN</button>
            <button onClick={() => setShowPinSetup(true)} className="flex-1 py-2.5 rounded-xl bg-primary/10 text-primary text-xs font-semibold">Change PIN</button>
          </div>
        ) : (
          <button onClick={() => setShowPinSetup(true)} className="w-full py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-semibold">Set PIN Lock</button>
        )}
        {showPinSetup && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 space-y-2">
            <input type="password" maxLength={4} value={pinInput} onChange={e => setPinInput(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 4-digit PIN" className="w-full bg-secondary rounded-lg py-2.5 px-3 text-sm text-center tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <p className="text-[10px] text-muted-foreground">
              💡 Make sure your recovery phone is set above so you can recover access if you forget your PIN.
            </p>
            <div className="flex gap-2">
              <button onClick={() => { setShowPinSetup(false); setPinInput(''); }} className="flex-1 py-2 rounded-lg bg-secondary text-xs font-semibold">Cancel</button>
              <button onClick={handlePinSave} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold">Save PIN</button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Quick Add Settings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.17 }} className="bg-card rounded-2xl p-5 card-shadow mb-4">
        <button onClick={() => navigate('/quick-add-settings')} className="w-full flex items-center gap-3">
          <Zap className="w-5 h-5 text-primary" />
          <div className="text-left flex-1">
            <p className="text-sm font-bold">Quick Add Items</p>
            <p className="text-xs text-muted-foreground">Customize the ⚡ floating button</p>
          </div>
          <span className="text-muted-foreground">›</span>
        </button>
      </motion.div>

      {/* More */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="bg-card rounded-2xl card-shadow mb-4 overflow-hidden">
        {[
          { to: '/personalization', icon: Sparkles, label: 'Personalization', desc: 'Theme, accent, font, pull-to-refresh' },
          { to: '/bundles', icon: Package, label: 'Quick Bundles', desc: 'Save & apply transaction sets' },
          { to: '/forecast-calendar', icon: CalendarDays, label: 'Forecast Calendar', desc: 'Visual spending projection + PDF' },
          { to: '/about', icon: Info, label: 'About this App', desc: 'Features & how it works' },
          { to: '/privacy', icon: ShieldCheck, label: 'Privacy Policy', desc: 'How your data is handled' },
          { to: '/terms', icon: FileText, label: 'Terms of Use', desc: 'Conditions & disclaimers' },
        ].map((it, i, arr) => (
          <button key={it.to} onClick={() => navigate(it.to)}
            className={`w-full flex items-center gap-3 p-4 text-left active:bg-secondary transition-colors ${i < arr.length - 1 ? 'border-b border-border' : ''}`}>
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <it.icon className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold">{it.label}</p>
              <p className="text-[11px] text-muted-foreground truncate">{it.desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        ))}
      </motion.div>

      {/* Export */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.19 }} className="bg-card rounded-2xl p-5 card-shadow mb-4">
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
            <p className="text-xs text-muted-foreground">3-step confirmation • cannot be undone</p>
          </div>
        </button>
      </motion.div>

      <ResetConfirmDialog
        open={showResetConfirm}
        onConfirm={() => { resetAll(); setShowResetConfirm(false); }}
        onCancel={() => setShowResetConfirm(false)}
      />
      <ConfirmDialog open={showExportConfirm} title="Export Transactions?" message="This will download all your transactions as a CSV file. Continue?" confirmText="Export CSV" onConfirm={exportCSV} onCancel={() => setShowExportConfirm(false)} />
    </div>
  );
}
