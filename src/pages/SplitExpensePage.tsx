import { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useFinance } from '@/context/FinanceContext';
import { SplitExpense } from '@/types/finance';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, X, Trash2, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function SplitExpensePage() {
  const navigate = useNavigate();
  const { currency } = useFinance();
  const [splits, setSplits] = useLocalStorage<SplitExpense[]>('finance-splits', []);
  const [showForm, setShowForm] = useState(false);
  const [desc, setDesc] = useState('');
  const [total, setTotal] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [peopleInput, setPeopleInput] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const resetForm = () => { setDesc(''); setTotal(''); setPaidBy(''); setPeopleInput(''); setShowForm(false); };

  const handleAdd = () => {
    if (!desc || !total || !peopleInput) { toast.error('Fill all fields'); return; }
    const names = peopleInput.split(',').map(n => n.trim()).filter(Boolean);
    if (names.length === 0) { toast.error('Add at least one person'); return; }
    const share = Math.round(Number(total) / (names.length + 1));
    const participants = names.map(name => ({ name, share, settled: false }));
    setSplits(prev => [...prev, { id: crypto.randomUUID(), description: desc, totalAmount: Number(total), date: new Date().toISOString().split('T')[0], paidBy: paidBy || 'You', participants }]);
    toast.success('Split expense added!');
    resetForm();
  };

  const toggleSettled = (splitId: string, personIdx: number) => {
    setSplits(prev => prev.map(s => {
      if (s.id !== splitId) return s;
      const participants = s.participants.map((p, i) => i === personIdx ? { ...p, settled: !p.settled } : p);
      return { ...s, participants };
    }));
  };

  const handleDelete = () => {
    if (deleteId) { setSplits(prev => prev.filter(s => s.id !== deleteId)); toast.success('Split deleted'); setDeleteId(null); }
  };

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center"><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="text-xl font-bold">Split Expense</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground"><Plus className="w-5 h-5" /></button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="bg-card w-full max-w-lg rounded-t-2xl p-5 pb-10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Split an Expense</h2>
                <button onClick={resetForm} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description</label>
                  <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="e.g. Dinner at restaurant" className="w-full bg-secondary rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Total Amount</label>
                  <input type="number" value={total} onChange={e => setTotal(e.target.value)} placeholder="0" className="w-full bg-secondary rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Paid By</label>
                  <input value={paidBy} onChange={e => setPaidBy(e.target.value)} placeholder="Your name" className="w-full bg-secondary rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Split With (comma separated)</label>
                  <input value={peopleInput} onChange={e => setPeopleInput(e.target.value)} placeholder="Rahul, Priya, Amit" className="w-full bg-secondary rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                {total && peopleInput && (
                  <div className="bg-primary/5 rounded-xl p-3">
                    <p className="text-xs text-muted-foreground">Per person: <span className="font-bold text-foreground">{currency}{Math.round(Number(total) / (peopleInput.split(',').filter(Boolean).length + 1)).toLocaleString()}</span></p>
                  </div>
                )}
                <button onClick={handleAdd} className="w-full py-3.5 rounded-xl gradient-primary text-primary-foreground font-bold">Split It!</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {splits.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-5xl block mb-4">✂️</span>
          <p className="text-lg font-bold">No split expenses</p>
          <p className="text-sm text-muted-foreground">Split bills with friends easily</p>
        </div>
      ) : (
        <div className="space-y-4">
          {splits.map((split, i) => (
            <motion.div key={split.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card rounded-xl p-4 card-shadow">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-bold">{split.description}</p>
                  <p className="text-xs text-muted-foreground">Paid by {split.paidBy} • {split.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold">{currency}{split.totalAmount.toLocaleString()}</p>
                  <button onClick={() => setDeleteId(split.id)} className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-expense"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
              <div className="space-y-2">
                {split.participants.map((p, pi) => (
                  <div key={pi} className="flex items-center justify-between bg-secondary/50 rounded-lg p-2.5">
                    <div className="flex items-center gap-2">
                      <Users className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs font-medium">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">{currency}{p.share.toLocaleString()}</span>
                      <button onClick={() => toggleSettled(split.id, pi)} className={`px-2 py-1 rounded text-[10px] font-bold ${p.settled ? 'bg-income/10 text-income' : 'bg-expense/10 text-expense'}`}>
                        {p.settled ? 'Settled' : 'Pending'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <ConfirmDialog open={!!deleteId} title="Delete Split?" message="This split expense will be removed." confirmText="Delete" destructive onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
