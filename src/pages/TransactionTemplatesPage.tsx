import { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useFinance } from '@/context/FinanceContext';
import { EXPENSE_ICONS, INCOME_ICONS, EMOJI_PICKER } from '@/types/finance';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, X, Zap, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ConfirmDialog';

interface Template {
  id: string;
  name: string;
  emoji: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  note: string;
  paymentMode: string;
}

export default function TransactionTemplatesPage() {
  const navigate = useNavigate();
  const { addTransaction, currency } = useFinance();
  const [templates, setTemplates] = useLocalStorage<Template[]>('finance-templates', [
    { id: '1', name: 'Morning Chai', emoji: '☕', type: 'expense', amount: 30, category: 'Food', note: 'Chai', paymentMode: 'Cash' },
    { id: '2', name: 'Uber Ride', emoji: '🚗', type: 'expense', amount: 200, category: 'Travel', note: 'Cab', paymentMode: 'UPI' },
    { id: '3', name: 'Groceries', emoji: '🛒', type: 'expense', amount: 500, category: 'Food', note: 'Weekly groceries', paymentMode: 'UPI' },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📌');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [note, setNote] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleCreate = () => {
    if (!name || !amount) { toast.error('Fill name & amount'); return; }
    setTemplates(prev => [...prev, { id: crypto.randomUUID(), name, emoji, type, amount: Number(amount), category, note, paymentMode }]);
    toast.success('Template created!');
    setShowForm(false);
    setName(''); setAmount(''); setNote('');
  };

  const useTemplate = (t: Template) => {
    addTransaction({ type: t.type, amount: t.amount, category: t.category, note: t.note, date: new Date().toISOString().split('T')[0], paymentMode: t.paymentMode });
    toast.success(`${t.emoji} ${t.name} added! ${currency}${t.amount}`);
  };

  const handleDelete = () => {
    if (deleteId) {
      setTemplates(prev => prev.filter(t => t.id !== deleteId));
      toast.success('Template deleted');
      setDeleteId(null);
    }
  };

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Templates</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <p className="text-sm text-muted-foreground mb-4">One-tap expense/income — no typing needed!</p>

      {templates.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-5xl mb-4 block">⚡</span>
          <p className="text-lg font-bold mb-1">No templates yet</p>
          <p className="text-sm text-muted-foreground">Create templates for your frequent transactions</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {templates.map(t => (
            <motion.div key={t.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-card rounded-xl p-4 card-shadow relative group">
              <button onClick={() => setDeleteId(t.id)} className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-secondary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-3 h-3 text-expense" />
              </button>
              <span className="text-3xl block mb-2">{t.emoji}</span>
              <p className="text-sm font-bold">{t.name}</p>
              <p className="text-xs text-muted-foreground">{currency}{t.amount} • {t.category}</p>
              <button onClick={() => useTemplate(t)}
                className="mt-3 w-full py-2 rounded-lg bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center gap-1 active:scale-95 transition-transform">
                <Zap className="w-3 h-3" /> Use Now
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="bg-card w-full max-w-lg rounded-t-2xl p-5 pb-28 max-h-[85vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">New Template</h2>
                <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Emoji & Name</label>
                  <div className="flex gap-2">
                    <button onClick={() => {}} className="w-12 h-12 rounded-xl border border-border bg-card flex items-center justify-center text-2xl">{emoji}</button>
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="Template name" className="flex-1 bg-secondary rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {EMOJI_PICKER.map(e => (
                      <button key={e} onClick={() => setEmoji(e)} className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${emoji === e ? 'bg-primary/10 ring-2 ring-primary/20' : 'bg-secondary'}`}>{e}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Amount</label>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" className="w-full bg-secondary rounded-xl py-3 px-4 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Category</label>
                  <input value={category} onChange={e => setCategory(e.target.value)} placeholder="Food" className="w-full bg-secondary rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Note</label>
                  <input value={note} onChange={e => setNote(e.target.value)} placeholder="Optional" className="w-full bg-secondary rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <button onClick={handleCreate} className="w-full py-3.5 rounded-xl gradient-primary text-primary-foreground font-bold active:scale-[0.98] transition-transform">
                  Create Template
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog open={!!deleteId} title="Delete Template?" message="This template will be removed." confirmText="Delete" destructive onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
