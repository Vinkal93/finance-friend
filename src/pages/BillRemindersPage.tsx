import { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useFinance } from '@/context/FinanceContext';
import { Bill } from '@/types/finance';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, X, Trash2, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ConfirmDialog';

const BILL_ICONS = ['⚡', '🏠', '📱', '🌐', '💧', '🔥', '📺', '🎵', '🏦', '🚗'];

export default function BillRemindersPage() {
  const navigate = useNavigate();
  const { currency } = useFinance();
  const [bills, setBills] = useLocalStorage<Bill[]>('finance-bills', []);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDay, setDueDay] = useState('1');
  const [icon, setIcon] = useState('⚡');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const today = new Date().getDate();

  const resetForm = () => { setName(''); setAmount(''); setDueDay('1'); setIcon('⚡'); setShowForm(false); };

  const handleAdd = () => {
    if (!name || !amount) { toast.error('Fill all fields'); return; }
    setBills(prev => [...prev, { id: crypto.randomUUID(), name, amount: Number(amount), dueDay: Number(dueDay), icon, isPaid: false }]);
    toast.success('Bill reminder added!');
    resetForm();
  };

  const togglePaid = (id: string) => {
    setBills(prev => prev.map(b => b.id === id ? { ...b, isPaid: !b.isPaid } : b));
  };

  const handleDelete = () => {
    if (deleteId) { setBills(prev => prev.filter(b => b.id !== deleteId)); toast.success('Bill deleted'); setDeleteId(null); }
  };

  const sorted = [...bills].sort((a, b) => a.dueDay - b.dueDay);
  const totalDue = bills.filter(b => !b.isPaid).reduce((s, b) => s + b.amount, 0);

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center"><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="text-xl font-bold">Bill Reminders</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground"><Plus className="w-5 h-5" /></button>
      </div>

      {/* Summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-5 card-shadow mb-6">
        <p className="text-xs text-muted-foreground">Total Due This Month</p>
        <p className="text-2xl font-extrabold text-expense">{currency}{totalDue.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground mt-1">{bills.filter(b => !b.isPaid).length} unpaid bills</p>
      </motion.div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="bg-card w-full max-w-lg rounded-t-2xl p-5 pb-10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Add Bill Reminder</h2>
                <button onClick={resetForm} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Icon</label>
                  <div className="flex flex-wrap gap-2">
                    {BILL_ICONS.map(i => (
                      <button key={i} onClick={() => setIcon(i)} className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border ${icon === i ? 'border-primary bg-primary/10' : 'border-border'}`}>{i}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Bill Name</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Electricity" className="w-full bg-secondary rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Amount</label>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" className="w-full bg-secondary rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Due Day (1-31)</label>
                  <input type="number" min="1" max="31" value={dueDay} onChange={e => setDueDay(e.target.value)} className="w-full bg-secondary rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <button onClick={handleAdd} className="w-full py-3.5 rounded-xl gradient-primary text-primary-foreground font-bold">Add Reminder</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bills List */}
      {sorted.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-5xl block mb-4">📋</span>
          <p className="text-lg font-bold">No bill reminders</p>
          <p className="text-sm text-muted-foreground">Add your first bill to get reminders</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((bill, i) => {
            const isOverdue = !bill.isPaid && bill.dueDay < today;
            const isDueToday = bill.dueDay === today;
            return (
              <motion.div key={bill.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className={`bg-card rounded-xl p-4 card-shadow ${isOverdue ? 'ring-2 ring-expense/30' : isDueToday ? 'ring-2 ring-warning/30' : ''}`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{bill.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{bill.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Due: {bill.dueDay}th {isOverdue && <span className="text-expense font-bold">• OVERDUE</span>}{isDueToday && <span className="text-warning font-bold">• DUE TODAY</span>}
                    </p>
                  </div>
                  <p className="text-sm font-bold">{currency}{bill.amount.toLocaleString()}</p>
                  <button onClick={() => togglePaid(bill.id)} className={`w-7 h-7 rounded-lg flex items-center justify-center ${bill.isPaid ? 'bg-income text-primary-foreground' : 'bg-secondary'}`}>
                    {bill.isPaid && <Check className="w-4 h-4" />}
                  </button>
                  <button onClick={() => setDeleteId(bill.id)} className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-expense"><Trash2 className="w-3 h-3" /></button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <ConfirmDialog open={!!deleteId} title="Delete Bill?" message="This bill reminder will be permanently removed." confirmText="Delete" destructive onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
